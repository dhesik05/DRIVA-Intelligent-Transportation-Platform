import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder

SEED = 42
DATA_PATH = Path(__file__).parent.parent / "data" / "driva_transport_dataset.csv"
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_cost_model():
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    # Create route column
    df["route"] = df["origin"] + "_" + df["destination"]
    
    # Encode categorical features
    encoders = {}
    cat_cols = ["vehicle_type", "fuel_type", "route", "delivery_priority"]
    for col in cat_cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    features = [
        "distance_km", "cargo_weight_kg", "cargo_volume_m3",
        "vehicle_capacity_kg", "vehicle_volume_m3", "vehicle_age_years",
        "vehicle_efficiency", "fuel_or_energy_cost", "traffic_factor",
        "weather_factor", "provider_rating", "driver_experience_years",
        "historical_cost", "vehicle_type_enc", "fuel_type_enc",
        "route_enc", "delivery_priority_enc"
    ]
    
    X = df[features]
    y = df["actual_delivery_cost"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    
    print("Training Cost Model (RandomForestRegressor)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"Metrics:")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²: {r2:.4f}")
    
    path = MODEL_DIR / "cost_model.pkl"
    joblib.dump({
        "model": model, 
        "features": features, 
        "encoders": encoders,
        "metadata": {
            "model_name": "Cost Model",
            "version": "v1.0",
            "dataset_version": "driva_synthetic_50000_v1",
            "row_count": len(df),
            "metrics": {"MAE": mae, "RMSE": rmse, "R2": r2}
        }
    }, path)
    print(f"Saved -> {path}")

if __name__ == "__main__":
    train_cost_model()
