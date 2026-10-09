import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
import pandas as pd

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent.parent.parent / "ml" / "models"

_COST_MODEL = None
_ETA_MODEL = None
_SUIT_MODEL = None

VEHICLE_BASE_COST = {
    "Tata Ace": 18,
    "Bolero Pickup": 22,
    "Mahindra Bolero Pickup": 22,
    "Tata Intra V30": 23,
    "Mini Truck": 28,
    "EV Cargo Van": 12,
    "Light Commercial": 20,
    "Ashok Leyland Dost": 22,
    "Tata 407": 32,
    "Light Commercial Vehicle": 35,
    "Medium Truck": 45,
    "Tata 709": 40,
    "Heavy Truck": 65,
}

def load_models():
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

def _encode_val(encoders, col, val):
    if not encoders or col not in encoders:
        return 0
    le = encoders[col]
    if val in le.classes_:
        return int(le.transform([val])[0])
    return 0

def predict_cost(
    distance_km: float,
    cargo_weight_kg: float,
    cargo_volume_m3: float,
    vehicle_capacity_kg: float,
    vehicle_volume_m3: float,
    vehicle_age_years: float,
    vehicle_efficiency: float,
    fuel_or_energy_cost: float,
    traffic_factor: float,
    weather_factor: float,
    provider_rating: float,
    driver_experience_years: float,
    historical_cost: float,
    vehicle_type: str,
    fuel_type: str,
    route: str,
    delivery_priority: str
) -> Tuple[float, bool]:
    if _COST_MODEL:
        try:
            encoders = _COST_MODEL["encoders"]
            features_order = _COST_MODEL["features"]
            
            data_dict = {
                "distance_km": distance_km,
                "cargo_weight_kg": cargo_weight_kg,
                "cargo_volume_m3": cargo_volume_m3,
                "vehicle_capacity_kg": vehicle_capacity_kg,
                "vehicle_volume_m3": vehicle_volume_m3,
                "vehicle_age_years": vehicle_age_years,
                "vehicle_efficiency": vehicle_efficiency,
                "fuel_or_energy_cost": fuel_or_energy_cost,
                "traffic_factor": traffic_factor,
                "weather_factor": weather_factor,
                "provider_rating": provider_rating,
                "driver_experience_years": driver_experience_years,
                "historical_cost": historical_cost,
                "vehicle_type_enc": _encode_val(encoders, "vehicle_type", vehicle_type),
                "fuel_type_enc": _encode_val(encoders, "fuel_type", fuel_type),
                "route_enc": _encode_val(encoders, "route", route),
                "delivery_priority_enc": _encode_val(encoders, "delivery_priority", delivery_priority),
            }
            
            df = pd.DataFrame([[data_dict[f] for f in features_order]], columns=features_order)
            cost = float(_COST_MODEL["model"].predict(df)[0])
            return max(500.0, cost), False
        except Exception as e:
            logger.warning(f"Cost predict error: {e}")

    # Fallback
    base_cost = VEHICLE_BASE_COST.get(vehicle_type, 20)
    cost = base_cost * distance_km + (cargo_weight_kg * 0.5)
    cost *= traffic_factor
    if fuel_type == "EV": cost *= 0.65
    return max(500.0, round(cost, 2)), True


def predict_eta(
    distance_km: float,
    cargo_weight_kg: float,
    traffic_factor: float,
    weather_factor: float,
    vehicle_type: str,
    vehicle_capacity_kg: float,
    vehicle_efficiency: float,
    driver_experience_years: float,
    historical_delivery_time_hours: float,
    delivery_priority: str,
    route: str
) -> Tuple[float, bool]:
    if _ETA_MODEL:
        try:
            encoders = _ETA_MODEL["encoders"]
            features_order = _ETA_MODEL["features"]
            
            data_dict = {
                "distance_km": distance_km,
                "cargo_weight_kg": cargo_weight_kg,
                "traffic_factor": traffic_factor,
                "weather_factor": weather_factor,
                "vehicle_type_enc": _encode_val(encoders, "vehicle_type", vehicle_type),
                "vehicle_capacity_kg": vehicle_capacity_kg,
                "vehicle_efficiency": vehicle_efficiency,
                "driver_experience_years": driver_experience_years,
                "historical_delivery_time_hours": historical_delivery_time_hours,
                "delivery_priority_enc": _encode_val(encoders, "delivery_priority", delivery_priority),
                "route_enc": _encode_val(encoders, "route", route),
            }
            
            df = pd.DataFrame([[data_dict[f] for f in features_order]], columns=features_order)
            eta = float(_ETA_MODEL["model"].predict(df)[0])
            return max(1.0, eta), False
        except Exception as e:
            logger.warning(f"ETA predict error: {e}")

    # Fallback
    eta = (distance_km / 55.0) * traffic_factor * weather_factor
    return max(1.0, round(eta, 2)), True


