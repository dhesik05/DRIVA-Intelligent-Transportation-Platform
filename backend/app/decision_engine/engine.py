"""
DRIVA Decision Engine
======================
Scores and ranks transport providers using a weighted multi-criteria model.
Weights:  Route 25% | Cost 20% | ETA 20% | Capacity 15% | Vehicle 10% | Reliability 5% | Availability 5%

Hard constraints are applied BEFORE scoring — ineligible options are filtered out.
"""

from __future__ import annotations
import logging
import math
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ─── Configurable weights ─────────────────────────────────────────────────────
WEIGHTS = {
    "route":        0.25,
    "cost":         0.20,
    "eta":          0.20,
    "capacity":     0.15,
    "vehicle":      0.10,
    "reliability":  0.05,
    "availability": 0.05,
}

ROUTE_DISTANCES: dict[tuple[str, str], float] = {
    ("Salem", "Bangalore"): 340,
    ("Chennai", "Coimbatore"): 500,
    ("Coimbatore", "Chennai"): 500,
    ("Salem", "Chennai"): 340,
    ("Bangalore", "Chennai"): 350,
    ("Chennai", "Bangalore"): 350,
    ("Madurai", "Chennai"): 460,
    ("Coimbatore", "Bangalore"): 360,
    ("Bangalore", "Coimbatore"): 360,
    ("Salem", "Coimbatore"): 160,
    ("Salem", "Madurai"): 200,
    ("Chennai", "Madurai"): 460,
    ("Madurai", "Coimbatore"): 220,
    ("Bangalore", "Madurai"): 460,
    ("Trichy", "Chennai"): 320,
    ("Chennai", "Trichy"): 320,
    ("Bangalore", "Salem"): 340,
    ("Coimbatore", "Salem"): 160,
}


@dataclass
class CandidateOption:
    provider_id: int
    provider_name: str
    vehicle_id: int
    vehicle_type: str
    fuel_type: str
    capacity_kg: float
    current_location: Optional[str]
    provider_reliability: float  # 0-100
    is_available: bool
    predicted_cost: float
    predicted_eta_hours: float
    suitability_score: float  # 0-100
    driver_experience: float = 5.0
    vehicle_efficiency: float = 1.0
    vehicle_number: str = ""
    provider_rating: float = 4.5
    usable_length_m: float = 3.0
    usable_width_m: float = 1.6
    usable_height_m: float = 1.6
    usable_volume_m3: float = 7.6


@dataclass
class ScoredOption:
    rank: int
    provider_id: int
    provider_name: str
    vehicle_id: int
    vehicle_type: str
    fuel_type: str
    capacity_kg: float
    current_location: Optional[str]
    predicted_cost: float
    predicted_eta_hours: float
    match_score: float  # 0-100 final score
    capacity_score: float
    suitability_score: float
    provider_reliability: float
    availability_score: float
    route_score: float
    cost_score: float
    eta_score: float
    dimension_fit: bool = True
    deadline_met: bool = True
    vehicle_name: str = ""
    vehicle_number: str = ""
    provider_rating: float = 4.5
    driver_experience: float = 4.0
    operating_route: Optional[str] = None
    cargo_weight_kg: float = 0.0
    cargo_volume_m3: float = 0.0
    usable_length_m: float = 0.0
    usable_width_m: float = 0.0
    usable_height_m: float = 0.0
    usable_volume_m3: float = 0.0
    weight_utilization_pct: float = 0.0
    volume_utilization_pct: float = 0.0
    dimension_fit_score: float = 100.0


def get_distance(pickup: str, destination: str) -> float:
    """Lookup known route distances, fallback to 300 km."""
    key = (pickup.strip().title(), destination.strip().title())
    rev_key = (destination.strip().title(), pickup.strip().title())
    return ROUTE_DISTANCES.get(key, ROUTE_DISTANCES.get(rev_key, 300.0))


def _normalize_min_better(value: float, candidates_values: List[float]) -> float:
    """Score where lower value = better. Returns 0-1."""
    if not candidates_values:
        return 0.5
    min_v = min(candidates_values)
    max_v = max(candidates_values)
    if max_v == min_v:
        return 1.0
    return 1.0 - (value - min_v) / (max_v - min_v)


def _normalize_max_better(value: float, candidates_values: List[float]) -> float:
    """Score where higher value = better. Returns 0-1."""
    if not candidates_values:
        return 0.5
    min_v = min(candidates_values)
    max_v = max(candidates_values)
    if max_v == min_v:
        return 1.0
    return (value - min_v) / (max_v - min_v)


