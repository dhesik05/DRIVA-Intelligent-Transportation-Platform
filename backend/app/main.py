"""
DRIVA FastAPI Application
"""
import sys
from pathlib import Path

# Make ml and root modules importable from backend
repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "ml"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
import app.models  # ensure all models are registered

from app.api.routes import auth, vehicles, transport, matching, bookings, analytics, ai, ratings, providers, dashboard, drivers, ml, admin

# Create tables (idempotent — Alembic handles migrations in production)
app_models = app.models
from app.core.database import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DRIVA API",
    description="Dynamic Routing, Intelligence & Vehicle Allocation — B2B Transportation Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(vehicles.router)
app.include_router(drivers.router)
app.include_router(transport.router)
app.include_router(matching.router)
app.include_router(bookings.router)
app.include_router(bookings.deliveries_router)
app.include_router(providers.router)
app.include_router(providers.fleet_owners_router)
app.include_router(providers.agencies_router)
app.include_router(analytics.router)
app.include_router(ai.router)
app.include_router(ratings.router)
app.include_router(ml.router)
app.include_router(admin.router)


@app.on_event("startup")
def startup_event():
    import logging
    logger = logging.getLogger("driva.startup")
    logger.info("Initializing ML models...")
    from app.services.ml_service import load_models, predict_cost, predict_eta, predict_suitability
    try:
        load_models()
        # Perform safe warmup inference
        predict_cost(
            distance_km=100.0, cargo_weight_kg=500.0, cargo_volume_m3=4.0,
            vehicle_capacity_kg=750.0, vehicle_volume_m3=4.0, vehicle_age_years=2.0,
            vehicle_efficiency=1.0, fuel_or_energy_cost=20.0, traffic_factor=1.0,
            weather_factor=1.0, provider_rating=4.5, driver_experience_years=5.0,
            historical_cost=2500.0, vehicle_type="Tata Ace", fuel_type="DIESEL",
            route="Salem_Bangalore", delivery_priority="NORMAL"
        )
        logger.info("ML warmup completed")
    except Exception as e:
        logger.error(f"ML warmup failed: {e}")

@app.get("/")
def root():
    return {
        "service": "DRIVA API",
        "tagline": "Every Journey. More Useful.",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    from app.services.ml_service import models_loaded
    loaded = models_loaded()
    return {
        "status": "healthy", 
        "service": "DRIVA",
        "ml_cost_model": "READY" if loaded.get("cost_model") else "ERROR",
        "ml_eta_model": "READY" if loaded.get("eta_model") else "ERROR",
        "ml_suitability_model": "READY" if loaded.get("suitability_model") else "ERROR",
    }
