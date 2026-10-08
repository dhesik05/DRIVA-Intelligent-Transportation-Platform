from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import (
    Booking, BookingStatus, TransportRequest, RequestStatus,
    Vehicle, VehicleStatus, Driver, Provider, TrackingUpdate,
    MLPrediction, AIRecommendation, User, UserRole
)
from app.schemas import BookingCreate, BookingOut, BookingStatusUpdate, BookingWithDetails
from datetime import datetime

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(TransportRequest).filter(TransportRequest.id == data.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Transport request not found")
    if req.business_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    if req.status == RequestStatus.BOOKED:
        raise HTTPException(status_code=400, detail="Request already booked")

    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vehicle is not available")

    provider = db.query(Provider).filter(Provider.id == data.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Get ML prediction for this pair
    pred = (
        db.query(MLPrediction)
        .filter(MLPrediction.request_id == data.request_id, MLPrediction.vehicle_id == data.vehicle_id)
        .order_by(MLPrediction.created_at.desc())
        .first()
    )

    # Get match score from AI recommendation
    ai_rec = db.query(AIRecommendation).filter(AIRecommendation.request_id == data.request_id).first()
    match_score = ai_rec.match_score if ai_rec else None

    quoted_price = pred.predicted_cost if pred else 5000.0
    eta_hours = pred.predicted_eta_hours if pred else 7.0
    commission = quoted_price * 0.05

    booking = Booking(
        request_id=data.request_id,
        provider_id=data.provider_id,
        vehicle_id=data.vehicle_id,
        quoted_price=quoted_price,
        estimated_eta_hours=eta_hours,
        match_score=match_score,
        commission_rate=0.05,
        driva_commission=commission,
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking)
    db.flush()

    # Update vehicle status
    vehicle.status = VehicleStatus.ASSIGNED

    # Update request status
    req.status = RequestStatus.BOOKED

    # Initial tracking record
    db.add(TrackingUpdate(
        booking_id=booking.id,
        status=BookingStatus.CONFIRMED,
        notes="Booking confirmed by business",
    ))

    # Try to auto-assign an available driver from provider
    driver = (
        db.query(Driver)
        .filter(Driver.user_id == provider.user_id, Driver.is_available == True)
        .first()
    )
    if driver:
        booking.driver_id = driver.id
        booking.status = BookingStatus.DRIVER_ASSIGNED
        driver.is_available = False
        db.add(TrackingUpdate(
            booking_id=booking.id,
            status=BookingStatus.DRIVER_ASSIGNED,
            notes=f"Driver assigned",
        ))

    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingOut])
def list_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Booking)
    if current_user.role == UserRole.BUSINESS_OWNER:
        q = q.join(TransportRequest).filter(TransportRequest.business_id == current_user.id)
    elif current_user.role in (UserRole.FLEET_OWNER, UserRole.LOGISTICS_AGENCY):
        provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if provider:
            q = q.filter(Booking.provider_id == provider.id)
    elif current_user.role == UserRole.DRIVER:
        driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
        if driver:
            q = q.filter(Booking.driver_id == driver.id)
    return q.order_by(Booking.created_at.desc()).limit(50).all()


@router.get("/{booking_id}", response_model=BookingWithDetails)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.provider),
            joinedload(Booking.vehicle),
            joinedload(Booking.request),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    old_status = booking.status
    booking.status = data.status

    if data.status == BookingStatus.IN_TRANSIT:
        booking.pickup_time = datetime.utcnow()
        vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()
        if vehicle:
            vehicle.status = VehicleStatus.IN_TRANSIT

    elif data.status == BookingStatus.DELIVERED:
        booking.delivered_time = datetime.utcnow()
        vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
        driver = db.query(Driver).filter(Driver.id == booking.driver_id).first()
        if driver:
            driver.is_available = True
            driver.completed_trips = (driver.completed_trips or 0) + 1
        provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
        if provider:
            provider.completed_deliveries = (provider.completed_deliveries or 0) + 1

    db.add(TrackingUpdate(
        booking_id=booking.id,
        status=data.status,
        location=data.location,
        notes=data.notes,
    ))

    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}/tracking")
def get_tracking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    req = db.query(TransportRequest).filter(TransportRequest.id == booking.request_id).first()
    updates = db.query(TrackingUpdate).filter(TrackingUpdate.booking_id == booking_id).order_by(TrackingUpdate.updated_at).all()

    return {
        "booking_id": booking_id,
        "current_status": booking.status,
        "pickup_location": req.pickup_location if req else "",
        "destination": req.destination if req else "",
        "updates": [
            {"status": u.status.value, "location": u.location, "notes": u.notes, "timestamp": u.updated_at.isoformat()}
            for u in updates
        ],
    }
