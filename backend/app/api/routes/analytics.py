from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import (
    User, UserRole, Booking, BookingStatus, TransportRequest,
    Vehicle, Provider, Rating
)
from app.schemas import AdminAnalytics, BusinessAnalytics

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/admin", response_model=AdminAnalytics)
def admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN")),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_businesses = db.query(func.count(User.id)).filter(User.role == UserRole.BUSINESS_OWNER).scalar()
    total_fleet = db.query(func.count(User.id)).filter(User.role == UserRole.FLEET_OWNER).scalar()
    total_agencies = db.query(func.count(User.id)).filter(User.role == UserRole.LOGISTICS_AGENCY).scalar()
    total_drivers = db.query(func.count(User.id)).filter(User.role == UserRole.DRIVER).scalar()
    total_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.is_active == True).scalar()

    total_bookings = db.query(func.count(Booking.id)).scalar()
    gmv = db.query(func.sum(Booking.quoted_price)).scalar() or 0.0
    revenue = db.query(func.sum(Booking.driva_commission)).scalar() or 0.0
    avg_match = db.query(func.avg(Booking.match_score)).scalar() or 0.0
    avg_value = db.query(func.avg(Booking.quoted_price)).scalar() or 0.0
    active_providers = db.query(func.count(Provider.id)).filter(Provider.is_active == True).scalar()

    return AdminAnalytics(
        total_users=total_users,
        total_businesses=total_businesses,
        total_fleet_owners=total_fleet,
        total_agencies=total_agencies,
        total_drivers=total_drivers,
        total_vehicles=total_vehicles,
        total_bookings=total_bookings,
        total_gmv=round(float(gmv), 2),
        driva_revenue=round(float(revenue), 2),
        avg_match_score=round(float(avg_match), 2),
        avg_booking_value=round(float(avg_value), 2),
        active_providers=active_providers,
    )


@router.get("/business", response_model=BusinessAnalytics)
def business_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.BUSINESS_OWNER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")

    requests = db.query(TransportRequest).filter(TransportRequest.business_id == current_user.id)
    total_requests = requests.count()

    active = (
        db.query(func.count(Booking.id))
        .join(TransportRequest)
        .filter(
            TransportRequest.business_id == current_user.id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.DRIVER_ASSIGNED,
                                 BookingStatus.IN_TRANSIT, BookingStatus.PICKUP_COMPLETED])
        )
        .scalar()
    )

    completed = (
        db.query(func.count(Booking.id))
        .join(TransportRequest)
        .filter(
            TransportRequest.business_id == current_user.id,
            Booking.status == BookingStatus.DELIVERED
        )
        .scalar()
    )

    total_spend = (
        db.query(func.sum(Booking.quoted_price))
        .join(TransportRequest)
        .filter(TransportRequest.business_id == current_user.id)
        .scalar()
    ) or 0.0

    avg_cost = total_spend / max(1, completed) if completed else 0.0
    recent = requests.order_by(TransportRequest.created_at.desc()).limit(10).all()

    from app.schemas import TransportRequestOut
    return BusinessAnalytics(
        total_requests=total_requests,
        active_deliveries=active,
        completed_deliveries=completed,
        total_spend=round(float(total_spend), 2),
        avg_cost_per_delivery=round(avg_cost, 2),
        recent_requests=[TransportRequestOut.model_validate(r) for r in recent],
    )


@router.get("/fleet")
def fleet_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    total_bookings = db.query(func.count(Booking.id)).filter(Booking.provider_id == provider.id).scalar() if provider else 0
    total_revenue = db.query(func.sum(Booking.quoted_price)).filter(Booking.provider_id == provider.id).scalar() or 0.0
    completed = db.query(func.count(Booking.id)).filter(
        Booking.provider_id == provider.id,
        Booking.status == BookingStatus.DELIVERED
    ).scalar() if provider else 0
    vehicles = db.query(func.count(Vehicle.id)).filter(
        Vehicle.provider_id == provider.id,
        Vehicle.is_active == True
    ).scalar() if provider else 0

    return {
        "total_bookings": total_bookings,
        "total_revenue": float(total_revenue),
        "completed_deliveries": completed,
        "total_vehicles": vehicles,
        "provider_rating": provider.provider_rating if provider else 0,
        "reliability_score": provider.reliability_score if provider else 0,
    }
