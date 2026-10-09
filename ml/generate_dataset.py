import sys
from pathlib import Path
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
import pandas as pd

SEED = 42
NUM_RECORDS = 50000
rng = np.random.default_rng(SEED)

ROUTES = [
    ("Salem", "Bangalore", 340),
    ("Bangalore", "Salem", 340),
    ("Salem", "Chennai", 340),
    ("Chennai", "Salem", 340),
    ("Salem", "Coimbatore", 160),
    ("Coimbatore", "Salem", 160),
    ("Chennai", "Coimbatore", 500),
    ("Coimbatore", "Chennai", 500),
    ("Chennai", "Bangalore", 350),
    ("Bangalore", "Chennai", 350),
    ("Coimbatore", "Bangalore", 360),
    ("Bangalore", "Coimbatore", 360),
]

CARGO_CATEGORIES = [
    "Electronics", "Auto Components", "Textiles & Garments", "Food & Beverage", 
    "Industrial Equipment", "Pharmaceuticals", "Consumer Goods", "Furniture", 
    "General Cargo", "Fragile Goods"
]

VEHICLE_SPECS = {
    "Tata Ace": {"class": "Light", "capacity_kg": 750, "vol_m3": 4.0, "l": 2.1, "w": 1.4, "h": 1.5, "fuels": ["DIESEL", "CNG"], "base_cost": 18, "efficiency": 1.2},
    "Mahindra Bolero Pickup": {"class": "Light", "capacity_kg": 1500, "vol_m3": 5.0, "l": 2.5, "w": 1.7, "h": 1.5, "fuels": ["DIESEL"], "base_cost": 22, "efficiency": 1.0},
    "EV Cargo Van": {"class": "Light", "capacity_kg": 1000, "vol_m3": 4.5, "l": 2.4, "w": 1.5, "h": 1.6, "fuels": ["EV"], "base_cost": 12, "efficiency": 1.5},
    "Mini Truck": {"class": "Light", "capacity_kg": 2500, "vol_m3": 8.0, "l": 3.0, "w": 1.8, "h": 1.8, "fuels": ["DIESEL", "CNG"], "base_cost": 28, "efficiency": 0.9},
    "Tata 407": {"class": "Medium", "capacity_kg": 3000, "vol_m3": 12.0, "l": 4.0, "w": 2.0, "h": 2.0, "fuels": ["DIESEL"], "base_cost": 32, "efficiency": 0.85},
    "Tata 709": {"class": "Medium", "capacity_kg": 5000, "vol_m3": 18.0, "l": 5.0, "w": 2.1, "h": 2.1, "fuels": ["DIESEL"], "base_cost": 40, "efficiency": 0.75},
    "Light Commercial Vehicle": {"class": "Medium", "capacity_kg": 4000, "vol_m3": 15.0, "l": 4.5, "w": 2.1, "h": 2.0, "fuels": ["DIESEL"], "base_cost": 35, "efficiency": 0.8},
    "Medium Truck": {"class": "Medium", "capacity_kg": 7000, "vol_m3": 24.0, "l": 6.0, "w": 2.3, "h": 2.2, "fuels": ["DIESEL"], "base_cost": 45, "efficiency": 0.7},
    "Heavy Truck": {"class": "Heavy", "capacity_kg": 15000, "vol_m3": 40.0, "l": 8.0, "w": 2.5, "h": 2.5, "fuels": ["DIESEL"], "base_cost": 65, "efficiency": 0.5},
}

PRIORITY_MAP = {"LOW": 0.8, "NORMAL": 1.0, "HIGH": 1.2, "URGENT": 1.5}

