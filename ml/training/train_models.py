"""
DRIVA ML Training — All three models in one script
====================================================
Trains cost_model.pkl, eta_model.pkl, suitability_model.pkl

Usage:
    python ml/training/train_models.py
"""

import sys
from pathlib import Path
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder

SEED = 42
DATA_PATH = Path(__file__).parent.parent / "data" / "driva_transportation_dataset.csv"
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

FUEL_MAP = {"DIESEL": 0, "PETROL": 1, "EV": 2}
PRIORITY_MAP = {"LOW": 0, "NORMAL": 1, "HIGH": 2, "URGENT": 3}
VEHICLE_TYPES = [
    "Tata Ace", "Bolero Pickup", "Mini Truck", "EV Cargo Van",
    "Light Commercial", "Medium Truck", "Heavy Truck"
]


def load_and_prepare(df: pd.DataFrame):
    df = df.copy()
    df["fuel_enc"] = df["fuel_type"].map(FUEL_MAP).fillna(0).astype(int)
    df["priority_enc"] = df["delivery_priority"].map(PRIORITY_MAP).fillna(1).astype(int)
    le = LabelEncoder()
    df["vehicle_enc"] = le.fit_transform(df["vehicle_type"].astype(str))
    return df, le


COST_FEATURES = [
    "distance_km", "cargo_weight_kg", "cargo_volume_m3",
    "fuel_enc", "vehicle_capacity_kg", "vehicle_age_years",
    "vehicle_efficiency", "traffic_factor", "weather_factor",
    "priority_enc", "vehicle_enc"
]

ETA_FEATURES = [
    "distance_km", "cargo_weight_kg",
    "traffic_factor", "weather_factor",
    "vehicle_efficiency", "vehicle_age_years",
    "vehicle_enc", "priority_enc"
]

SUIT_FEATURES = [
    "distance_km", "cargo_weight_kg", "vehicle_capacity_kg",
    "vehicle_availability", "deadline_hours",
    "actual_delivery_time_hours",  # use historical as proxy
    "provider_rating", "driver_experience_years",
    "vehicle_efficiency", "vehicle_age_years",
    "traffic_factor", "weather_factor",
    "fuel_enc", "priority_enc", "vehicle_enc"
]


def train_cost_model(df: pd.DataFrame):
    print("\n── Training Cost Model ──────────────────────────────")
    X = df[COST_FEATURES]
    y = df["actual_delivery_cost"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    model = GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=SEED)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"  MAE:  ₹{mae:.2f}")
    print(f"  RMSE: ₹{rmse:.2f}")
    print(f"  R²:   {r2:.4f}")
    path = MODEL_DIR / "cost_model.pkl"
    joblib.dump({"model": model, "features": COST_FEATURES, "version": "1.0.0"}, path)
    print(f"  Saved → {path}")
    return model


def train_eta_model(df: pd.DataFrame):
    print("\n── Training ETA Model ──────────────────────────────")
    X = df[ETA_FEATURES]
    y = df["actual_delivery_time_hours"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    model = GradientBoostingRegressor(n_estimators=200, max_depth=4, learning_rate=0.1, random_state=SEED)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    print(f"  MAE:  {mae:.2f} hrs")
    print(f"  RMSE: {rmse:.2f} hrs")
    print(f"  R²:   {r2:.4f}")
    path = MODEL_DIR / "eta_model.pkl"
    joblib.dump({"model": model, "features": ETA_FEATURES, "version": "1.0.0"}, path)
    print(f"  Saved → {path}")
    return model


def train_suitability_model(df: pd.DataFrame):
    print("\n── Training Suitability Model ──────────────────────")
    X = df[SUIT_FEATURES]
    y = df["vehicle_suitability"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=SEED, n_jobs=-1)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    print(f"  Accuracy:  {accuracy_score(y_test, preds):.4f}")
    print(f"  Precision: {precision_score(y_test, preds, zero_division=0):.4f}")
    print(f"  Recall:    {recall_score(y_test, preds, zero_division=0):.4f}")
    print(f"  F1:        {f1_score(y_test, preds, zero_division=0):.4f}")
    path = MODEL_DIR / "suitability_model.pkl"
    joblib.dump({"model": model, "features": SUIT_FEATURES, "version": "1.0.0"}, path)
    print(f"  Saved → {path}")
    return model


if __name__ == "__main__":
    if not DATA_PATH.exists():
        print("Dataset not found. Generating first...")
        import subprocess
        subprocess.run(["python", str(Path(__file__).parent.parent / "generate_dataset.py")], check=True)

    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    print(f"  Records: {len(df):,}")

    df, le = load_and_prepare(df)

    train_cost_model(df)
    train_eta_model(df)
    train_suitability_model(df)

    print("\n✅ All models trained successfully!")
    print(f"   Models saved in: {MODEL_DIR}")
    print("\nIMPORTANT: These metrics validate the ML pipeline using synthetic data.")
    print("Production deployment requires retraining on historical transportation data.")
