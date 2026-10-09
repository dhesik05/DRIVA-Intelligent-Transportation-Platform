from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, BusinessProfile, Provider, ProviderType, Driver, Vehicle, Booking

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role.value, "phone": u.phone, "created_at": u.created_at} for u in users]

@router.get("/businesses")
def get_businesses(db: Session = Depends(get_db)):
    businesses = db.query(BusinessProfile).all()
    return [{"id": b.id, "name": b.business_name, "email": b.email, "city": b.city, "industry": b.industry, "completed_shipments": b.completed_shipments} for b in businesses]

@router.get("/fleets")
def get_fleets(db: Session = Depends(get_db)):
    fleets = db.query(Provider).filter(Provider.provider_type == ProviderType.FLEET_OWNER).all()
    return [{"id": f.id, "name": f.company_name, "city": f.city, "rating": f.provider_rating, "total_vehicles": f.total_vehicles} for f in fleets]

@router.get("/agencies")
def get_agencies(db: Session = Depends(get_db)):
    agencies = db.query(Provider).filter(Provider.provider_type == ProviderType.LOGISTICS_AGENCY).all()
    return [{"id": a.id, "name": a.company_name, "city": a.city, "rating": a.provider_rating, "total_vehicles": a.total_vehicles} for a in agencies]

@router.get("/drivers")
def get_drivers(db: Session = Depends(get_db)):
    drivers = db.query(Driver).all()
    return [{"id": d.id, "name": d.name, "license": d.license_number, "rating": d.rating, "experience": d.experience_years, "location": d.current_location, "available": d.is_available} for d in drivers]

@router.get("/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    return [{"id": v.id, "reg": v.registration_number, "type": v.vehicle_type, "capacity": v.capacity_kg, "status": v.status.value if hasattr(v.status, 'value') else v.status, "location": v.current_location} for v in vehicles]

@router.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()
    return [{"id": b.id, "request_id": b.request_id, "status": b.status.value if hasattr(b.status, 'value') else b.status, "price": b.quoted_price, "fee": b.driva_service_fee, "date": b.created_at} for b in bookings]
