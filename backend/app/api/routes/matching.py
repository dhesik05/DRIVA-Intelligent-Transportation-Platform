"""
DRIVA Matching API
==================
The core intelligence endpoint.
Pipeline:
Transport Request
    ↓
Fetch Available Vehicles
    ↓
Hard Constraint Filtering (Capacity, Dimensions, Availability)
    ↓
ML Cost Prediction
    ↓
ML ETA Prediction
    ↓
Suitability Prediction
    ↓
Decision Engine (Multi-criteria Scoring)
    ↓
Ranking & Recommendations + Groq Natural Language Explanation
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import logging

import sys
from pathlib import Path
repo_root = Path(__file__).resolve().parents[4]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import (
    TransportRequest, Vehicle, Provider, Driver, VehicleStatus,
    MLPrediction, AIRecommendation, RequestStatus, User, FuelType
)
from app.schemas import MatchResponse, MatchOption
from app.decision_engine.engine import CandidateOption, score_and_rank, get_distance, VEHICLE_DIMS
from app.ai.groq_service import explain_recommendation

logger = logging.getLogger("driva.matching")

router = APIRouter(prefix="/api/matching", tags=["Smart Match"])

DEFAULT_TRAFFIC = 1.15
DEFAULT_WEATHER = 1.05


def _predict(vehicle: Vehicle, request: TransportRequest, provider: Provider, db: Session):
    """Run ML predictions for a single vehicle/request pair with robust fallback."""
    from app.services.ml_service import predict_cost, predict_eta, predict_suitability

    dist = request.estimated_distance_km or get_distance(request.pickup_location, request.destination)
    cargo_vol = request.cargo_volume_m3 or (request.cargo_weight_kg / 350.0)
    priority = request.priority.value if request.priority else "NORMAL"
    route = f"{request.pickup_location}_{request.destination}"

    deadline_hours = None
    if request.deadline:
        delta = request.deadline - datetime.utcnow()
        deadline_hours = max(0.5, delta.total_seconds() / 3600)
        
    cargo_len = 1.0
    cargo_wid = 1.0
    cargo_hgt = 1.0
    if request.cargo_dimensions:
        try:
            parts = [float(p.strip()) for p in request.cargo_dimensions.lower().replace("m", "").split("x")]
            if len(parts) == 3:
                cargo_len, cargo_wid, cargo_hgt = parts
        except Exception:
            pass

    fuel_val = vehicle.fuel_type.value if hasattr(vehicle.fuel_type, "value") else str(vehicle.fuel_type)
    
    # Real dimensions from vehicle (convert ft to meters: 1 ft = 0.3048 m)
    v_len_m = (vehicle.length_ft * 0.3048) if vehicle.length_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("length", 3.0)
    v_wid_m = (vehicle.width_ft * 0.3048) if vehicle.width_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("width", 1.6)
    v_hgt_m = (vehicle.height_ft * 0.3048) if vehicle.height_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("height", 1.6)
    v_vol_m3 = vehicle.volume_m3 or vehicle.capacity_volume_m3 or (v_len_m * v_wid_m * v_hgt_m)
    
    # Resolve driver
    driver = None
    if vehicle.driver_id:
        driver = db.query(Driver).filter(Driver.id == vehicle.driver_id).first()
    if not driver and provider:
        driver = (
            db.query(Driver)
            .filter(
                (Driver.provider_id == provider.id) |
                (Driver.user_id == provider.user_id)
            )
            .first()
        )

    provider_rating = provider.provider_rating if provider else 4.5
    driver_exp = driver.experience_years if driver else 4.0
    v_age = vehicle.vehicle_age_years or 2.0
    v_eff = vehicle.efficiency or 1.0

    cost, cost_fallback = predict_cost(
        distance_km=dist,
        cargo_weight_kg=request.cargo_weight_kg,
        cargo_volume_m3=cargo_vol,
        vehicle_capacity_kg=vehicle.capacity_kg,
        vehicle_volume_m3=v_vol_m3,
        vehicle_age_years=v_age,
        vehicle_efficiency=v_eff,
        fuel_or_energy_cost=dist * 18.0,
        traffic_factor=DEFAULT_TRAFFIC,
        weather_factor=DEFAULT_WEATHER,
        provider_rating=provider_rating,
        driver_experience_years=driver_exp,
        historical_cost=dist * 20.0,
        vehicle_type=vehicle.vehicle_type,
        fuel_type=fuel_val,
        route=route,
        delivery_priority=priority,
    )

    eta, eta_fallback = predict_eta(
        distance_km=dist,
        cargo_weight_kg=request.cargo_weight_kg,
        traffic_factor=DEFAULT_TRAFFIC,
        weather_factor=DEFAULT_WEATHER,
        vehicle_type=vehicle.vehicle_type,
        vehicle_capacity_kg=vehicle.capacity_kg,
        vehicle_efficiency=v_eff,
        driver_experience_years=driver_exp,
        historical_delivery_time_hours=(dist / 55.0),
        delivery_priority=priority,
        route=route,
    )

    suit, suit_fallback = predict_suitability(
        cargo_weight_kg=request.cargo_weight_kg,
        cargo_volume_m3=cargo_vol,
        cargo_length_m=cargo_len,
        cargo_width_m=cargo_wid,
        cargo_height_m=cargo_hgt,
        vehicle_capacity_kg=vehicle.capacity_kg,
        vehicle_volume_m3=v_vol_m3,
        vehicle_length_m=v_len_m,
        vehicle_width_m=v_wid_m,
        vehicle_height_m=v_hgt_m,
        vehicle_type=vehicle.vehicle_type,
        fuel_type=fuel_val,
        provider_rating=provider_rating,
        driver_experience_years=driver_exp,
        vehicle_availability=1 if vehicle.status == VehicleStatus.AVAILABLE else 0,
        route=route,
        delivery_priority=priority,
    )

    return cost, eta, suit, (cost_fallback or eta_fallback or suit_fallback), driver


@router.post("/{request_id}", response_model=MatchResponse)
def run_matching(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = db.query(TransportRequest).filter(TransportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Transport request not found")

    logger.info(f"[DRIVA MATCH] Starting evaluation for request #{req.id}: {req.pickup_location} → {req.destination}, Cargo: {req.cargo_weight_kg}kg ({req.cargo_type})")

    # Fetch all active vehicles with their providers
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
        logger.warning("[DRIVA MATCH] No available vehicles registered in carrier network")
        raise HTTPException(
            status_code=404,
            detail="No carrier vehicles are currently available for allocation. Please try again later.",
        )

    # Compute deadline hours
    deadline_hours = None
    if req.deadline:
        delta = req.deadline - datetime.utcnow()
        deadline_hours = max(0.5, delta.total_seconds() / 3600)

    # Build candidates
    candidates = []
    predictions_to_save = []

    for vehicle, provider in vehicles_with_providers:
        try:
            cost, eta, suit, used_fallback, driver = _predict(vehicle, req, provider, db)
        except Exception as e:
            logger.error(f"Error predicting vehicle {vehicle.vehicle_number}: {e}")
            continue

        predictions_to_save.append(MLPrediction(
            request_id=req.id,
            vehicle_id=vehicle.id,
            predicted_cost=cost,
            predicted_eta_hours=eta,
            suitability_score=suit,
            used_fallback=used_fallback,
        ))

        # Real dimensions from vehicle (convert ft to meters: 1 ft = 0.3048 m)
        v_len_m = (vehicle.length_ft * 0.3048) if vehicle.length_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("length", 3.0)
        v_wid_m = (vehicle.width_ft * 0.3048) if vehicle.width_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("width", 1.6)
        v_hgt_m = (vehicle.height_ft * 0.3048) if vehicle.height_ft else VEHICLE_DIMS.get(vehicle.vehicle_type, {}).get("height", 1.6)
        v_vol_m3 = vehicle.volume_m3 or vehicle.capacity_volume_m3 or (v_len_m * v_wid_m * v_hgt_m)

        fuel_val = vehicle.fuel_type.value if hasattr(vehicle.fuel_type, "value") else str(vehicle.fuel_type)

        candidates.append(CandidateOption(
            provider_id=provider.id,
            provider_name=provider.company_name,
            vehicle_id=vehicle.id,
            vehicle_type=vehicle.vehicle_type,
            fuel_type=fuel_val,
            capacity_kg=vehicle.capacity_kg,
            current_location=vehicle.current_location,
            provider_reliability=provider.reliability_score or 92.0,
            is_available=vehicle.status == VehicleStatus.AVAILABLE,
            predicted_cost=cost,
            predicted_eta_hours=eta,
            suitability_score=suit,
            vehicle_efficiency=vehicle.efficiency or 1.0,
            driver_experience=driver.experience_years if driver else 4.0,
            vehicle_number=vehicle.registration_number or vehicle.vehicle_number,
            provider_rating=provider.provider_rating or 4.7,
            usable_length_m=round(v_len_m, 2),
            usable_width_m=round(v_wid_m, 2),
            usable_height_m=round(v_hgt_m, 2),
            usable_volume_m3=round(v_vol_m3, 2),
        ))

    logger.info(f"[DRIVA MATCH] Built {len(candidates)} candidates for decision engine")

    # Persist predictions safely
    for pred in predictions_to_save:
        db.add(pred)

    # Parse cargo dimensions if present
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

    # Score and Rank via Decision Engine
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

    logger.info(f"[DRIVA MATCH] Decision engine ranked {len(ranked)} viable transportation solutions")

    if not ranked:
        req.status = RequestStatus.PENDING
        db.commit()
        raise HTTPException(
            status_code=422,
            detail="No carrier vehicles currently meet your cargo weight, volume, or dimensional constraints.",
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

    # AI Explanation via Groq with safe fallback
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

    # Save recommendation
    existing_rec = db.query(AIRecommendation).filter(AIRecommendation.request_id == req.id).first()
    if existing_rec:
        existing_rec.recommended_provider_id = best.provider_id
        existing_rec.recommended_vehicle_id = best.vehicle_id
        existing_rec.match_score = best.match_score
        existing_rec.groq_explanation = explanation
        existing_rec.used_groq = used_groq
    else:
        db.add(AIRecommendation(
            request_id=req.id,
            recommended_provider_id=best.provider_id,
            recommended_vehicle_id=best.vehicle_id,
            match_score=best.match_score,
            reasoning=f"Rank #1 of {len(ranked)} evaluated carriers",
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
    """Re-fetch previously computed match results or evaluate."""
    return run_matching(request_id, db, current_user)
