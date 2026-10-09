"""
DRIVA ML Inference Engine
==========================
Loads trained models and provides prediction methods.
Models are loaded ONCE at import — never retrained per request.
Falls back to deterministic formulas if models are unavailable.
"""

from __future__ import annotations
import logging
from pathlib import Path
from typing import Optional, Dict, Any

import warnings
warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "models"

# ─── Model cache ─────────────────────────────────────────────────────────────
_COST_MODEL: Optional[Dict] = None
_ETA_MODEL: Optional[Dict] = None
_SUIT_MODEL: Optional[Dict] = None

FUEL_MAP = {"DIESEL": 0, "PETROL": 1, "EV": 2}
PRIORITY_MAP = {"LOW": 0, "NORMAL": 1, "HIGH": 2, "URGENT": 3}
VEHICLE_ENC = {
    "Tata Ace": 0,
    "Bolero Pickup": 1,
    "Mahindra Bolero Pickup": 1,
    "Tata Intra V30": 1,
    "Mini Truck": 2,
    "EV Cargo Van": 3,
    "Light Commercial": 4,
    "Ashok Leyland Dost": 4,
    "Tata 407": 4,
    "Medium Truck": 5,
    "Tata 709": 5,
    "Eicher Pro 2049": 5,
    "Tata 1109": 5,
    "Heavy Truck": 6,
    "BharatBenz 1217": 6,
}
VEHICLE_BASE_COST = {
    "Tata Ace": 18,
    "Bolero Pickup": 22,
    "Mahindra Bolero Pickup": 22,
    "Tata Intra V30": 23,
    "Mini Truck": 28,
    "EV Cargo Van": 12,
    "Light Commercial": 20,
    "Ashok Leyland Dost": 22,
    "Tata 407": 26,
    "Medium Truck": 35,
    "Tata 709": 34,
    "Eicher Pro 2049": 35,
    "Tata 1109": 38,
    "Heavy Truck": 55,
    "BharatBenz 1217": 52,
}


def _load_models():
    global _COST_MODEL, _ETA_MODEL, _SUIT_MODEL
    try:
        import joblib
        cost_path = MODEL_DIR / "cost_model.pkl"
        eta_path = MODEL_DIR / "eta_model.pkl"
        suit_path = MODEL_DIR / "suitability_model.pkl"

        if cost_path.exists():
            _COST_MODEL = joblib.load(cost_path)
            logger.info("Cost model loaded ✓")
        if eta_path.exists():
            _ETA_MODEL = joblib.load(eta_path)
            logger.info("ETA model loaded ✓")
        if suit_path.exists():
            _SUIT_MODEL = joblib.load(suit_path)
            logger.info("Suitability model loaded ✓")
    except Exception as e:
        logger.warning(f"Failed to load ML models: {e}. Using fallback formulas.")


# Load on module import
_load_models()


# ─── Inference functions ─────────────────────────────────────────────────────

def predict_cost(
    distance_km: float,
    cargo_weight_kg: float,
    cargo_volume_m3: float,
    fuel_type: str,
    vehicle_type: str,
    vehicle_capacity_kg: float,
    vehicle_age_years: float,
    vehicle_efficiency: float,
    traffic_factor: float = 1.0,
    weather_factor: float = 1.0,
    priority: str = "NORMAL",
) -> tuple[float, bool]:
    """Returns (predicted_cost_inr, used_fallback)."""
    fuel_enc = FUEL_MAP.get(fuel_type, 0)
    priority_enc = PRIORITY_MAP.get(priority, 1)
    vehicle_enc = VEHICLE_ENC.get(vehicle_type, 2)

    if _COST_MODEL:
        try:
            features = [[
                distance_km, cargo_weight_kg, cargo_volume_m3,
                fuel_enc, vehicle_capacity_kg, vehicle_age_years,
                vehicle_efficiency, traffic_factor, weather_factor,
                priority_enc, vehicle_enc
            ]]
            df_feat = pd.DataFrame(features, columns=_COST_MODEL["features"])
            cost = float(_COST_MODEL["model"].predict(df_feat)[0])
            return max(500.0, cost), False
        except Exception as e:
            logger.warning(f"Cost model predict failed: {e}")

    # Fallback formula
    base_rate = VEHICLE_BASE_COST.get(vehicle_type, 25)
    cost = base_rate * distance_km
    cost += cargo_weight_kg * 0.8
    cost *= (1 + (traffic_factor - 1.0) * 0.3)
    cost *= PRIORITY_MAP.get(priority, 1) * 0.1 + 0.9
    if fuel_type == "EV":
        cost *= 0.65
    return max(500.0, round(cost, 2)), True


