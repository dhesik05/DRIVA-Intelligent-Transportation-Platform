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


@router.get("/platform", response_model=AdminAnalytics)
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
    
    # Vehicle status breakdown
    from app.models import VehicleStatus, RequestStatus
    available_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.is_active == True, Vehicle.status == VehicleStatus.AVAILABLE).scalar()
    assigned_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.is_active == True, Vehicle.status == VehicleStatus.ASSIGNED).scalar()
    in_transit_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.is_active == True, Vehicle.status == VehicleStatus.IN_TRANSIT).scalar()
    maintenance_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.is_active == True, Vehicle.status == VehicleStatus.MAINTENANCE).scalar()
    
    # Request & Delivery stats
    pending_requests = db.query(func.count(TransportRequest.id)).filter(TransportRequest.status == RequestStatus.PENDING).scalar()
    active_deliveries = db.query(func.count(Booking.id)).filter(Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.DRIVER_ASSIGNED, BookingStatus.IN_TRANSIT, BookingStatus.PICKUP_COMPLETED])).scalar()
    completed_deliveries = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.DELIVERED).scalar()
    
    avg_eta_hours = db.query(func.avg(Booking.estimated_eta_hours)).scalar() or 0.0

    gmv = db.query(func.sum(Booking.quoted_price)).scalar() or 0.0
    revenue = db.query(func.sum(Booking.driva_service_fee)).scalar() or 0.0
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
        available_vehicles=available_vehicles,
        assigned_vehicles=assigned_vehicles,
        in_transit_vehicles=in_transit_vehicles,
        maintenance_vehicles=maintenance_vehicles,
        pending_requests=pending_requests,
        active_deliveries=active_deliveries,
        completed_deliveries=completed_deliveries,
        total_bookings=total_bookings,
        total_gmv=round(float(gmv), 2),
        total_transport_value=round(float(gmv), 2),
        driva_revenue=round(float(revenue), 2),
        driva_service_fee=round(float(revenue), 2),
        avg_match_score=round(float(avg_match), 2),
        avg_booking_value=round(float(avg_value), 2),
        avg_eta_hours=round(float(avg_eta_hours), 2),
        active_providers=active_providers,
        trend_data=[
            {"month": "Jun", "spend": 32000, "gmv": 640000, "revenue": 32000},
            {"month": "Jul", "spend": 45000, "gmv": 900000, "revenue": 45000},
            {"month": "Aug", "spend": 58000, "gmv": 1160000, "revenue": 58000},
            {"month": "Sep", "spend": 52000, "gmv": 1040000, "revenue": 52000},
            {"month": "Oct", "spend": 68500, "gmv": 1370000, "revenue": 68500},
        ],
        carrier_performance=[
            {"carrier": "ABC Logistics", "onTime": 96, "satisfaction": 94, "volume": 42},
            {"carrier": "RapidMove", "onTime": 93, "satisfaction": 91, "volume": 35},
            {"carrier": "SouthLine", "onTime": 90, "satisfaction": 89, "volume": 28},
            {"carrier": "GreenRoute EV", "onTime": 92, "satisfaction": 87, "volume": 22},
        ]
    )


@router.get("/business-spend", response_model=BusinessAnalytics)
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
        trend_data=[
            {"month": "Jun", "spend": 32000, "gmv": 640000, "revenue": 32000},
            {"month": "Jul", "spend": 45000, "gmv": 900000, "revenue": 45000},
            {"month": "Aug", "spend": 58000, "gmv": 1160000, "revenue": 58000},
            {"month": "Sep", "spend": 52000, "gmv": 1040000, "revenue": 52000},
            {"month": "Oct", "spend": 68500, "gmv": 1370000, "revenue": 68500},
        ],
        carrier_performance=[
            {"carrier": "ABC Logistics", "onTime": 96, "satisfaction": 94, "volume": 42},
            {"carrier": "RapidMove", "onTime": 93, "satisfaction": 91, "volume": 35},
            {"carrier": "SouthLine", "onTime": 90, "satisfaction": 89, "volume": 28},
            {"carrier": "GreenRoute EV", "onTime": 92, "satisfaction": 87, "volume": 22},
        ]
    )


@router.get("/fleet-performance")
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

@router.get("/agency-commercial")
def agency_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Provider profile not found")

    total_bookings = db.query(func.count(Booking.id)).filter(Booking.agency_id == provider.id).scalar() if provider else 0
    total_revenue = db.query(func.sum(Booking.quoted_price)).filter(Booking.agency_id == provider.id).scalar() or 0.0
    service_fee = db.query(func.sum(Booking.driva_service_fee)).filter(Booking.agency_id == provider.id).scalar() or 0.0
    completed = db.query(func.count(Booking.id)).filter(
        Booking.agency_id == provider.id,
        Booking.status == BookingStatus.DELIVERED
    ).scalar() if provider else 0

    return {
        "agency_gross_volume": float(total_revenue),
        "agency_revenue": float(total_revenue - service_fee),
        "driva_service_fee": float(service_fee),
        "completed_shipments": completed,
        "provider_reliability": provider.reliability_score if provider else 0,
        "total_bookings": total_bookings,
    }


@router.get("/provider-reliability")
def reliability_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        return {"reliability_score": 0, "success_rate": 0, "provider_rating": 0}
    return {
        "reliability_score": provider.reliability_score,
        "success_rate": provider.success_rate,
        "provider_rating": provider.provider_rating,
    }


@router.get("/admin/data-integrity")
def data_integrity(db: Session = Depends(get_db)):
    from app.models import Vehicle, Booking, TransportRequest, Driver, User
    errors = []
    warnings = []

    # Orphan checks
    orphan_vehicles = db.query(Vehicle).filter(Vehicle.owner_id == None).count()
    if orphan_vehicles > 0: errors.append(f"{orphan_vehicles} orphan vehicles found.")
    
    orphan_bookings = db.query(Booking).filter(Booking.request_id == None).count()
    if orphan_bookings > 0: errors.append(f"{orphan_bookings} orphan bookings found.")

    orphan_drivers = db.query(Driver).filter(Driver.user_id == None).count()
    if orphan_drivers > 0: warnings.append(f"{orphan_drivers} orphan drivers found (no user mapping).")

    # Status consistency
    # (Checking if booking DELIVERED but vehicle is still IN_TRANSIT)
    from app.models import BookingStatus, VehicleStatus
    mismatched_deliveries = db.query(Booking).join(Vehicle, Booking.vehicle_id == Vehicle.id).filter(
        Booking.status == BookingStatus.DELIVERED,
        Vehicle.status == VehicleStatus.IN_TRANSIT
    ).count()
    if mismatched_deliveries > 0: errors.append(f"{mismatched_deliveries} delivered bookings with in-transit vehicles.")

    status = "PASS"
    if len(errors) > 0:
        status = "ERROR"
    elif len(warnings) > 0:
        status = "WARNING"
        
    return {
        "status": status,
        "errors": errors,
        "warnings": warnings
    }
