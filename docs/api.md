# DRIVA REST API Specification
**Dynamic Routing, Intelligence & Vehicle Allocation**

---

## 1. Overview & Interactive Documentation

The DRIVA API is built on FastAPI and strictly enforces Pydantic request/response schemas, JWT bearer authorization, and standard HTTP status codes.

- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Default Port**: `8000`
- **CORS Allowed Origins**: Configured via `CORS_ORIGINS` in `.env` (defaults to `http://localhost:5173`)

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register User
- **Method**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Rajan Kumar",
    "email": "rajan@salemelectronics.in",
    "phone": "+91-9876543210",
    "password": "securepassword",
    "role": "BUSINESS_OWNER"
  }
  ```
- **Response**: `201 Created` → User object

### 2.2 Login (JSON)
- **Method**: `POST /api/auth/login/json`
- **Body**:
  ```json
  {
    "email": "business@driva.demo",
    "password": "driva2024"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Rajan Kumar",
      "email": "business@driva.demo",
      "role": "BUSINESS_OWNER"
    }
  }
  ```

### 2.3 Current User Profile
- **Method**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` → User Profile

---

## 3. Transport Requests (`/api/transport-requests`)

### 3.1 Create Transport Request
- **Method**: `POST /api/transport-requests`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "pickup_location": "Salem",
    "destination": "Bangalore",
    "cargo_type": "Electronics",
    "cargo_weight_kg": 200.0,
    "cargo_volume_m3": 0.8,
    "vehicle_type": "Tata Ace",
    "deadline": "2026-10-08T20:00:00Z",
    "priority": "HIGH",
    "special_requirements": "Fragile components"
  }
  ```
- **Response**: `201 Created` → TransportRequest object with `id`

### 3.2 List User's Requests
- **Method**: `GET /api/transport-requests`
- **Response**: `200 OK` → Array of TransportRequest objects

---

## 4. Smart Matching Engine (`/api/matching`)

### 4.1 Execute Match & Decision Scoring
- **Method**: `POST /api/matching/{request_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Evaluates hard constraints, runs ML cost/ETA models, computes 7-factor weighted match scores, ranks options, and requests Groq reasoning.
- **Response**: `200 OK`
  ```json
  {
    "request_id": 2,
    "pickup": "Salem",
    "destination": "Bangalore",
    "cargo_weight_kg": 200.0,
    "options": [
      {
        "rank": 1,
        "provider_id": 1,
        "provider_name": "ABC Logistics",
        "vehicle_id": 4,
        "vehicle_type": "EV Cargo Van",
        "fuel_type": "EV",
        "capacity_kg": 800.0,
        "predicted_cost": 3141.31,
        "predicted_eta_hours": 6.1,
        "match_score": 89.5,
        "provider_reliability": 94.0,
        "route_score": 90.0,
        "cost_score": 92.0,
        "eta_score": 88.0,
        "capacity_score": 95.0
      }
    ],
    "recommended": { ... },
    "groq_explanation": "ABC Logistics is recommended because it provides sufficient capacity..."
  }
  ```

---

## 5. Commercial Bookings (`/api/bookings`)

### 5.1 Create Booking
- **Method**: `POST /api/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "request_id": 2,
    "provider_id": 1,
    "vehicle_id": 4
  }
  ```
- **Response**: `201 Created` → Booking object with unique `id`, `quoted_price`, and `driva_commission` (5%)

### 5.2 Update Delivery Stage / Tracking
- **Method**: `PUT /api/bookings/{id}/status`
- **Body**:
  ```json
  {
    "status": "IN_TRANSIT",
    "location": "Salem-Bangalore Highway NH44",
    "notes": "Passed Krishnagiri Toll Plaza"
  }
  ```
- **Response**: `200 OK`

### 5.3 Fetch Simulated Telemetry & Timeline
- **Method**: `GET /api/bookings/{id}/tracking`
- **Response**: `200 OK` → Tracking timeline array with stages, locations, and timestamps

---

## 6. Artificial Intelligence & Reasoning (`/api/ai`)

### 6.1 Explain Carrier Recommendation
- **Method**: `POST /api/ai/explain-recommendation`
- **Body**:
  ```json
  {
    "request_id": 2
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "explanation": "ABC Logistics is recommended because...",
    "used_groq": true
  }
  ```

### 6.2 Contextual Logistics Assistant
- **Method**: `POST /api/ai/assistant`
- **Body**:
  ```json
  {
    "message": "Why did DRIVA choose ABC Logistics over other options?",
    "context_request_id": 2
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "reply": "DRIVA recommended ABC Logistics based on a weighted score considering...",
    "used_groq": true
  }
  ```

---

## 7. Platform Analytics (`/api/analytics`)

### 7.1 Admin Platform Analytics
- **Method**: `GET /api/analytics/admin`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**: `200 OK`
  ```json
  {
    "total_users": 6,
    "total_vehicles": 10,
    "total_bookings": 2,
    "total_gmv": 6282.62,
    "driva_revenue": 314.13,
    "avg_match_score": 89.5,
    "active_providers": 4
  }
  ```

### 7.2 Business Spend Analytics
- **Method**: `GET /api/analytics/business`
- **Response**: `200 OK` → Business spend totals, completed deliveries, and recent requests
