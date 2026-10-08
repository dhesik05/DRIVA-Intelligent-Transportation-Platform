from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import TransportRequest, RequestStatus, User, UserRole
from app.schemas import TransportRequestCreate, TransportRequestOut
from app.decision_engine.engine import get_distance
from datetime import datetime

router = APIRouter(prefix="/api/transport-requests", tags=["Transport Requests"])


@router.post("", response_model=TransportRequestOut, status_code=201)
def create_request(data: TransportRequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dist = get_distance(data.pickup_location, data.destination)
    dumped = data.model_dump()
    
    length = dumped.pop("cargo_length_m", None)
    width = dumped.pop("cargo_width_m", None)
    height = dumped.pop("cargo_height_m", None)
    
    if length is not None:
        dumped["cargo_dimensions"] = f"{length}x{width or 0}x{height or 0}"

    req = TransportRequest(
        business_id=current_user.id,
        estimated_distance_km=dist,
        **dumped,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("", response_model=List[TransportRequestOut])
def list_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(TransportRequest)
    if current_user.role == UserRole.BUSINESS_OWNER:
        q = q.filter(TransportRequest.business_id == current_user.id)
    elif current_user.role == UserRole.ADMIN:
        pass  # sees all
    else:
        q = q.filter(TransportRequest.status.in_([RequestStatus.MATCHED, RequestStatus.BOOKED]))
    return q.order_by(TransportRequest.created_at.desc()).limit(50).all()


@router.get("/{request_id}", response_model=TransportRequestOut)
def get_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(TransportRequest).filter(TransportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.business_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return req


@router.put("/{request_id}/cancel", response_model=TransportRequestOut)
def cancel_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    req = db.query(TransportRequest).filter(TransportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.business_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    req.status = RequestStatus.CANCELLED
    db.commit()
    db.refresh(req)
    return req
