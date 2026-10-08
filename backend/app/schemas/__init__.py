"""Pydantic schemas for all DRIVA API endpoints."""
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from app.models import UserRole, VehicleStatus, FuelType, RequestStatus, BookingStatus, Priority


# ──────────────────────────────────────────
# Auth
# ──────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.BUSINESS_OWNER

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Provider
# ──────────────────────────────────────────

class ProviderOut(BaseModel):
    id: int
    user_id: int
    company_name: str
    service_areas: Optional[str]
    total_vehicles: int
    completed_deliveries: int
    provider_rating: float
    reliability_score: float
    is_active: bool

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Vehicle
# ──────────────────────────────────────────

class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    fuel_type: FuelType
    capacity_kg: float
    capacity_volume_m3: Optional[float] = None
    vehicle_age_years: float = 2.0
    efficiency: float = 1.0
    current_location: Optional[str] = None


class VehicleUpdate(BaseModel):
    vehicle_type: Optional[str] = None
    fuel_type: Optional[FuelType] = None
    capacity_kg: Optional[float] = None
    status: Optional[VehicleStatus] = None
    current_location: Optional[str] = None
    efficiency: Optional[float] = None


class VehicleOut(BaseModel):
    id: int
    owner_id: int
    provider_id: Optional[int]
    vehicle_number: str
    vehicle_type: str
    fuel_type: FuelType
    capacity_kg: float
    capacity_volume_m3: Optional[float]
    vehicle_age_years: float
    efficiency: float
    current_location: Optional[str]
    status: VehicleStatus
    is_active: bool

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Transport Request
# ──────────────────────────────────────────

class TransportRequestCreate(BaseModel):
    pickup_location: str
    destination: str
    cargo_type: str
    cargo_weight_kg: float
    cargo_volume_m3: Optional[float] = None
    cargo_length_m: Optional[float] = None
    cargo_width_m: Optional[float] = None
    cargo_height_m: Optional[float] = None
    cargo_dimensions: Optional[str] = None
    vehicle_type_preference: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Priority = Priority.NORMAL
    special_requirements: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Support alternative field names from frontend
            if "cargo_weight_kg" not in data and "cargo_weight" in data:
                data["cargo_weight_kg"] = data["cargo_weight"]
            if "cargo_volume_m3" not in data and "cargo_volume" in data:
                data["cargo_volume_m3"] = data["cargo_volume"]
            if "vehicle_type_preference" not in data and "vehicle_type" in data:
                data["vehicle_type_preference"] = data["vehicle_type"]

            # Parse deadline string or natural language
            dl = data.get("deadline")
            if isinstance(dl, str):
                dl_strip = dl.strip()
                try:
                    data["deadline"] = datetime.fromisoformat(dl_strip)
                except Exception:
                    dl_lower = dl_strip.lower()
                    now = datetime.utcnow()
                    if "8" in dl_lower:
                        data["deadline"] = now + timedelta(hours=8)
                    elif "12" in dl_lower:
                        data["deadline"] = now + timedelta(hours=12)
                    elif "24" in dl_lower or "next day" in dl_lower:
                        data["deadline"] = now + timedelta(hours=24)
                    elif "48" in dl_lower:
                        data["deadline"] = now + timedelta(hours=48)
                    else:
                        data["deadline"] = now + timedelta(hours=8)
        return data


class TransportRequestOut(BaseModel):
    id: int
    business_id: int
    pickup_location: str
    destination: str
    cargo_type: str
    cargo_weight_kg: float
    cargo_volume_m3: Optional[float]
    vehicle_type_preference: Optional[str]
    deadline: Optional[datetime]
    priority: Priority
    status: RequestStatus
    estimated_distance_km: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# ML Prediction
# ──────────────────────────────────────────

class MLPredictionOut(BaseModel):
    vehicle_id: int
    predicted_cost: float
    predicted_eta_hours: float
    suitability_score: float
    used_fallback: bool

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Match Result
# ──────────────────────────────────────────

