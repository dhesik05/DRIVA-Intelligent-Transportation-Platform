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

from app.api.routes import auth, vehicles, transport, matching, bookings, analytics, ai, ratings, providers

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
app.include_router(vehicles.router)
app.include_router(transport.router)
app.include_router(matching.router)
app.include_router(bookings.router)
app.include_router(analytics.router)
app.include_router(ai.router)
app.include_router(ratings.router)
app.include_router(providers.router)


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
    return {"status": "healthy", "service": "DRIVA"}
