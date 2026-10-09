from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Provider, ProviderType, User, Vehicle, VehicleStatus
from app.schemas import ProviderOut

router = APIRouter(prefix="/api/providers", tags=["Providers"])
fleet_owners_router = APIRouter(prefix="/api/fleet-owners", tags=["Fleet Owners"])
agencies_router = APIRouter(prefix="/api/agencies", tags=["Logistics Agencies"])


def _enrich_provider(p: Provider, db: Session):
    tot_v = db.query(Vehicle).filter(Vehicle.provider_id == p.id, Vehicle.is_active == True).count()
    avail_v = db.query(Vehicle).filter(Vehicle.provider_id == p.id, Vehicle.status == VehicleStatus.AVAILABLE, Vehicle.is_active == True).count()
    return {
        "id": p.id,
        "user_id": p.user_id,
        "provider_type": p.provider_type.value if hasattr(p.provider_type, "value") else str(p.provider_type),
        "company_name": p.company_name,
        "owner_name": p.owner_name or p.contact_person,
        "contact_person": p.contact_person or p.owner_name,
        "email": p.email,
        "phone": p.phone,
        "city": p.city or "Salem",
        "service_areas": p.service_areas,
        "total_vehicles": tot_v or p.total_vehicles,
        "available_vehicles": avail_v or p.available_vehicles,
        "assigned_vehicles": max(0, tot_v - avail_v),
        "completed_deliveries": p.completed_deliveries,
        "provider_rating": p.provider_rating,
        "rating": p.provider_rating,
        "reliability_score": p.reliability_score,
        "success_rate": p.success_rate,
        "verification_status": p.verification_status,
        "is_active": p.is_active,
    }


@router.get("")
def list_providers(
    provider_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Provider).filter(Provider.is_active == True)
    if provider_type:
        try:
            pt = ProviderType[provider_type.upper()]
            q = q.filter(Provider.provider_type == pt)
        except Exception:
            pass
    providers = q.order_by(Provider.provider_rating.desc()).all()
    return [_enrich_provider(p, db) for p in providers]


@router.get("/{provider_id}")
def get_provider(provider_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    return _enrich_provider(p, db)


@fleet_owners_router.get("")
def list_fleet_owners(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    providers = db.query(Provider).filter(
        Provider.provider_type == ProviderType.FLEET_OWNER,
        Provider.is_active == True
    ).order_by(Provider.provider_rating.desc()).all()
    return [_enrich_provider(p, db) for p in providers]


@fleet_owners_router.get("/{id}")
def get_fleet_owner(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Provider).filter(Provider.id == id, Provider.provider_type == ProviderType.FLEET_OWNER).first()
    if not p:
        raise HTTPException(status_code=404, detail="Fleet Owner not found")
    return _enrich_provider(p, db)


@agencies_router.get("")
def list_agencies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    providers = db.query(Provider).filter(
        Provider.provider_type == ProviderType.LOGISTICS_AGENCY,
        Provider.is_active == True
    ).order_by(Provider.provider_rating.desc()).all()
    return [_enrich_provider(p, db) for p in providers]


@agencies_router.get("/{id}")
def get_agency(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Provider).filter(Provider.id == id, Provider.provider_type == ProviderType.LOGISTICS_AGENCY).first()
    if not p:
        raise HTTPException(status_code=404, detail="Logistics Agency not found")
    return _enrich_provider(p, db)
