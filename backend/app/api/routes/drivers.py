"""DRIVA Drivers API."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Driver, User, UserRole, Vehicle, Provider

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


class DriverCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    license_number: str
    license_type: str = "Commercial HMV"
    experience_years: float = 3.0
    current_location: Optional[str] = None
    provider_id: Optional[int] = None
    assigned_vehicle_id: Optional[int] = None


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_available: Optional[bool] = None
    current_location: Optional[str] = None
    assigned_vehicle_id: Optional[int] = None
    rating: Optional[float] = None


class DriverOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    license_number: Optional[str]
    license_type: Optional[str]
    experience_years: float
    rating: float
    total_deliveries: int
    successful_deliveries: int
    is_available: bool
    current_location: Optional[str]
    provider_id: Optional[int]
    assigned_vehicle_id: Optional[int]
    vehicle_registration: Optional[str] = None
    provider_name: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[DriverOut])
def list_drivers(
    available_only: Optional[bool] = None,
    provider_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Driver)
    if available_only is True:
        q = q.filter(Driver.is_available == True)
    if provider_id:
        q = q.filter(Driver.provider_id == provider_id)
    elif current_user.role == UserRole.FLEET_OWNER:
        # Fleet owners see their own drivers
        prov = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if prov:
            q = q.filter(Driver.provider_id == prov.id)

    drivers = q.order_by(Driver.id).all()
    results = []
    for d in drivers:
        v_reg = d.assigned_vehicle.registration_number if d.assigned_vehicle else None
        p_name = d.provider.company_name if d.provider else None
        results.append(DriverOut(
            id=d.id,
            name=d.name,
            phone=d.phone,
            email=d.email,
            license_number=d.license_number,
            license_type=d.license_type,
            experience_years=d.experience_years or 3.0,
            rating=d.rating or 4.7,
            total_deliveries=d.total_deliveries or 0,
            successful_deliveries=d.successful_deliveries or 0,
            is_available=d.is_available,
            current_location=d.current_location,
            provider_id=d.provider_id,
            assigned_vehicle_id=d.assigned_vehicle_id,
            vehicle_registration=v_reg,
            provider_name=p_name,
        ))
    return results


@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver record not found")
    v_reg = d.assigned_vehicle.registration_number if d.assigned_vehicle else None
    p_name = d.provider.company_name if d.provider else None
    return DriverOut(
        id=d.id,
        name=d.name,
        phone=d.phone,
        email=d.email,
        license_number=d.license_number,
        license_type=d.license_type,
        experience_years=d.experience_years or 3.0,
        rating=d.rating or 4.7,
        total_deliveries=d.total_deliveries or 0,
        successful_deliveries=d.successful_deliveries or 0,
        is_available=d.is_available,
        current_location=d.current_location,
        provider_id=d.provider_id,
        assigned_vehicle_id=d.assigned_vehicle_id,
        vehicle_registration=v_reg,
        provider_name=p_name,
    )


@router.post("", response_model=DriverOut, status_code=201)
def create_driver(
    data: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.FLEET_OWNER, UserRole.LOGISTICS_AGENCY, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not authorized to register commercial drivers")

    prov_id = data.provider_id
    if not prov_id:
        prov = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        prov_id = prov.id if prov else None

    d = Driver(
        provider_id=prov_id,
        name=data.name,
        phone=data.phone,
        email=data.email,
        license_number=data.license_number,
        license_type=data.license_type,
        experience_years=data.experience_years,
        current_location=data.current_location,
        assigned_vehicle_id=data.assigned_vehicle_id,
        rating=4.8,
        is_available=True,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return get_driver(d.id, db, current_user)


@router.put("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: int,
    data: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver record not found")

    for field, val in data.model_dump(exclude_none=True).items():
        setattr(d, field, val)

    db.commit()
    db.refresh(d)
    return get_driver(d.id, db, current_user)
