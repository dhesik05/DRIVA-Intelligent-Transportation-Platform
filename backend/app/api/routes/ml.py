from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.ml_service import predict_all

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

class PredictRequest(BaseModel):
    distance_km: float
    cargo_weight_kg: float
    cargo_volume_m3: float
    cargo_length_m: Optional[float] = 1.0
    cargo_width_m: Optional[float] = 1.0
    cargo_height_m: Optional[float] = 1.0
    vehicle_type: str
    fuel_type: str
    vehicle_capacity_kg: float
    vehicle_volume_m3: float
    vehicle_length_m: Optional[float] = 2.0
    vehicle_width_m: Optional[float] = 1.5
    vehicle_height_m: Optional[float] = 1.5
    traffic_factor: float = 1.0
    weather_factor: float = 1.0
    provider_rating: float = 4.5
    driver_experience_years: float = 5.0
    availability: int = 1
    historical_cost: float = 2500.0
    historical_eta: float = 5.0
    priority: str = "NORMAL"
    deadline: Optional[float] = 24.0
    route: str = "Salem_Bangalore"

@router.post("/predict")
def predict_endpoint(req: PredictRequest):
    data = {
        "distance_km": req.distance_km,
        "cargo_weight_kg": req.cargo_weight_kg,
        "cargo_volume_m3": req.cargo_volume_m3,
        "cargo_length_m": req.cargo_length_m,
        "cargo_width_m": req.cargo_width_m,
        "cargo_height_m": req.cargo_height_m,
        "vehicle_type": req.vehicle_type,
        "fuel_type": req.fuel_type,
        "vehicle_capacity_kg": req.vehicle_capacity_kg,
        "vehicle_volume_m3": req.vehicle_volume_m3,
        "vehicle_length_m": req.vehicle_length_m,
        "vehicle_width_m": req.vehicle_width_m,
        "vehicle_height_m": req.vehicle_height_m,
        "traffic_factor": req.traffic_factor,
        "weather_factor": req.weather_factor,
        "provider_rating": req.provider_rating,
        "driver_experience_years": req.driver_experience_years,
        "vehicle_availability": req.availability,
        "historical_cost": req.historical_cost,
        "historical_delivery_time_hours": req.historical_eta,
        "delivery_priority": req.priority,
        "deadline_hours": req.deadline,
        "route": req.route,
        "vehicle_age_years": 2.0,
        "vehicle_efficiency": 1.0,
        "fuel_or_energy_cost": req.distance_km * 18.0,
    }
    
    result = predict_all(data)
    
    return {
        "predicted_cost": result["predicted_cost"],
        "predicted_eta": result["predicted_eta"],
        "suitability_score": result["suitability_score"],
        "model_version": result["model_version"]
    }