def predict_eta(
    distance_km: float,
    cargo_weight_kg: float,
    traffic_factor: float = 1.0,
    weather_factor: float = 1.0,
    vehicle_type: str = "Mini Truck",
    vehicle_efficiency: float = 1.0,
    vehicle_age_years: float = 2.0,
    priority: str = "NORMAL",
) -> tuple[float, bool]:
    """Returns (predicted_eta_hours, used_fallback)."""
    vehicle_enc = VEHICLE_ENC.get(vehicle_type, 2)
    priority_enc = PRIORITY_MAP.get(priority, 1)

    if _ETA_MODEL:
        try:
            features = [[
                distance_km, cargo_weight_kg,
                traffic_factor, weather_factor,
                vehicle_efficiency, vehicle_age_years,
                vehicle_enc, priority_enc
            ]]
            df_feat = pd.DataFrame(features, columns=_ETA_MODEL["features"])
            eta = float(_ETA_MODEL["model"].predict(df_feat)[0])
            return max(0.5, eta), False
        except Exception as e:
            logger.warning(f"ETA model predict failed: {e}")

    # Fallback
    base = distance_km / 60.0
    eta = base * traffic_factor * ((weather_factor - 1.0) * 0.3 + 1.0)
    eta *= (1 + vehicle_age_years * 0.01)
    return max(0.5, round(eta, 2)), True


def predict_suitability(
    distance_km: float,
    cargo_weight_kg: float,
    vehicle_capacity_kg: float,
    vehicle_availability: int,
    deadline_hours: float,
    estimated_eta_hours: float,
    provider_rating: float,
    driver_experience_years: float,
    vehicle_efficiency: float,
    vehicle_age_years: float,
    traffic_factor: float = 1.0,
    weather_factor: float = 1.0,
    fuel_type: str = "DIESEL",
    priority: str = "NORMAL",
    vehicle_type: str = "Mini Truck",
) -> tuple[float, bool]:
    """Returns (suitability_score 0-100, used_fallback)."""
    fuel_enc = FUEL_MAP.get(fuel_type, 0)
    priority_enc = PRIORITY_MAP.get(priority, 1)
    vehicle_enc = VEHICLE_ENC.get(vehicle_type, 2)

    if _SUIT_MODEL:
        try:
            features = [[
                distance_km, cargo_weight_kg, vehicle_capacity_kg,
                vehicle_availability, deadline_hours, estimated_eta_hours,
                provider_rating, driver_experience_years,
                vehicle_efficiency, vehicle_age_years,
                traffic_factor, weather_factor,
                fuel_enc, priority_enc, vehicle_enc
            ]]
            df_feat = pd.DataFrame(features, columns=_SUIT_MODEL["features"])
            prob = float(_SUIT_MODEL["model"].predict_proba(df_feat)[0][1])
            return round(prob * 100, 2), False
        except Exception as e:
            logger.warning(f"Suitability model predict failed: {e}")

    # Fallback scoring
    score = 0.0
    if cargo_weight_kg <= vehicle_capacity_kg:
        score += 35
    if vehicle_availability:
        score += 15
    if estimated_eta_hours <= deadline_hours:
        score += 20
    score += (provider_rating / 5.0) * 15
    score += min(driver_experience_years / 20, 1.0) * 10
    score += (vehicle_efficiency / 1.5) * 5
    return round(min(100, score), 2), True


def models_loaded() -> dict:
    return {
        "cost_model": _COST_MODEL is not None,
        "eta_model": _ETA_MODEL is not None,
        "suitability_model": _SUIT_MODEL is not None,
    }