def predict_suitability(
    cargo_weight_kg: float,
    cargo_volume_m3: float,
    cargo_length_m: float,
    cargo_width_m: float,
    cargo_height_m: float,
    vehicle_capacity_kg: float,
    vehicle_volume_m3: float,
    vehicle_length_m: float,
    vehicle_width_m: float,
    vehicle_height_m: float,
    vehicle_type: str,
    fuel_type: str,
    provider_rating: float,
    driver_experience_years: float,
    vehicle_availability: int,
    route: str,
    delivery_priority: str
) -> Tuple[float, bool]:
    if _SUIT_MODEL:
        try:
            encoders = _SUIT_MODEL["encoders"]
            features_order = _SUIT_MODEL["features"]
            
            data_dict = {
                "cargo_weight_kg": cargo_weight_kg,
                "cargo_volume_m3": cargo_volume_m3,
                "cargo_length_m": cargo_length_m,
                "cargo_width_m": cargo_width_m,
                "cargo_height_m": cargo_height_m,
                "vehicle_capacity_kg": vehicle_capacity_kg,
                "vehicle_volume_m3": vehicle_volume_m3,
                "vehicle_length_m": vehicle_length_m,
                "vehicle_width_m": vehicle_width_m,
                "vehicle_height_m": vehicle_height_m,
                "vehicle_type_enc": _encode_val(encoders, "vehicle_type", vehicle_type),
                "fuel_type_enc": _encode_val(encoders, "fuel_type", fuel_type),
                "provider_rating": provider_rating,
                "driver_experience_years": driver_experience_years,
                "vehicle_availability": vehicle_availability,
                "route_enc": _encode_val(encoders, "route", route),
                "delivery_priority_enc": _encode_val(encoders, "delivery_priority", delivery_priority),
            }
            
            df = pd.DataFrame([[data_dict[f] for f in features_order]], columns=features_order)
            prob = float(_SUIT_MODEL["model"].predict_proba(df)[0][1])
            return round(prob * 100, 2), False
        except Exception as e:
            logger.warning(f"Suitability predict error: {e}")

    # Fallback
    score = 0
    if cargo_weight_kg <= vehicle_capacity_kg: score += 40
    if vehicle_availability == 1: score += 20
    score += (provider_rating / 5.0) * 20
    return round(score, 2), True

def predict_all(data: dict) -> dict:
    cost, cost_fb = predict_cost(
        distance_km=data.get("distance_km", 100),
        cargo_weight_kg=data.get("cargo_weight_kg", 500),
        cargo_volume_m3=data.get("cargo_volume_m3", 4.0),
        vehicle_capacity_kg=data.get("vehicle_capacity_kg", 750),
        vehicle_volume_m3=data.get("vehicle_volume_m3", 4.0),
        vehicle_age_years=data.get("vehicle_age_years", 2.0),
        vehicle_efficiency=data.get("vehicle_efficiency", 1.0),
        fuel_or_energy_cost=data.get("fuel_or_energy_cost", 20.0),
        traffic_factor=data.get("traffic_factor", 1.0),
        weather_factor=data.get("weather_factor", 1.0),
        provider_rating=data.get("provider_rating", 4.5),
        driver_experience_years=data.get("driver_experience_years", 5.0),
        historical_cost=data.get("historical_cost", 2500.0),
        vehicle_type=data.get("vehicle_type", "Tata Ace"),
        fuel_type=data.get("fuel_type", "DIESEL"),
        route=data.get("route", "Salem_Bangalore"),
        delivery_priority=data.get("delivery_priority", "NORMAL")
    )
    
    eta, eta_fb = predict_eta(
        distance_km=data.get("distance_km", 100),
        cargo_weight_kg=data.get("cargo_weight_kg", 500),
        traffic_factor=data.get("traffic_factor", 1.0),
        weather_factor=data.get("weather_factor", 1.0),
        vehicle_type=data.get("vehicle_type", "Tata Ace"),
        vehicle_capacity_kg=data.get("vehicle_capacity_kg", 750),
        vehicle_efficiency=data.get("vehicle_efficiency", 1.0),
        driver_experience_years=data.get("driver_experience_years", 5.0),
        historical_delivery_time_hours=data.get("historical_delivery_time_hours", 5.0),
        delivery_priority=data.get("delivery_priority", "NORMAL"),
        route=data.get("route", "Salem_Bangalore")
    )
    
    suitability, suit_fb = predict_suitability(
        cargo_weight_kg=data.get("cargo_weight_kg", 500),
        cargo_volume_m3=data.get("cargo_volume_m3", 4.0),
        cargo_length_m=data.get("cargo_length_m", 2.0),
        cargo_width_m=data.get("cargo_width_m", 1.5),
        cargo_height_m=data.get("cargo_height_m", 1.5),
        vehicle_capacity_kg=data.get("vehicle_capacity_kg", 750),
        vehicle_volume_m3=data.get("vehicle_volume_m3", 4.0),
        vehicle_length_m=data.get("vehicle_length_m", 2.1),
        vehicle_width_m=data.get("vehicle_width_m", 1.6),
        vehicle_height_m=data.get("vehicle_height_m", 1.6),
        vehicle_type=data.get("vehicle_type", "Tata Ace"),
        fuel_type=data.get("fuel_type", "DIESEL"),
        provider_rating=data.get("provider_rating", 4.5),
        driver_experience_years=data.get("driver_experience_years", 5.0),
        vehicle_availability=data.get("vehicle_availability", 1),
        route=data.get("route", "Salem_Bangalore"),
        delivery_priority=data.get("delivery_priority", "NORMAL")
    )
    
    return {
        "predicted_cost": cost,
        "predicted_eta": eta,
        "suitability_score": suitability,
        "used_fallback": cost_fb or eta_fb or suit_fb,
        "model_version": _COST_MODEL["metadata"]["version"] if _COST_MODEL else "fallback"
    }

def models_loaded() -> dict:
    return {
        "cost_model": _COST_MODEL is not None,
        "eta_model": _ETA_MODEL is not None,
        "suitability_model": _SUIT_MODEL is not None,
    }