VEHICLE_DIMS = {
    "Tata Ace": {"length": 2.14, "width": 1.52, "height": 1.52, "volume": 4.0},
    "Mahindra Bolero Pickup": {"length": 2.6, "width": 1.68, "height": 1.68, "volume": 5.5},
    "Bolero Pickup": {"length": 2.6, "width": 1.68, "height": 1.68, "volume": 5.5},
    "Tata Intra V30": {"length": 2.68, "width": 1.70, "height": 1.68, "volume": 6.0},
    "Ashok Leyland Dost": {"length": 2.9, "width": 1.77, "height": 1.83, "volume": 7.0},
    "Mini Truck": {"length": 3.0, "width": 1.6, "height": 1.6, "volume": 7.6},
    "Tata 407": {"length": 3.66, "width": 1.98, "height": 1.98, "volume": 12.0},
    "Light Commercial": {"length": 3.5, "width": 1.8, "height": 1.8, "volume": 11.3},
    "EV Cargo Van": {"length": 2.74, "width": 1.68, "height": 1.68, "volume": 7.0},
    "Tata 709": {"length": 5.18, "width": 2.13, "height": 2.29, "volume": 25.0},
    "Eicher Pro 2049": {"length": 5.79, "width": 2.19, "height": 2.29, "volume": 28.0},
    "Tata 1109": {"length": 6.40, "width": 2.29, "height": 2.44, "volume": 35.0},
    "Medium Truck": {"length": 5.5, "width": 2.1, "height": 2.2, "volume": 25.0},
    "BharatBenz 1217": {"length": 7.32, "width": 2.44, "height": 2.59, "volume": 40.0},
    "Heavy Truck": {"length": 7.0, "width": 2.4, "height": 2.4, "volume": 40.0},
}

def apply_hard_constraints(
    candidates: List[CandidateOption],
    cargo_weight_kg: float,
    deadline_hours: Optional[float],
    cargo_length_m: Optional[float] = None,
    cargo_width_m: Optional[float] = None,
    cargo_height_m: Optional[float] = None,
    cargo_volume_m3: Optional[float] = None,
) -> tuple[List[CandidateOption], List[tuple[CandidateOption, str]]]:
    """Filter out vehicles that cannot physically service the cargo requirement."""
    valid = []
    rejected = []

    for c in candidates:
        # Hard 1: Capacity check
        if cargo_weight_kg > c.capacity_kg:
            rejected.append((c, f"Insufficient capacity ({c.capacity_kg:.0f} kg < {cargo_weight_kg:.0f} kg cargo)"))
            continue

        # Hard 2: Availability check
        if not c.is_available:
            rejected.append((c, "Vehicle is currently offline or in maintenance"))
            continue

        # Hard 3: Physical dimension checks
        avail_len = c.usable_length_m or VEHICLE_DIMS.get(c.vehicle_type, {}).get("length", 3.0)
        avail_wid = c.usable_width_m or VEHICLE_DIMS.get(c.vehicle_type, {}).get("width", 1.6)
        avail_hgt = c.usable_height_m or VEHICLE_DIMS.get(c.vehicle_type, {}).get("height", 1.6)
        avail_vol = c.usable_volume_m3 or VEHICLE_DIMS.get(c.vehicle_type, {}).get("volume", 7.0)

        if cargo_length_m is not None and cargo_length_m > avail_len:
            rejected.append((c, f"Cargo length ({cargo_length_m:.1f}m) exceeds cargo bay ({avail_len:.1f}m)"))
            continue
        if cargo_width_m is not None and cargo_width_m > avail_wid:
            rejected.append((c, f"Cargo width ({cargo_width_m:.1f}m) exceeds cargo bay ({avail_wid:.1f}m)"))
            continue
        if cargo_height_m is not None and cargo_height_m > avail_hgt:
            rejected.append((c, f"Cargo height ({cargo_height_m:.1f}m) exceeds cargo bay ({avail_hgt:.1f}m)"))
            continue
        if cargo_volume_m3 is not None and cargo_volume_m3 > avail_vol:
            rejected.append((c, f"Cargo volume ({cargo_volume_m3:.1f}m³) exceeds capacity ({avail_vol:.1f}m³)"))
            continue

        valid.append(c)

    # Secondary check: If deadline is specified, only filter if at least one candidate meets it
    if deadline_hours is not None and valid:
        within_deadline = [c for c in valid if c.predicted_eta_hours <= deadline_hours * 1.25]
        if within_deadline:
            # Keep those within deadline
            for c in valid:
                if c not in within_deadline:
                    rejected.append((c, f"Cannot meet deadline (ETA {c.predicted_eta_hours:.1f}h > {deadline_hours:.1f}h)"))
            valid = within_deadline

    if rejected:
        for c, reason in rejected:
            logger.debug(f"Filtered out {c.provider_name} / {c.vehicle_type}: {reason}")

    return valid, rejected


