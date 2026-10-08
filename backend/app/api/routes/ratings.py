from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Booking, Rating, User, UserRole
from app.schemas import RatingCreate, RatingOut

router = APIRouter(prefix="/api/ratings", tags=["Ratings"])


@router.post("", response_model=RatingOut, status_code=201)
def submit_rating(data: RatingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    existing = db.query(Rating).filter(Rating.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Rating already submitted for this booking")

    rating = Rating(
        booking_id=data.booking_id,
        rater_id=current_user.id,
        overall_rating=data.overall_rating,
        timeliness_rating=data.timeliness_rating,
        cost_rating=data.cost_rating,
        service_rating=data.service_rating,
        comment=data.comment,
    )
    db.add(rating)

    # Update provider average rating
    from app.models import Provider
    from sqlalchemy import func
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if provider:
        avg = db.query(func.avg(Rating.overall_rating)).join(Booking).filter(
            Booking.provider_id == provider.id
        ).scalar()
        if avg:
            provider.provider_rating = round(float(avg), 2)
            provider.reliability_score = min(100, float(avg) / 5.0 * 100)

    db.commit()
    db.refresh(rating)
    return rating
