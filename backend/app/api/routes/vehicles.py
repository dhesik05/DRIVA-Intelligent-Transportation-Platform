"""DRIVA Vehicle Management API."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Vehicle, VehicleStatus, User, UserRole, Provider, Driver, FuelType
from app.schemas import VehicleCreate, VehicleUpdate, VehicleOut

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


class AvailabilityToggle(BaseModel):
    status: Optional[VehicleStatus] = None
    availability: Optional[bool] = None


class DriverAssignment(BaseModel):
    driver_id: int


def _enrich_vehicle_out(v: Vehicle) -> VehicleOut:
    d_name = v.driver.name if v.driver else None
    d_phone = v.driver.phone if v.driver else None
    p_name = v.provider.company_name if v.provider else None

    return VehicleOut(
        id=v.id,
        owner_id=v.owner_id,
        provider_id=v.provider_id,
        driver_id=v.driver_id,
        registration_number=v.registration_number or v.vehicle_number,
        vehicle_number=v.vehicle_number,
        vehicle_type=v.vehicle_type,
        make=v.make or "Tata",
        model=v.model or "Standard",
        manufacture_year=v.manufacture_year or 2022,
        fuel_type=v.fuel_type,
        capacity_kg=v.capacity_kg,
        volume_m3=v.volume_m3 or v.capacity_volume_m3 or 4.0,
        capacity_volume_m3=v.volume_m3 or v.capacity_volume_m3,
        length_ft=v.length_ft or 7.0,
        width_ft=v.width_ft or 5.0,
        height_ft=v.height_ft or 5.0,
        current_location=v.current_location or "Salem",
        home_location=v.home_location or "Salem",
        status=v.status,
        availability=v.status == VehicleStatus.AVAILABLE,
        vehicle_age_years=v.vehicle_age_years or 2.0,
        vehicle_age=v.vehicle_age or 2.0,
        mileage=v.mileage or 45000.0,
        efficiency=v.efficiency or 1.0,
        fuel_efficiency=v.fuel_efficiency or 14.0,
        rating=v.rating or 4.7,
        total_deliveries=v.total_deliveries or 0,
        successful_deliveries=v.successful_deliveries or 0,
        insurance_expiry=v.insurance_expiry or "2027-05-15",
        fitness_expiry=v.fitness_expiry or "2027-04-10",
        last_service_date=v.last_service_date or "2024-09-01",
        driver_name=d_name,
        driver_phone=d_phone,
        provider_name=p_name,
        is_active=v.is_active,
    )


@router.get("/summary")
def get_vehicle_summary(
    scope: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Vehicle).filter(Vehicle.is_active == True)

    if current_user.role == UserRole.FLEET_OWNER:
        prov = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if prov:
            q = q.filter(or_(Vehicle.provider_id == prov.id, Vehicle.owner_id == current_user.id))

    total = q.count()
    available = q.filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
    assigned = q.filter(Vehicle.status == VehicleStatus.ASSIGNED).count()
    in_transit = q.filter(Vehicle.status == VehicleStatus.IN_TRANSIT).count()
    maintenance = q.filter(Vehicle.status == VehicleStatus.MAINTENANCE).count()
    offline = q.filter(Vehicle.status == VehicleStatus.OFFLINE).count()

    return {
        "total": total,
        "available": available,
        "assigned": assigned,
        "in_transit": in_transit,
        "maintenance": maintenance,
        "offline": offline
    }


@router.get("", response_model=List[VehicleOut])
def list_vehicles(
    status: Optional[VehicleStatus] = None,
    fuel_type: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    availability: Optional[bool] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    min_capacity: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Vehicle).filter(Vehicle.is_active == True)

    if status:
        q = q.filter(Vehicle.status == status)
    if availability is True:
        q = q.filter(Vehicle.status == VehicleStatus.AVAILABLE)
    if fuel_type and fuel_type != "ALL":
        try:
            ft = FuelType[fuel_type.upper()]
            q = q.filter(Vehicle.fuel_type == ft)
        except Exception:
            pass
    if vehicle_type and vehicle_type != "ALL":
        q = q.filter(Vehicle.vehicle_type.ilike(f"%{vehicle_type}%"))
    if location and location != "ALL":
        q = q.filter(Vehicle.current_location.ilike(f"%{location}%"))
    if min_capacity:
        q = q.filter(Vehicle.capacity_kg >= min_capacity)
    if search:
        search_term = f"%{search}%"
        q = q.outerjoin(Driver, Vehicle.driver_id == Driver.id).filter(
            or_(
                Vehicle.vehicle_type.ilike(search_term),
                Vehicle.registration_number.ilike(search_term),
                Vehicle.vehicle_number.ilike(search_term),
                Vehicle.current_location.ilike(search_term),
                Driver.name.ilike(search_term),
            )
        )

    # Note: If Fleet Owner, show their fleet; if Business or Agency or Admin, allow viewing all active network vehicles
    if current_user.role == UserRole.FLEET_OWNER:
        prov = db.query(Provider).filter(Provider.user_id == current_user.id).first()
        if prov:
            q = q.filter(or_(Vehicle.provider_id == prov.id, Vehicle.owner_id == current_user.id))

    vehicles = q.order_by(Vehicle.id).all()
    return [_enrich_vehicle_out(v) for v in vehicles]


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.is_active == True).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found in registry")
    return _enrich_vehicle_out(v)


@router.put("/{vehicle_id}/availability", response_model=VehicleOut)
def toggle_availability(
    vehicle_id: int,
    data: AvailabilityToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if data.status:
        v.status = data.status
        v.availability = data.status == VehicleStatus.AVAILABLE
    elif data.availability is not None:
        v.status = VehicleStatus.AVAILABLE if data.availability else VehicleStatus.OFFLINE
        v.availability = data.availability
    else:
        # Toggle
        if v.status == VehicleStatus.AVAILABLE:
            v.status = VehicleStatus.OFFLINE
            v.availability = False
        else:
            v.status = VehicleStatus.AVAILABLE
            v.availability = True

    db.commit()
    db.refresh(v)
    return _enrich_vehicle_out(v)


@router.put("/{vehicle_id}/assign-driver", response_model=VehicleOut)
def assign_driver(
    vehicle_id: int,
    data: DriverAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    drv = db.query(Driver).filter(Driver.id == data.driver_id).first()
    if not drv:
        raise HTTPException(status_code=404, detail="Driver not found")

    v.driver_id = drv.id
    drv.assigned_vehicle_id = v.id
    db.commit()
    db.refresh(v)
    return _enrich_vehicle_out(v)


@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.FLEET_OWNER, UserRole.LOGISTICS_AGENCY, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only fleet owners and agencies can register vehicles")

    reg_num = data.registration_number or data.vehicle_number
    if not reg_num:
        raise HTTPException(status_code=400, detail="Registration plate number is required")

    if db.query(Vehicle).filter(
        or_(Vehicle.vehicle_number == reg_num, Vehicle.registration_number == reg_num)
    ).first():
        raise HTTPException(status_code=400, detail="Vehicle registration number already registered")

    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()

    vol = data.volume_m3 or data.capacity_volume_m3 or 4.0

    vehicle = Vehicle(
        owner_id=current_user.id,
        provider_id=provider.id if provider else data.provider_id,
        driver_id=data.driver_id,
        registration_number=reg_num,
        vehicle_number=reg_num.replace(" ", ""),
        vehicle_type=data.vehicle_type,
        make=data.make or "Tata",
        model=data.model or "Standard",
        manufacture_year=data.manufacture_year or 2023,
        fuel_type=data.fuel_type,
        capacity_kg=data.capacity_kg,
        volume_m3=vol,
        capacity_volume_m3=vol,
        length_ft=data.length_ft or 7.0,
        width_ft=data.width_ft or 5.0,
        height_ft=data.height_ft or 5.0,
        current_location=data.current_location or "Salem Hub",
        home_location=data.home_location or "Salem",
        status=VehicleStatus.AVAILABLE,
        availability=True,
        vehicle_age_years=data.vehicle_age_years,
        vehicle_age=data.vehicle_age or data.vehicle_age_years,
        mileage=data.mileage or 45000.0,
        efficiency=data.efficiency,
        fuel_efficiency=data.fuel_efficiency or 14.0,
        rating=4.7,
        insurance_expiry="2027-05-15",
        fitness_expiry="2027-04-10",
        last_service_date="2024-09-01",
        is_active=True,
    )
    db.add(vehicle)
    if provider:
        provider.total_vehicles = (provider.total_vehicles or 0) + 1
        provider.available_vehicles = (provider.available_vehicles or 0) + 1
    db.commit()
    db.refresh(vehicle)
    return _enrich_vehicle_out(vehicle)


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(v, field, value)
        if field == "status":
            v.availability = value == VehicleStatus.AVAILABLE

    db.commit()
    db.refresh(v)
    return _enrich_vehicle_out(v)


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    v.is_active = False
    db.commit()
