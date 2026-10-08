"""
DRIVA Matching API
==================
The core intelligence endpoint.
Flow: Request → Available Vehicles → ML Predictions → Decision Engine → Ranked Results + Groq explanation
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import (
    TransportRequest, Vehicle, Provider, Driver, VehicleStatus,
    MLPrediction, AIRecommendation, RequestStatus, User
)
from app.schemas import MatchResponse, MatchOption
from app.decision_engine.engine import CandidateOption, score_and_rank, get_distance
from app.ai.groq_service import explain_recommendation

import sys
from pathlib import Path
repo_root = Path(__file__).resolve().parents[4]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))
if str(repo_root / "ml") not in sys.path:
    sys.path.insert(0, str(repo_root / "ml"))

router = APIRouter(prefix="/api/matching", tags=["Smart Match"])

# Default traffic/weather factors for matching
DEFAULT_TRAFFIC = 1.15
DEFAULT_WEATHER = 1.05


def _predict(vehicle: Vehicle, request: TransportRequest, provider: Provider):
    """Run ML predictions for a single vehicle/request pair."""
    from ml.inference.predict import predict_cost, predict_eta, predict_suitability

    dist = request.estimated_distance_km or get_distance(request.pickup_location, request.destination)
    cargo_vol = request.cargo_volume_m3 or (request.cargo_weight_kg / 350.0)
    priority = request.priority.value if request.priority else "NORMAL"

    deadline_hours = None
    if request.deadline:
        delta = request.deadline - datetime.utcnow()
        deadline_hours = max(0.1, delta.total_seconds() / 3600)

    cost, cost_fallback = predict_cost(
        distance_km=dist,
        cargo_weight_kg=request.cargo_weight_kg,
        cargo_volume_m3=cargo_vol,
        fuel_type=vehicle.fuel_type.value,
        vehicle_type=vehicle.vehicle_type,
        vehicle_capacity_kg=vehicle.capacity_kg,
        vehicle_age_years=vehicle.vehicle_age_years,
        vehicle_efficiency=vehicle.efficiency,
        traffic_factor=DEFAULT_TRAFFIC,
        weather_factor=DEFAULT_WEATHER,
        priority=priority,
    )

    eta, eta_fallback = predict_eta(
        distance_km=dist,
        cargo_weight_kg=request.cargo_weight_kg,
        traffic_factor=DEFAULT_TRAFFIC,
        weather_factor=DEFAULT_WEATHER,
        vehicle_type=vehicle.vehicle_type,
        vehicle_efficiency=vehicle.efficiency,
        vehicle_age_years=vehicle.vehicle_age_years,
        priority=priority,
    )

    driver = None
    if provider:
        driver = (
            db_session_ref[0].query(Driver)
            .filter(Driver.user_id == provider.user_id, Driver.is_available == True)
            .first()
        )

    suit, suit_fallback = predict_suitability(
        distance_km=dist,
        cargo_weight_kg=request.cargo_weight_kg,
        vehicle_capacity_kg=vehicle.capacity_kg,
        vehicle_availability=1 if vehicle.status == VehicleStatus.AVAILABLE else 0,
        deadline_hours=deadline_hours or 24.0,
        estimated_eta_hours=eta,
        provider_rating=provider.provider_rating if provider else 4.0,
        driver_experience_years=driver.experience_years if driver else 3.0,
        vehicle_efficiency=vehicle.efficiency,
        vehicle_age_years=vehicle.vehicle_age_years,
        traffic_factor=DEFAULT_TRAFFIC,
        weather_factor=DEFAULT_WEATHER,
        fuel_type=vehicle.fuel_type.value,
        priority=priority,
        vehicle_type=vehicle.vehicle_type,
    )

    return cost, eta, suit, cost_fallback or eta_fallback or suit_fallback


# Thread-local for passing db to _predict
db_session_ref = [None]


@router.post("/{request_id}", response_model=MatchResponse)
def run_matching(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_session_ref[0] = db

    req = db.query(TransportRequest).filter(TransportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Transport request not found")
    if req.business_id != current_user.id and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    import logging
    logger = logging.getLogger("driva.matching")
    logger.info(f"STARTING MATCH for request {req.id} with cargo weight {req.cargo_weight_kg} kg")

    # Get all available vehicles with providers
    vehicles_with_providers = (
        db.query(Vehicle, Provider)
        .join(Provider, Vehicle.provider_id == Provider.id)
        .filter(
            Vehicle.status == VehicleStatus.AVAILABLE,
            Vehicle.is_active == True,
            Provider.is_active == True,
        )
        .all()
    )

    if not vehicles_with_providers:
        logger.info("AFTER FILTERING: 0 vehicles available in DB")
        raise HTTPException(
            status_code=404,
            detail="No suitable transportation is currently available. Please try again later.",
        )

    # Calculate deadline hours
    deadline_hours = None
    if req.deadline:
        delta = req.deadline - datetime.utcnow()
        deadline_hours = max(0.5, delta.total_seconds() / 3600)

    # Build candidates
    candidates = []
    predictions_to_save = []

    for vehicle, provider in vehicles_with_providers:
        cost, eta, suit, used_fallback = _predict(vehicle, req, provider)

        predictions_to_save.append(MLPrediction(
            request_id=req.id,
            vehicle_id=vehicle.id,
            predicted_cost=cost,
            predicted_eta_hours=eta,
            suitability_score=suit,
            used_fallback=used_fallback,
        ))

        driver = (
            db.query(Driver)
            .filter(Driver.user_id == provider.user_id, Driver.is_available == True)
            .first()
        )
        from app.decision_engine.engine import VEHICLE_DIMS
        vdims = VEHICLE_DIMS.get(vehicle.vehicle_type, {"length": 3.0, "width": 1.6, "height": 1.6, "volume": 7.6})

        candidates.append(CandidateOption(
            provider_id=provider.id,
            provider_name=provider.company_name,
            vehicle_id=vehicle.id,
            vehicle_type=vehicle.vehicle_type,
            fuel_type=vehicle.fuel_type.value,
            capacity_kg=vehicle.capacity_kg,
            current_location=vehicle.current_location,
            provider_reliability=provider.reliability_score,
            is_available=vehicle.status == VehicleStatus.AVAILABLE,
            predicted_cost=cost,
            predicted_eta_hours=eta,
            suitability_score=suit,
            vehicle_efficiency=vehicle.efficiency,
            driver_experience=driver.experience_years if driver else 4.0,
            vehicle_number=vehicle.vehicle_number,
            provider_rating=provider.provider_rating if provider else 4.5,
            usable_length_m=vdims["length"],
            usable_width_m=vdims["width"],
            usable_height_m=vdims["height"],
            usable_volume_m3=vdims["volume"],
        ))

    logger.info(f"AFTER ML: completed predictions for {len(candidates)} vehicles")

    # Save ML predictions
    for pred in predictions_to_save:
        db.add(pred)

    # Parse cargo dimensions
    cargo_len = None
    cargo_wid = None
    cargo_hgt = None
    if req.cargo_dimensions:
        try:
            parts = [float(p.strip()) for p in req.cargo_dimensions.lower().replace("m", "").split("x")]
            if len(parts) == 3:
                cargo_len, cargo_wid, cargo_hgt = parts
        except Exception:
            pass

    # Run decision engine
    ranked = score_and_rank(
        candidates=candidates,
        cargo_weight_kg=req.cargo_weight_kg,
        pickup=req.pickup_location,
        destination=req.destination,
        deadline_hours=deadline_hours,
        cargo_length_m=cargo_len,
        cargo_width_m=cargo_wid,
        cargo_height_m=cargo_hgt,
        cargo_volume_m3=req.cargo_volume_m3,
    )
    
    logger.info(f"AFTER RANKING: {len(ranked)} vehicles successfully matched")

    if not ranked:
        req.status = RequestStatus.PENDING
        db.commit()
        raise HTTPException(
            status_code=422,
            detail="No suitable transportation is currently available for your cargo requirements.",
        )

    # Build response options
    options = [
        MatchOption(
            rank=r.rank,
            provider_id=r.provider_id,
            provider_name=r.provider_name,
            provider_rating=r.provider_rating,
            provider_reliability=r.provider_reliability,
            operating_route=r.operating_route or f"{req.pickup_location} → {req.destination}",
            is_available=True,

            vehicle_id=r.vehicle_id,
            vehicle_name=r.vehicle_name,
            vehicle_type=r.vehicle_type,
            vehicle_number=r.vehicle_number,
            fuel_type=r.fuel_type,
            capacity_kg=r.capacity_kg,
            driver_experience=r.driver_experience,
            current_location=r.current_location,

            cargo_weight_kg=r.cargo_weight_kg,
            cargo_volume_m3=r.cargo_volume_m3,
            usable_length_m=r.usable_length_m,
            usable_width_m=r.usable_width_m,
            usable_height_m=r.usable_height_m,
            usable_volume_m3=r.usable_volume_m3,
            weight_utilization_pct=r.weight_utilization_pct,
            volume_utilization_pct=r.volume_utilization_pct,
            dimension_fit=r.dimension_fit,
            deadline_met=r.deadline_met,

            predicted_cost=r.predicted_cost,
            predicted_eta_hours=r.predicted_eta_hours,
            suitability_score=r.suitability_score,

            match_score=r.match_score,
            route_score=r.route_score,
            cost_score=r.cost_score,
            eta_score=r.eta_score,
            capacity_score=r.capacity_score,
            dimension_fit_score=r.dimension_fit_score,
            availability_score=r.availability_score,
        )
        for r in ranked
    ]

    best = ranked[0]
    alternatives = [o.model_dump() for o in options[1:4]]

    # Groq explanation
    best_vehicle = next(
        (v for v, p in vehicles_with_providers if v.id == best.vehicle_id), None
    )
    explanation, used_groq = explain_recommendation(
        pickup=req.pickup_location,
        destination=req.destination,
        cargo_weight_kg=req.cargo_weight_kg,
        cargo_type=req.cargo_type,
        recommended_provider=best.provider_name,
        recommended_vehicle=best.vehicle_type,
        predicted_cost=best.predicted_cost,
        predicted_eta_hours=best.predicted_eta_hours,
        match_score=best.match_score,
        provider_reliability=best.provider_reliability,
        vehicle_capacity_kg=best.capacity_kg,
        alternatives=alternatives,
    )

    # Save AI recommendation
    existing_rec = db.query(AIRecommendation).filter(AIRecommendation.request_id == req.id).first()
    if existing_rec:
        existing_rec.recommended_provider_id = best.provider_id
        existing_rec.match_score = best.match_score
        existing_rec.groq_explanation = explanation
        existing_rec.used_groq = used_groq
    else:
        db.add(AIRecommendation(
            request_id=req.id,
            recommended_provider_id=best.provider_id,
            match_score=best.match_score,
            reasoning=f"Rank 1 of {len(ranked)} options",
            groq_explanation=explanation,
            used_groq=used_groq,
        ))

    req.status = RequestStatus.MATCHED
    db.commit()

    return MatchResponse(
        request_id=req.id,
        pickup=req.pickup_location,
        destination=req.destination,
        cargo_type=req.cargo_type,
        cargo_weight_kg=req.cargo_weight_kg,
        cargo_length_m=cargo_len,
        cargo_width_m=cargo_wid,
        cargo_height_m=cargo_hgt,
        cargo_volume_m3=req.cargo_volume_m3,
        deadline_hours=deadline_hours,
        priority=req.priority.value if req.priority else "NORMAL",
        options=options,
        recommended=options[0],
        groq_explanation=explanation,
    )


@router.get("/{request_id}/results", response_model=MatchResponse)
def get_match_results(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-fetch previously computed match results."""
    return run_matching(request_id, db, current_user)
