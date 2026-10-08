from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Vehicle, VehicleStatus, User, UserRole, Provider
from app.schemas import VehicleCreate, VehicleUpdate, VehicleOut

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleOut])
def list_vehicles(
    status: Optional[VehicleStatus] = None,
    vehicle_type: Optional[str] = None,
    min_capacity: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Vehicle).filter(Vehicle.is_active == True)
    if status:
        q = q.filter(Vehicle.status == status)
    if vehicle_type:
        q = q.filter(Vehicle.vehicle_type.ilike(f"%{vehicle_type}%"))
    if min_capacity:
        q = q.filter(Vehicle.capacity_kg >= min_capacity)

    # Fleet owners / agencies only see their own
    if current_user.role in (UserRole.FLEET_OWNER, UserRole.LOGISTICS_AGENCY):
        q = q.filter(Vehicle.owner_id == current_user.id)

    return q.order_by(Vehicle.id).all()


@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.FLEET_OWNER, UserRole.LOGISTICS_AGENCY, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only fleet owners and agencies can add vehicles")

    if db.query(Vehicle).filter(Vehicle.vehicle_number == data.vehicle_number).first():
        raise HTTPException(status_code=400, detail="Vehicle number already registered")

    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()

    vehicle = Vehicle(
        owner_id=current_user.id,
        provider_id=provider.id if provider else None,
        **data.model_dump(),
    )
    db.add(vehicle)
    if provider:
        provider.total_vehicles = (provider.total_vehicles or 0) + 1
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.is_active == True).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v


@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, data: VehicleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if v.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if v.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    v.is_active = False
    db.commit()
