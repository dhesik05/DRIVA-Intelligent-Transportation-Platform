from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Provider, User
from app.schemas import ProviderOut

router = APIRouter(prefix="/api/providers", tags=["Providers"])


@router.get("", response_model=List[ProviderOut])
def list_providers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Provider).filter(Provider.is_active == True).order_by(Provider.provider_rating.desc()).all()


@router.get("/{provider_id}", response_model=ProviderOut)
def get_provider(provider_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Provider).filter(Provider.id == provider_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Provider not found")
    return p
