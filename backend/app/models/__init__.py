"""DRIVA Database Models — Single source of truth for all tables."""
from __future__ import annotations
import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey,
    Text, Enum as SAEnum, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# ──────────────────────────────────────────
# Enumerations
# ──────────────────────────────────────────

class UserRole(str, enum.Enum):
    BUSINESS_OWNER = "BUSINESS_OWNER"
    FLEET_OWNER = "FLEET_OWNER"
    LOGISTICS_AGENCY = "LOGISTICS_AGENCY"
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"


class ProviderType(str, enum.Enum):
    FLEET_OWNER = "FLEET_OWNER"
    LOGISTICS_AGENCY = "LOGISTICS_AGENCY"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"


class FuelType(str, enum.Enum):
    EV = "EV"
    PETROL = "PETROL"
    DIESEL = "DIESEL"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    MATCHING = "MATCHING"
    MATCHED = "MATCHED"
    BOOKED = "BOOKED"
    CANCELLED = "CANCELLED"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    DRIVER_ASSIGNED = "DRIVER_ASSIGNED"
    VEHICLE_ARRIVED = "VEHICLE_ARRIVED"
    PICKUP_COMPLETED = "PICKUP_COMPLETED"
    IN_TRANSIT = "IN_TRANSIT"
    NEAR_DESTINATION = "NEAR_DESTINATION"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Priority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


# ──────────────────────────────────────────
# User
# ──────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.BUSINESS_OWNER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)
    transport_requests = relationship("TransportRequest", back_populates="business", foreign_keys="TransportRequest.business_id")
    vehicles = relationship("Vehicle", back_populates="owner", foreign_keys="Vehicle.owner_id")
    driver_profile = relationship("Driver", back_populates="user", uselist=False, foreign_keys="Driver.user_id")
    provider_profile = relationship("Provider", back_populates="user", uselist=False, foreign_keys="Provider.user_id")
    ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")
    notifications = relationship("Notification", back_populates="user")


# ──────────────────────────────────────────
# Business Profile
# ──────────────────────────────────────────

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    business_name = Column(String(255), nullable=False)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    total_requests = Column(Integer, default=0)
    active_shipments = Column(Integer, default=0)
    completed_shipments = Column(Integer, default=0)
    total_spend = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="business_profile")


# ──────────────────────────────────────────
# Provider (Fleet Owner or Logistics Agency)
# ──────────────────────────────────────────

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_type = Column(SAEnum(ProviderType), default=ProviderType.FLEET_OWNER)
    company_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), nullable=True)
    service_areas = Column(Text, nullable=True)  # comma-separated
    total_vehicles = Column(Integer, default=0)
    available_vehicles = Column(Integer, default=0)
    assigned_vehicles = Column(Integer, default=0)
    completed_deliveries = Column(Integer, default=0)
    provider_rating = Column(Float, default=4.5)
    reliability_score = Column(Float, default=92.0)  # 0-100
    success_rate = Column(Float, default=95.0)  # percentage
    verification_status = Column(String(50), default="VERIFIED")
    fleet_capacity = Column(String(100), nullable=True)
    active_shipments = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="provider_profile")
    vehicles = relationship("Vehicle", back_populates="provider", foreign_keys="Vehicle.provider_id")
    drivers = relationship("Driver", back_populates="provider", foreign_keys="Driver.provider_id")
    bookings = relationship("Booking", back_populates="provider")


# ──────────────────────────────────────────
# Driver
# ──────────────────────────────────────────

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    assigned_vehicle_id = Column(Integer, ForeignKey("vehicles.id", use_alter=True, name="fk_drivers_vehicle_id"), nullable=True)

    name = Column(String(255), nullable=False, default="Driver")
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    license_number = Column(String(50), nullable=True)
    license_type = Column(String(50), default="Commercial HMV")
    experience_years = Column(Float, default=3.0)
    rating = Column(Float, default=4.5)
    total_deliveries = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)
    completed_trips = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    current_location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="driver_profile")
    provider = relationship("Provider", back_populates="drivers", foreign_keys=[provider_id])
    assigned_vehicle = relationship("Vehicle", foreign_keys=[assigned_vehicle_id], post_update=True)
    bookings = relationship("Booking", back_populates="driver")


# ──────────────────────────────────────────
# Vehicle
# ──────────────────────────────────────────

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id", use_alter=True, name="fk_vehicles_driver_id"), nullable=True)

    registration_number = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    vehicle_type = Column(String(100), nullable=False)  # Tata Ace, Mahindra Bolero Pickup, etc.
    make = Column(String(100), default="Tata")
    model = Column(String(100), default="Standard")
    manufacture_year = Column(Integer, default=2022)
    fuel_type = Column(SAEnum(FuelType), nullable=False, default=FuelType.DIESEL)

    capacity_kg = Column(Float, nullable=False)
    volume_m3 = Column(Float, default=4.0)
    capacity_volume_m3 = Column(Float, nullable=True)  # legacy sync

    length_ft = Column(Float, default=7.0)
    width_ft = Column(Float, default=5.0)
    height_ft = Column(Float, default=5.0)

    current_location = Column(String(255), nullable=True)
    home_location = Column(String(255), nullable=True)
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    availability = Column(Boolean, default=True)

    vehicle_age_years = Column(Float, default=2.0)
    vehicle_age = Column(Float, default=2.0)
    mileage = Column(Float, default=45000.0)
    efficiency = Column(Float, default=1.0)
    fuel_efficiency = Column(Float, default=14.0)  # km/l or km/kWh
    rating = Column(Float, default=4.7)

    total_deliveries = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)

    insurance_expiry = Column(String(50), nullable=True)
    fitness_expiry = Column(String(50), nullable=True)
    last_service_date = Column(String(50), nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="vehicles", foreign_keys=[owner_id])
    provider = relationship("Provider", back_populates="vehicles", foreign_keys=[provider_id])
    driver = relationship("Driver", foreign_keys=[driver_id], post_update=True)
    bookings = relationship("Booking", back_populates="vehicle")
    ml_predictions = relationship("MLPrediction", back_populates="vehicle")
    assignments = relationship("VehicleAssignment", back_populates="vehicle")


