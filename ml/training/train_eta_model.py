import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder

SEED = 42
DATA_PATH = Path(__file__).parent.parent / "data" / "driva_transport_dataset.csv"
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_eta_model():
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    df["route"] = df["origin"] + "_" + df["destination"]
    
    encoders = {}
    cat_cols = ["vehicle_type", "route", "delivery_priority"]
    for col in cat_cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    features = [
        "distance_km", "cargo_weight_kg", "traffic_factor", "weather_factor",
        "vehicle_type_enc", "vehicle_capacity_kg", "vehicle_efficiency",
        "driver_experience_years", "historical_delivery_time_hours",
        "delivery_priority_enc", "route_enc"
    ]
    
    X = df[features]
    y = df["actual_delivery_time_hours"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    
    print("Training ETA Model (GradientBoostingRegressor)...")
    model = GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=SEED)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"Metrics:")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²: {r2:.4f}")
    
    path = MODEL_DIR / "eta_model.pkl"
    joblib.dump({
        "model": model, 
        "features": features, 
        "encoders": encoders,
        "metadata": {
            "model_name": "ETA Model",
            "version": "v1.0",
            "dataset_version": "driva_synthetic_50000_v1",
            "row_count": len(df),
            "metrics": {"MAE": mae, "RMSE": rmse, "R2": r2}
        }
    }, path)
    print(f"Saved -> {path}")

if __name__ == "__main__":
    train_eta_model()
