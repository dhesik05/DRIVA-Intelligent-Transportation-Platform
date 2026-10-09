import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder

SEED = 42
DATA_PATH = Path(__file__).parent.parent / "data" / "driva_transport_dataset.csv"
MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_suitability_model():
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    df["route"] = df["origin"] + "_" + df["destination"]
    
    encoders = {}
    cat_cols = ["vehicle_type", "fuel_type", "route", "delivery_priority"]
    for col in cat_cols:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    features = [
        "cargo_weight_kg", "cargo_volume_m3", "cargo_length_m", "cargo_width_m", "cargo_height_m",
        "vehicle_capacity_kg", "vehicle_volume_m3", "vehicle_length_m", "vehicle_width_m", "vehicle_height_m",
        "vehicle_type_enc", "fuel_type_enc", "provider_rating", "driver_experience_years",
        "vehicle_availability", "route_enc", "delivery_priority_enc"
    ]
    
    X = df[features]
    y = df["vehicle_suitability"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)
    
    print("Training Suitability Model (RandomForestClassifier)...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=SEED, n_jobs=-1)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)
    
    print(f"Metrics:")
    print(f"Accuracy: {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")
    print(f"F1: {f1:.4f}")
    
    path = MODEL_DIR / "suitability_model.pkl"
    joblib.dump({
        "model": model, 
        "features": features, 
        "encoders": encoders,
        "metadata": {
            "model_name": "Suitability Model",
            "version": "v1.0",
            "dataset_version": "driva_synthetic_50000_v1",
            "row_count": len(df),
            "metrics": {"Accuracy": acc, "Precision": prec, "Recall": rec, "F1": f1}
        }
    }, path)
    print(f"Saved -> {path}")

if __name__ == "__main__":
    train_suitability_model()