# ──────────────────────────────────────────
# Transport Request
# ──────────────────────────────────────────

class TransportRequest(Base):
    __tablename__ = "transport_requests"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pickup_location = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    cargo_type = Column(String(100), nullable=False)
    cargo_weight_kg = Column(Float, nullable=False)
    cargo_volume_m3 = Column(Float, nullable=True)
    cargo_length_m = Column(Float, nullable=True)
    cargo_width_m = Column(Float, nullable=True)
    cargo_height_m = Column(Float, nullable=True)
    cargo_dimensions = Column(String(255), nullable=True)
    vehicle_type_preference = Column(String(100), nullable=True)
    deadline = Column(DateTime, nullable=True)
    priority = Column(SAEnum(Priority), default=Priority.NORMAL)
    special_requirements = Column(Text, nullable=True)
    status = Column(SAEnum(RequestStatus), default=RequestStatus.PENDING)
    estimated_distance_km = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business = relationship("User", back_populates="transport_requests", foreign_keys=[business_id])
    booking = relationship("Booking", back_populates="request", uselist=False)
    ml_predictions = relationship("MLPrediction", back_populates="request")
    ai_recommendation = relationship("AIRecommendation", back_populates="request", uselist=False)
    assignments = relationship("VehicleAssignment", back_populates="request")

    __table_args__ = (
        Index("ix_transport_requests_business_id", "business_id"),
        Index("ix_transport_requests_status", "status"),
    )


# ──────────────────────────────────────────
# Vehicle Assignment
# ──────────────────────────────────────────

class VehicleAssignment(Base):
    __tablename__ = "vehicle_assignments"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    status = Column(String(50), default="ACTIVE")
    assigned_at = Column(DateTime, default=datetime.utcnow)
    released_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    vehicle = relationship("Vehicle", back_populates="assignments")
    driver = relationship("Driver")
    request = relationship("TransportRequest", back_populates="assignments")
    booking = relationship("Booking", back_populates="assignments")


# ──────────────────────────────────────────
# Booking
# ──────────────────────────────────────────

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=False, unique=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    quoted_price = Column(Float, nullable=False)
    estimated_eta_hours = Column(Float, nullable=False)
    match_score = Column(Float, nullable=True)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.CONFIRMED)

    # DRIVA Service Fee (transparent 5%)
    driva_fee_rate = Column(Float, default=0.05)
    driva_service_fee = Column(Float, nullable=True)

    pickup_time = Column(DateTime, nullable=True)
    delivered_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    request = relationship("TransportRequest", back_populates="booking")
    provider = relationship("Provider", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    driver = relationship("Driver", back_populates="bookings")
    rating = relationship("Rating", back_populates="booking", uselist=False)
    tracking_updates = relationship("TrackingUpdate", back_populates="booking")
    assignments = relationship("VehicleAssignment", back_populates="booking")

    __table_args__ = (
        Index("ix_bookings_provider_id", "provider_id"),
        Index("ix_bookings_status", "status"),
    )


# ──────────────────────────────────────────
# Tracking Update (Delivery Status)
# ──────────────────────────────────────────

class TrackingUpdate(Base):
    __tablename__ = "tracking_updates"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    status = Column(SAEnum(BookingStatus), nullable=False)
    location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="tracking_updates")


# ──────────────────────────────────────────
# Rating
# ──────────────────────────────────────────

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    overall_rating = Column(Float, nullable=False)  # 1-5
    timeliness_rating = Column(Float, nullable=True)
    cost_rating = Column(Float, nullable=True)
    service_rating = Column(Float, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="rating")
    rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])


# ──────────────────────────────────────────
# Notification
# ──────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="INFO")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


# ──────────────────────────────────────────
# ML Prediction
# ──────────────────────────────────────────

class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    predicted_cost = Column(Float, nullable=True)
    predicted_eta_hours = Column(Float, nullable=True)
    suitability_score = Column(Float, nullable=True)
    model_version = Column(String(50), default="1.0.0")
    used_fallback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("TransportRequest", back_populates="ml_predictions")
    vehicle = relationship("Vehicle", back_populates="ml_predictions")

    __table_args__ = (
        Index("ix_ml_predictions_request_id", "request_id"),
    )


# ──────────────────────────────────────────
# AI Recommendation
# ──────────────────────────────────────────

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("transport_requests.id"), nullable=False, unique=True)
    recommended_provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    recommended_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    match_score = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    groq_explanation = Column(Text, nullable=True)
    used_groq = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("TransportRequest", back_populates="ai_recommendation")
