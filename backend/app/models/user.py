"""Re-export models for easy imports."""
from app.models import (
    User, UserRole, Provider, Driver, Vehicle, VehicleStatus, FuelType,
    TransportRequest, RequestStatus, Priority,
    Booking, BookingStatus, TrackingUpdate, Rating,
    MLPrediction, AIRecommendation
)

__all__ = [
    "User", "UserRole", "Provider", "Driver", "Vehicle", "VehicleStatus", "FuelType",
    "TransportRequest", "RequestStatus", "Priority",
    "Booking", "BookingStatus", "TrackingUpdate", "Rating",
    "MLPrediction", "AIRecommendation"
]
