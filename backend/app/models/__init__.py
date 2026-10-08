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
    transport_requests = relationship("TransportRequest", back_populates="business", foreign_keys="TransportRequest.business_id")
    vehicles = relationship("Vehicle", back_populates="owner")
    driver_profile = relationship("Driver", back_populates="user", uselist=False)
    provider_profile = relationship("Provider", back_populates="user", uselist=False)
    ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")


# ──────────────────────────────────────────
# Provider (Agency or Fleet Owner)
# ──────────────────────────────────────────

class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(255), nullable=False)
    service_areas = Column(Text, nullable=True)  # comma-separated
    total_vehicles = Column(Integer, default=0)
    completed_deliveries = Column(Integer, default=0)
    provider_rating = Column(Float, default=4.0)
    reliability_score = Column(Float, default=90.0)  # 0-100
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="provider_profile")
    vehicles = relationship("Vehicle", back_populates="provider")
    bookings = relationship("Booking", back_populates="provider")


# ──────────────────────────────────────────
# Driver
# ──────────────────────────────────────────

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    license_number = Column(String(50), nullable=True)
    experience_years = Column(Float, default=1.0)
    is_available = Column(Boolean, default=True)
    current_location = Column(String(255), nullable=True)
    rating = Column(Float, default=4.0)
    completed_trips = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="driver_profile")
    bookings = relationship("Booking", back_populates="driver")


# ──────────────────────────────────────────
# Vehicle
# ──────────────────────────────────────────

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    vehicle_number = Column(String(50), unique=True, nullable=False)
    vehicle_type = Column(String(100), nullable=False)  # Tata Ace, Mini Truck, etc.
    fuel_type = Column(SAEnum(FuelType), nullable=False, default=FuelType.DIESEL)
    capacity_kg = Column(Float, nullable=False)
    capacity_volume_m3 = Column(Float, nullable=True)
    vehicle_age_years = Column(Float, default=2.0)
    efficiency = Column(Float, default=1.0)  # higher = more efficient
    current_location = Column(String(255), nullable=True)
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="vehicles")
    provider = relationship("Provider", back_populates="vehicles")
    bookings = relationship("Booking", back_populates="vehicle")
    ml_predictions = relationship("MLPrediction", back_populates="vehicle")


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

    __table_args__ = (
        Index("ix_transport_requests_business_id", "business_id"),
        Index("ix_transport_requests_status", "status"),
    )


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
    commission_rate = Column(Float, default=0.05)
    driva_commission = Column(Float, nullable=True)
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

    __table_args__ = (
        Index("ix_bookings_provider_id", "provider_id"),
        Index("ix_bookings_status", "status"),
    )


# ──────────────────────────────────────────
# Tracking
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
    overall_rating = Column(Float, nullable=False)  # 1-5
    timeliness_rating = Column(Float, nullable=True)
    cost_rating = Column(Float, nullable=True)
    service_rating = Column(Float, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="rating")
    rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])


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
    match_score = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    groq_explanation = Column(Text, nullable=True)
    used_groq = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("TransportRequest", back_populates="ai_recommendation")