def score_and_rank(
    candidates: List[CandidateOption],
    cargo_weight_kg: float,
    pickup: str,
    destination: str,
    deadline_hours: Optional[float] = None,
    cargo_length_m: Optional[float] = None,
    cargo_width_m: Optional[float] = None,
    cargo_height_m: Optional[float] = None,
    cargo_volume_m3: Optional[float] = None,
) -> List[ScoredOption]:
    """Apply constraints, score, and rank all valid candidates."""

    valid, _ = apply_hard_constraints(
        candidates, 
        cargo_weight_kg, 
        deadline_hours,
        cargo_length_m=cargo_length_m,
        cargo_width_m=cargo_width_m,
        cargo_height_m=cargo_height_m,
        cargo_volume_m3=cargo_volume_m3,
    )

    if not valid:
        logger.warning("No candidates passed hard constraints")
        return []

    costs = [c.predicted_cost for c in valid]
    etas = [c.predicted_eta_hours for c in valid]
    reliabilities = [c.provider_reliability for c in valid]
    suitabilities = [c.suitability_score for c in valid]

    # Capacity utilization — ideal ~70-90%
    def capacity_score_fn(c: CandidateOption) -> float:
        utilization = cargo_weight_kg / c.capacity_kg
        if utilization > 1.0:
            return 0.0
        # Peak score at ~80% utilization
        return 1.0 - abs(utilization - 0.80) * 1.2

    scored = []
    for c in valid:
        route_dist = get_distance(pickup, destination)
        # Route compatibility: score based on distance coverage adequacy
        route_score = 1.0 if route_dist <= 600 else max(0.3, 1.0 - (route_dist - 600) / 1000)

        cost_score = _normalize_min_better(c.predicted_cost, costs)
        eta_score = _normalize_min_better(c.predicted_eta_hours, etas)
        cap_score = max(0, min(1, capacity_score_fn(c)))
        vehicle_score = c.suitability_score / 100.0
        reliability_score = c.provider_reliability / 100.0
        avail_score = 1.0 if c.is_available else 0.0

        final = (
            WEIGHTS["route"]        * route_score +
            WEIGHTS["cost"]         * cost_score +
            WEIGHTS["eta"]          * eta_score +
            WEIGHTS["capacity"]     * cap_score +
            WEIGHTS["vehicle"]      * vehicle_score +
            WEIGHTS["reliability"]  * reliability_score +
            WEIGHTS["availability"] * avail_score
        ) * 100

        final = round(min(100.0, max(0.0, final)), 2)

        cargo_vol = cargo_volume_m3 or (cargo_weight_kg / 350.0)
        weight_util = round((cargo_weight_kg / c.capacity_kg) * 100, 1) if c.capacity_kg else 0.0
        vol_util = round((cargo_vol / (c.usable_volume_m3 or 7.6)) * 100, 1) if c.usable_volume_m3 else 0.0

        scored.append(ScoredOption(
            rank=0,
            provider_id=c.provider_id,
            provider_name=c.provider_name,
            vehicle_id=c.vehicle_id,
            vehicle_type=c.vehicle_type,
            fuel_type=c.fuel_type,
            capacity_kg=c.capacity_kg,
            current_location=c.current_location,
            predicted_cost=c.predicted_cost,
            predicted_eta_hours=c.predicted_eta_hours,
            match_score=final,
            capacity_score=round(cap_score * 100, 2),
            suitability_score=round(vehicle_score * 100, 2),
            provider_reliability=c.provider_reliability,
            availability_score=round(avail_score * 100, 2),
            route_score=round(route_score * 100, 2),
            cost_score=round(cost_score * 100, 2),
            eta_score=round(eta_score * 100, 2),
            dimension_fit=True,
            deadline_met=True,
            vehicle_name=f"{c.provider_name} {c.vehicle_type}",
            vehicle_number=c.vehicle_number,
            provider_rating=c.provider_rating,
            driver_experience=c.driver_experience,
            operating_route=f"{pickup} → {destination}",
            cargo_weight_kg=cargo_weight_kg,
            cargo_volume_m3=cargo_vol,
            usable_length_m=c.usable_length_m,
            usable_width_m=c.usable_width_m,
            usable_height_m=c.usable_height_m,
            usable_volume_m3=c.usable_volume_m3,
            weight_utilization_pct=weight_util,
            volume_utilization_pct=vol_util,
            dimension_fit_score=100.0,
        ))

    # Sort descending by match_score
    scored.sort(key=lambda x: x.match_score, reverse=True)
    for i, opt in enumerate(scored):
        opt.rank = i + 1

    return scored