def generate():
    records = []
    
    for i in range(NUM_RECORDS):
        route_idx = rng.choice(len(ROUTES))
        origin, destination, base_dist = ROUTES[route_idx]
        distance_km = base_dist + rng.normal(0, 10)
        distance_km = max(50, distance_km)
        
        vtype = rng.choice(list(VEHICLE_SPECS.keys()))
        vspec = VEHICLE_SPECS[vtype]
        fuel_type = rng.choice(vspec["fuels"])
        
        # Cargo generation related to vehicle size (with some noise and occasional overload)
        cargo_category = rng.choice(CARGO_CATEGORIES)
        max_cargo_weight = vspec["capacity_kg"]
        cargo_weight_kg = rng.uniform(max_cargo_weight * 0.2, max_cargo_weight * 1.1)
        cargo_volume_m3 = cargo_weight_kg / rng.uniform(150, 400)
        cargo_volume_m3 = min(cargo_volume_m3, vspec["vol_m3"] * 1.2)
        
        # Cargo Dimensions
        cargo_length_m = min(rng.uniform(0.5, vspec["l"] * 1.1), vspec["l"])
        cargo_width_m = min(rng.uniform(0.5, vspec["w"] * 1.1), vspec["w"])
        cargo_height_m = min(rng.uniform(0.5, vspec["h"] * 1.1), vspec["h"])

        provider_rating = float(np.clip(rng.normal(4.2, 0.5), 1.0, 5.0))
        driver_experience_years = float(np.clip(rng.normal(5.0, 3.0), 0.5, 30.0))
        vehicle_availability = int(rng.random() > 0.15)
        
        traffic_factor = float(np.clip(rng.normal(1.0, 0.2), 0.7, 2.0))
        weather_factor = float(np.clip(rng.normal(1.0, 0.15), 0.8, 1.8))
        vehicle_age_years = float(np.clip(rng.normal(4.0, 2.5), 0.1, 15.0))
        vehicle_efficiency = vspec["efficiency"] * (1 - vehicle_age_years * 0.015)
        
        delivery_priority = rng.choice(list(PRIORITY_MAP.keys()), p=[0.2, 0.5, 0.2, 0.1])
        priority_mult = PRIORITY_MAP[delivery_priority]
        deadline_hours = float(distance_km / rng.uniform(30, 60)) * priority_mult + rng.uniform(2, 24)

        base_cost = vspec["base_cost"]
        fuel_cost_component = base_cost * distance_km
        weight_cost_component = cargo_weight_kg * 0.5
        traffic_cost = fuel_cost_component * (traffic_factor - 1.0) * 0.2
        priority_cost = fuel_cost_component * (priority_mult - 1.0) * 0.3
        
        actual_delivery_cost = fuel_cost_component + weight_cost_component + traffic_cost + priority_cost + rng.normal(0, fuel_cost_component * 0.05)
        if fuel_type == "EV":
            actual_delivery_cost *= 0.65
        actual_delivery_cost = max(300, actual_delivery_cost)
        
        fuel_or_energy_cost = fuel_cost_component * 0.4
        historical_cost = actual_delivery_cost * rng.uniform(0.95, 1.05)
        
        base_hours = distance_km / 55.0
        actual_delivery_time_hours = base_hours * traffic_factor * weather_factor + (vehicle_age_years * 0.02) + rng.normal(0, base_hours * 0.05)
        actual_delivery_time_hours = max(1.0, actual_delivery_time_hours)
        historical_delivery_time_hours = actual_delivery_time_hours * rng.uniform(0.9, 1.1)
        
        capacity_ok = cargo_weight_kg <= vspec["capacity_kg"] and cargo_volume_m3 <= vspec["vol_m3"]
        dims_ok = cargo_length_m <= vspec["l"] and cargo_width_m <= vspec["w"] and cargo_height_m <= vspec["h"]
        avail_ok = vehicle_availability == 1
        
        suit_score = 0
        if capacity_ok and dims_ok: suit_score += 40
        if avail_ok: suit_score += 20
        suit_score += (provider_rating / 5.0) * 20
        suit_score += min(driver_experience_years / 10.0, 1.0) * 10
        suit_score += (1.0 / traffic_factor) * 10
        
        vehicle_suitability = 1 if (suit_score > 65 and capacity_ok) else 0
        provider_suitability = 1 if (provider_rating >= 3.5 and driver_experience_years > 1.0) else 0
        delivery_success = 1 if (actual_delivery_time_hours <= deadline_hours and rng.random() > 0.05) else 0

        records.append({
            "request_id": f"REQ-{i+1:06d}",
            "origin": origin,
            "destination": destination,
            "distance_km": round(distance_km, 2),
            "cargo_category": cargo_category,
            "cargo_weight_kg": round(cargo_weight_kg, 2),
            "cargo_volume_m3": round(cargo_volume_m3, 3),
            "cargo_length_m": round(cargo_length_m, 2),
            "cargo_width_m": round(cargo_width_m, 2),
            "cargo_height_m": round(cargo_height_m, 2),
            "vehicle_type": vtype,
            "vehicle_class": vspec["class"],
            "fuel_type": fuel_type,
            "vehicle_capacity_kg": vspec["capacity_kg"],
            "vehicle_volume_m3": vspec["vol_m3"],
            "vehicle_length_m": vspec["l"],
            "vehicle_width_m": vspec["w"],
            "vehicle_height_m": vspec["h"],
            "vehicle_age_years": round(vehicle_age_years, 1),
            "vehicle_efficiency": round(vehicle_efficiency, 3),
            "fuel_or_energy_cost": round(fuel_or_energy_cost, 2),
            "traffic_factor": round(traffic_factor, 3),
            "weather_factor": round(weather_factor, 3),
            "provider_rating": round(provider_rating, 2),
            "driver_experience_years": round(driver_experience_years, 1),
            "vehicle_availability": vehicle_availability,
            "historical_delivery_time_hours": round(historical_delivery_time_hours, 2),
            "historical_cost": round(historical_cost, 2),
            "delivery_priority": delivery_priority,
            "deadline_hours": round(deadline_hours, 1),
            "actual_delivery_time_hours": round(actual_delivery_time_hours, 2),
            "actual_delivery_cost": round(actual_delivery_cost, 2),
            "delivery_success": delivery_success,
            "vehicle_suitability": vehicle_suitability,
            "provider_suitability": provider_suitability,
        })
        
    df = pd.DataFrame(records)
    out_path = Path(__file__).parent / "data" / "driva_transport_dataset.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    
    print("Dataset generated successfully")
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")
    print(f"Random seed: {SEED}")
    print("\nValidation:")
    print(f"Total records: {len(df)}")
    print(f"Missing values: {df.isna().sum().sum()}")
    print(f"Duplicate request IDs: {df.duplicated(subset=['request_id']).sum()}")
    print(f"Min/Max cargo weight: {df['cargo_weight_kg'].min()} / {df['cargo_weight_kg'].max()}")
    print(f"Min/Max cost: {df['actual_delivery_cost'].min()} / {df['actual_delivery_cost'].max()}")
    print(f"Min/Max ETA: {df['actual_delivery_time_hours'].min()} / {df['actual_delivery_time_hours'].max()}")

if __name__ == "__main__":
    generate()
