# DRIVA Machine Learning Pipeline Documentation
**Dynamic Routing, Intelligence & Vehicle Allocation**

---

> **IMPORTANT DISCLAIMER:**  
> The current transportation dataset consists of 22,000 synthetic records generated with domain-validated physical and commercial relationships. This dataset validates the end-to-end ML training, serialization, inference, and fallback pipeline. Production deployment requires retraining on empirical transportation telematics and historical freight waybills.

---

## 1. Why Synthetic Data Was Used

For commercial freight in regional South Indian corridors (e.g. Salem, Bangalore, Chennai, Coimbatore), historical carriage contracts and GPS telematics are proprietary to individual fleet operators.

To demonstrate a production-ready machine learning pipeline, DRIVA synthesized 22,000 records using domain formulas that simulate realistic commercial logistics physics:
- **Seed**: `42` (ensures reproducible dataset generation)
- **Scale**: `22,000` completed and active transportation instances
- **File Output**: `ml/data/driva_transportation_dataset.csv`

---

## 2. Feature Schema & Physical Relationships

| Feature | Type | Logistics Rationale |
| :--- | :--- | :--- |
| `request_id` | String | Unique consignment identifier |
| `origin` | String | Regional freight origin hub |
| `destination` | String | Destination warehouse city |
| `distance_km` | Float | Corridor highway distance (e.g. 340 km for Salem → Bangalore) |
| `cargo_weight_kg` | Float | Net payload weight |
| `cargo_volume_m3` | Float | Volumetric displacement of cargo |
| `cargo_type` | Categorical | Electronics, Textiles, FMCG, Auto Parts, Pharma, Machinery |
| `vehicle_type` | Categorical | Tata Ace, Bolero Pickup, Mini Truck, EV Cargo Van, Medium Truck, Heavy Truck |
| `fuel_type` | Categorical | DIESEL, PETROL, EV |
| `vehicle_capacity_kg` | Float | Maximum rated gross vehicle payload |
| `vehicle_age_years` | Float | Fleet depreciation and wear factor |
| `vehicle_efficiency` | Float | Km per litre / kWh efficiency baseline |
| `traffic_factor` | Float | Congestion factor (0.8 = free flow, 1.6 = severe bottleneck) |
| `weather_factor` | Float | Rain / monsoon factor (0.9 = dry, 1.4 = heavy monsoon) |
| `provider_rating` | Float | Historical 1-5 customer satisfaction score |
| `driver_experience_years` | Float | Commercial pilot highway experience |
| `delivery_priority` | Categorical | LOW, NORMAL, HIGH, URGENT |
| `actual_delivery_cost` | Float | **Target 1**: Total realized trip transportation cost (INR) |
| `actual_delivery_time_hours` | Float | **Target 2**: Realized transit elapsed duration (Hours) |
| `vehicle_suitability` | Binary | **Target 3**: Binary feasibility classification (0 or 1) |

---

## 3. Machine Learning Models & Performance

### 3.1 Model 1: Delivery Cost Prediction Regressor
- **Algorithm**: `GradientBoostingRegressor` (200 estimators, max depth 5, learning rate 0.1)
- **Features Used**: Distance, cargo weight, volume, fuel type encoding, capacity, age, efficiency, traffic, weather, priority, vehicle type encoding.
- **Model Binary**: `ml/models/cost_model.pkl`
- **Validation Metrics**:
  - **Mean Absolute Error (MAE)**: **₹403.12**
  - **Root Mean Squared Error (RMSE)**: **₹589.21**
  - **Coefficient of Determination (R²)**: **0.9948**

### 3.2 Model 2: ETA Prediction Regressor
- **Algorithm**: `GradientBoostingRegressor` (200 estimators, max depth 4, learning rate 0.1)
- **Features Used**: Distance, cargo weight, traffic factor, weather factor, efficiency, age, vehicle encoding, priority encoding.
- **Model Binary**: `ml/models/eta_model.pkl`
- **Validation Metrics**:
  - **Mean Absolute Error (MAE)**: **0.38 hours (approx. 23 minutes)**
  - **Root Mean Squared Error (RMSE)**: **0.49 hours**
  - **Coefficient of Determination (R²)**: **0.9588**

### 3.3 Model 3: Vehicle Suitability Classifier
- **Algorithm**: `RandomForestClassifier` (150 trees, max depth 8)
- **Features Used**: Distance, payload vs capacity ratio, vehicle availability, deadline feasibility, driver experience, carrier rating.
- **Model Binary**: `ml/models/suitability_model.pkl`
- **Validation Metrics**:
  - **Accuracy**: **96.64%**
  - **Precision**: **96.63%**
  - **Recall**: **100.00%**
  - **F1 Score**: **0.9829**

---

## 4. Inference & Fallback Architecture

Models are loaded **once into memory upon application boot** (in `ml/inference/predict.py`) and never retrained during user HTTP requests:

```python
# ml/inference/predict.py
_COST_MODEL = joblib.load("ml/models/cost_model.pkl")
_ETA_MODEL = joblib.load("ml/models/eta_model.pkl")
_SUIT_MODEL = joblib.load("ml/models/suitability_model.pkl")
```

If model weights are missing or corrupted, the inference module gracefully switches to **deterministic physics formulas**:
- Cost Fallback: `base_rate * distance + weight * 0.8 * traffic_factor * priority_factor`
- ETA Fallback: `(distance / 60.0) * traffic_factor * weather_factor`
- Suitability Fallback: Deterministic capacity, availability, and rating heuristics.

---

## 5. Production Retraining Roadmap
1. Ingest real-time telematics from fleet vehicle OBD-II trackers.
2. Ingest real-time FASTag toll plaza transit timestamps for precise corridor ETAs.
3. Incorporate live seasonal monsoon and highway construction feeds.
4. Continuous automated retraining using MLflow / Kubeflow pipelines.