class MatchOption(BaseModel):
    rank: int
    provider_id: int
    provider_name: str
    provider_rating: float = 4.5
    provider_reliability: float
    operating_route: Optional[str] = None
    is_available: bool = True

    vehicle_id: int
    vehicle_name: str = ""
    vehicle_type: str
    vehicle_number: str = ""
    fuel_type: str
    capacity_kg: float
    driver_experience: float = 4.0
    current_location: Optional[str] = None

    # Cargo Fit & Dimensions
    cargo_weight_kg: float = 0.0
    cargo_volume_m3: float = 0.0
    usable_length_m: float = 0.0
    usable_width_m: float = 0.0
    usable_height_m: float = 0.0
    usable_volume_m3: float = 0.0
    weight_utilization_pct: float = 0.0
    volume_utilization_pct: float = 0.0
    dimension_fit: bool = True
    deadline_met: bool = True

    # Predictions
    predicted_cost: float
    predicted_eta_hours: float
    suitability_score: float

    # Decision Factors
    match_score: float
    route_score: float
    cost_score: float
    eta_score: float
    capacity_score: float
    dimension_fit_score: float = 100.0
    availability_score: float


class MatchResponse(BaseModel):
    request_id: int
    pickup: str
    destination: str
    cargo_type: Optional[str] = "General Freight"
    cargo_weight_kg: float
    cargo_length_m: Optional[float] = None
    cargo_width_m: Optional[float] = None
    cargo_height_m: Optional[float] = None
    cargo_volume_m3: Optional[float] = None
    deadline_hours: Optional[float] = None
    priority: Optional[str] = "NORMAL"
    options: List[MatchOption]
    recommended: Optional[MatchOption]
    groq_explanation: Optional[str] = None


# ──────────────────────────────────────────
# Booking
# ──────────────────────────────────────────

class BookingCreate(BaseModel):
    request_id: int
    provider_id: int
    vehicle_id: int


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    location: Optional[str] = None
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    request_id: int
    provider_id: int
    vehicle_id: Optional[int]
    driver_id: Optional[int]
    quoted_price: float
    estimated_eta_hours: float
    match_score: Optional[float]
    status: BookingStatus
    commission_rate: float
    driva_commission: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookingWithDetails(BookingOut):
    provider: Optional[ProviderOut] = None
    vehicle: Optional[VehicleOut] = None
    request: Optional[TransportRequestOut] = None


# ──────────────────────────────────────────
# Rating
# ──────────────────────────────────────────

class RatingCreate(BaseModel):
    booking_id: int
    overall_rating: float
    timeliness_rating: Optional[float] = None
    cost_rating: Optional[float] = None
    service_rating: Optional[float] = None
    comment: Optional[str] = None

    @field_validator("overall_rating")
    @classmethod
    def validate_rating(cls, v: float) -> float:
        if not 1.0 <= v <= 5.0:
            raise ValueError("Rating must be between 1 and 5")
        return v


class RatingOut(BaseModel):
    id: int
    booking_id: int
    overall_rating: float
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# Tracking
# ──────────────────────────────────────────

class TrackingOut(BaseModel):
    booking_id: int
    current_status: BookingStatus
    updates: List[dict]
    pickup_location: str
    destination: str


# ──────────────────────────────────────────
# Analytics
# ──────────────────────────────────────────

class AdminAnalytics(BaseModel):
    total_users: int
    total_businesses: int
    total_fleet_owners: int
    total_agencies: int
    total_drivers: int
    total_vehicles: int
    total_bookings: int
    total_gmv: float
    driva_revenue: float
    avg_match_score: float
    avg_booking_value: float
    active_providers: int


class BusinessAnalytics(BaseModel):
    total_requests: int
    active_deliveries: int
    completed_deliveries: int
    total_spend: float
    avg_cost_per_delivery: float
    recent_requests: List[TransportRequestOut]


# ──────────────────────────────────────────
# AI
# ──────────────────────────────────────────

class AIExplainRequest(BaseModel):
    request_id: int


class AIExplainResponse(BaseModel):
    explanation: str
    used_groq: bool


class AIAssistantRequest(BaseModel):
    message: str
    context_request_id: Optional[int] = None


class AIAssistantResponse(BaseModel):
    reply: str
    used_groq: bool
