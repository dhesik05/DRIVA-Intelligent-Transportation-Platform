"""
DRIVA Synthetic Transportation Dataset Generator
=================================================
Generates 20,000+ realistic transportation records with domain-validated
relationships between distance, weight, fuel type, traffic, weather, and outcomes.

Usage:
    python ml/generate_dataset.py

Output:
    ml/data/driva_transportation_dataset.csv
"""

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
NUM_RECORDS = 22000
rng = np.random.default_rng(SEED)

# ─── Route table (origin, destination, distance_km) ───────────────────────────
ROUTES = [
    ("Salem", "Bangalore", 340),
    ("Chennai", "Coimbatore", 500),
    ("Coimbatore", "Chennai", 500),
    ("Salem", "Chennai", 340),
    ("Bangalore", "Chennai", 350),
    ("Chennai", "Bangalore", 350),
    ("Madurai", "Chennai", 460),
    ("Coimbatore", "Bangalore", 360),
    ("Bangalore", "Coimbatore", 360),
    ("Salem", "Coimbatore", 160),
    ("Salem", "Madurai", 200),
    ("Chennai", "Madurai", 460),
    ("Madurai", "Coimbatore", 220),
    ("Bangalore", "Madurai", 460),
    ("Trichy", "Chennai", 320),
    ("Chennai", "Trichy", 320),
    ("Bangalore", "Salem", 340),
    ("Coimbatore", "Salem", 160),
]

# ─── Vehicle specifications ────────────────────────────────────────────────────
VEHICLE_SPECS = {
    "Tata Ace":          {"capacity_kg": 750,  "fuel": "DIESEL", "base_cost_per_km": 18, "efficiency": 1.2},
    "Bolero Pickup":     {"capacity_kg": 1000, "fuel": "DIESEL", "base_cost_per_km": 22, "efficiency": 1.0},
    "Mini Truck":        {"capacity_kg": 2500, "fuel": "DIESEL", "base_cost_per_km": 28, "efficiency": 0.9},
    "EV Cargo Van":      {"capacity_kg": 800,  "fuel": "EV",     "base_cost_per_km": 12, "efficiency": 1.5},
    "Light Commercial":  {"capacity_kg": 1200, "fuel": "DIESEL", "base_cost_per_km": 20, "efficiency": 1.1},
    "Medium Truck":      {"capacity_kg": 5000, "fuel": "DIESEL", "base_cost_per_km": 35, "efficiency": 0.8},
    "Heavy Truck":       {"capacity_kg": 15000,"fuel": "DIESEL", "base_cost_per_km": 55, "efficiency": 0.6},
}

PROVIDERS = [
    {"name": "ABC Logistics",       "rating": 4.7, "reliability": 94},
    {"name": "SouthLine Transport", "rating": 4.3, "reliability": 89},
    {"name": "RapidMove Logistics", "rating": 4.5, "reliability": 91},
    {"name": "GreenRoute Mobility", "rating": 4.1, "reliability": 87},
    {"name": "Express Cargo TN",    "rating": 4.4, "reliability": 90},
    {"name": "Kongu Carriers",      "rating": 3.9, "reliability": 83},
]

CARGO_TYPES = [
    "Electronics", "Textiles", "FMCG", "Automotive Parts",
    "Pharmaceuticals", "Perishables", "Heavy Machinery",
    "Furniture", "Raw Materials", "Chemicals"
]

PRIORITY_MAP = {"LOW": 0.5, "NORMAL": 1.0, "HIGH": 1.2, "URGENT": 1.4}


def generate():
    records = []
    for i in range(NUM_RECORDS):
        # Route
        route_idx = rng.integers(0, len(ROUTES))
        origin, destination, base_dist = ROUTES[route_idx]
        distance_km = base_dist + rng.normal(0, 15)
        distance_km = max(50, distance_km)

        # Vehicle
        vtype = rng.choice(list(VEHICLE_SPECS.keys()))
        vspec = VEHICLE_SPECS[vtype]

        # Cargo
        max_cargo = vspec["capacity_kg"]
        cargo_weight_kg = rng.uniform(max_cargo * 0.1, max_cargo * 1.1)  # allow slight overload for training
        cargo_volume_m3 = cargo_weight_kg / rng.uniform(200, 500)  # density variation
        cargo_type = rng.choice(CARGO_TYPES)

        # Provider
        provider = rng.choice(PROVIDERS)
        provider_rating = provider["rating"] + rng.normal(0, 0.1)
        provider_rating = float(np.clip(provider_rating, 1, 5))
        reliability = provider["reliability"] + rng.normal(0, 2)
        reliability = float(np.clip(reliability, 60, 100))

        # Driver
        driver_exp = rng.uniform(0.5, 20)

        # Environment factors
        traffic_factor = rng.uniform(0.8, 1.6)   # 1.0 = normal
        weather_factor = rng.uniform(0.9, 1.4)   # 1.0 = clear
        vehicle_age = rng.uniform(0.5, 12)
        efficiency = vspec["efficiency"] * (1 - vehicle_age * 0.02)
        efficiency = max(0.4, efficiency)

        # Availability
        vehicle_availability = int(rng.random() > 0.15)  # 85% available

        # Priority
        priority = rng.choice(list(PRIORITY_MAP.keys()), p=[0.15, 0.45, 0.30, 0.10])
        priority_mult = PRIORITY_MAP[priority]

        # Deadline (hours from now)
        deadline_hours = rng.uniform(4, 72)

        # ── COST MODEL ──────────────────────────────────────────────────────────
        base_cost = vspec["base_cost_per_km"]
        fuel_cost_component = base_cost * distance_km
        weight_cost_component = cargo_weight_kg * 0.8
        traffic_cost = fuel_cost_component * (traffic_factor - 1.0) * 0.3
        priority_cost = fuel_cost_component * (priority_mult - 1.0) * 0.5
        noise_cost = rng.normal(0, fuel_cost_component * 0.05)

        actual_cost = (
            fuel_cost_component
            + weight_cost_component
            + traffic_cost
            + priority_cost
            + noise_cost
        )
        # EV discount
        if vspec["fuel"] == "EV":
            actual_cost *= 0.65
        actual_cost = max(500, actual_cost)

        # Historical cost (slightly different run)
        historical_cost = actual_cost * rng.uniform(0.92, 1.08)

        # ── ETA MODEL ───────────────────────────────────────────────────────────
        # Average road speed ~60 km/h, adjusted by factors
        base_hours = distance_km / 60.0
        traffic_delay = base_hours * (traffic_factor - 1.0) * 0.6
        weather_delay = base_hours * (weather_factor - 1.0) * 0.4
        age_delay = base_hours * vehicle_age * 0.01
        noise_eta = rng.normal(0, base_hours * 0.08)

        actual_eta = base_hours + traffic_delay + weather_delay + age_delay + noise_eta
        actual_eta = max(1.0, actual_eta)
        historical_eta = actual_eta * rng.uniform(0.9, 1.1)

        # ── SUITABILITY ─────────────────────────────────────────────────────────
        capacity_ok = cargo_weight_kg <= vspec["capacity_kg"]
        deadline_feasible = actual_eta <= deadline_hours
        avail_ok = vehicle_availability == 1

        raw_suit = 0.0
        raw_suit += 35 if capacity_ok else 0
        raw_suit += 20 if deadline_feasible else 0
        raw_suit += 15 if avail_ok else 0
        raw_suit += (reliability / 100) * 15
        raw_suit += min(driver_exp / 20, 1.0) * 10
        raw_suit += (provider_rating / 5.0) * 5

        # Delivery success depends on suitability
        delivery_success = int(raw_suit >= 50 and rng.random() > 0.05)

        vehicle_suitability = int(raw_suit >= 55)
        provider_suitability = int(raw_suit >= 45)

        records.append({
            "request_id": f"REQ-{i+1:05d}",
            "origin": origin,
            "destination": destination,
            "distance_km": round(distance_km, 2),
            "cargo_weight_kg": round(cargo_weight_kg, 2),
            "cargo_volume_m3": round(cargo_volume_m3, 3),
            "cargo_type": cargo_type,
            "vehicle_type": vtype,
            "fuel_type": vspec["fuel"],
            "vehicle_capacity_kg": vspec["capacity_kg"],
            "vehicle_age_years": round(vehicle_age, 1),
            "vehicle_efficiency": round(efficiency, 3),
            "fuel_or_energy_cost": round(vspec["base_cost_per_km"] * distance_km, 2),
            "traffic_factor": round(traffic_factor, 3),
            "weather_factor": round(weather_factor, 3),
            "provider_name": provider["name"],
            "provider_rating": round(provider_rating, 2),
            "driver_experience_years": round(driver_exp, 1),
            "vehicle_availability": vehicle_availability,
            "historical_delivery_time_hours": round(historical_eta, 2),
            "historical_cost": round(historical_cost, 2),
            "delivery_priority": priority,
            "deadline_hours": round(deadline_hours, 1),
            "actual_delivery_time_hours": round(actual_eta, 2),
            "actual_delivery_cost": round(actual_cost, 2),
            "delivery_success": delivery_success,
            "vehicle_suitability": vehicle_suitability,
            "provider_suitability": provider_suitability,
        })

    df = pd.DataFrame(records)
    out_path = Path(__file__).parent / "data" / "driva_transportation_dataset.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"✅ Generated {len(df):,} records → {out_path}")
    print(df.describe())
    return df


if __name__ == "__main__":
    generate()
