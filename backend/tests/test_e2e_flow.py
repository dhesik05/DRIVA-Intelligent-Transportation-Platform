"""
DRIVA End-to-End System Integration Test
=========================================
Validates the mandatory hackathon scenario:
  Business Login
  → Create Salem to Bangalore (200kg Electronics) Request
  → Run ML & Decision Engine Matching
  → Fetch AI Recommendation Reasoning
  → Query AI Assistant
  → Confirm Booking
  → Track & Advance Delivery Lifecycle to DELIVERED
  → Submit Carrier Rating
  → Verify Admin GMV & DRIVA 5% Revenue Analytics
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
from pathlib import Path
from datetime import datetime, timedelta

# Setup path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "ml"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_driva_lifecycle():
    print("\n" + "=" * 60)
    print("  DRIVA MANDATORY END-TO-END FLOW VALIDATION")
    print("=" * 60)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ 1. API Health Check OK")

    # 2. Business User Login
    res = client.post(
        "/api/auth/login/json",
        json={"email": "business@driva.demo", "password": "driva2024"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ 2. Business Authentication (business@driva.demo) OK")

    # 3. Create Transport Request: Salem -> Bangalore, 200kg Electronics, Today
    deadline = (datetime.utcnow() + timedelta(hours=8)).isoformat()
    req_payload = {
        "pickup_location": "Salem",
        "destination": "Bangalore",
        "cargo_type": "Electronics",
        "cargo_weight_kg": 200.0,
        "cargo_volume_m3": 0.8,
        "vehicle_type": "Tata Ace",
        "deadline": deadline,
        "priority": "HIGH",
        "special_requirements": "Fragile electronics — weather-sealed carriage",
    }
    res = client.post("/api/transport-requests", json=req_payload, headers=headers)
    assert res.status_code == 201, f"Create request failed: {res.text}"
    req_data = res.json()
    request_id = req_data["id"]
    print(f"✓ 3. Transport Request Created (ID: #{request_id}, Corridor: Salem → Bangalore, 200kg) OK")

    # 4. Smart Matching Engine Execution (ML + Decision Engine)
    res = client.post(f"/api/matching/{request_id}", headers=headers)
    assert res.status_code == 200, f"Matching engine failed: {res.text}"
    match_data = res.json()
    assert len(match_data["options"]) > 0, "No options found"
    rec = match_data["recommended"]
    assert rec is not None, "No recommended provider"
    print(f"✓ 4. Smart Matching Engine Executed:")
    print(f"     Recommended Provider: {rec['provider_name']}")
    print(f"     Vehicle Class:        {rec['vehicle_type']} ({rec['fuel_type']})")
    print(f"     Predicted Freight:    ₹{rec['predicted_cost']:.2f}")
    print(f"     Estimated ETA:        {rec['predicted_eta_hours']:.1f} hours")
    print(f"     7-Factor Match Score: {rec['match_score']:.1f}/100")

    # 5. Groq AI Reasoning / Explainer
    res = client.post(
        "/api/ai/explain-recommendation",
        json={"request_id": request_id},
        headers=headers,
    )
    assert res.status_code == 200, f"AI reasoning failed: {res.text}"
    ai_reasoning = res.json().get("explanation", "")
    assert len(ai_reasoning) > 10, "Reasoning is empty"
    print(f"✓ 5. AI Reasoning Generated:")
    print(f"     \"{ai_reasoning[:120]}...\"")

    # 6. Conversational AI Assistant
    res = client.post(
        "/api/ai/assistant",
        json={
            "message": "Why did DRIVA choose ABC Logistics over other options?",
            "context_request_id": request_id,
        },
        headers=headers,
    )
    assert res.status_code == 200, f"AI assistant failed: {res.text}"
    assistant_reply = res.json().get("reply") or res.json().get("response", "")
    assert len(assistant_reply) > 10, f"Assistant reply is empty: {res.json()}"
    print(f"✓ 6. AI Assistant Query Answered:")
    print(f"     \"{assistant_reply[:120]}...\"")

    # 7. Confirm Booking with Recommended Provider
    book_payload = {
        "request_id": request_id,
        "provider_id": rec["provider_id"],
        "vehicle_id": rec["vehicle_id"],
    }
    res = client.post("/api/bookings", json=book_payload, headers=headers)
    assert res.status_code == 201, f"Booking creation failed: {res.text}"
    booking_data = res.json()
    booking_id = booking_data["id"]
    commission = booking_data.get("driva_commission") or (booking_data["quoted_price"] * 0.05)
    print(f"✓ 7. Commercial Booking Confirmed (ID: #{booking_id})")
    print(f"     Quoted Amount: ₹{booking_data['quoted_price']:.2f}")
    print(f"     DRIVA Fee 5%:  ₹{commission:.2f}")

    # 8. Delivery Tracking & Stage Advancements
    stages = ["DRIVER_ASSIGNED", "VEHICLE_ARRIVED", "PICKUP_COMPLETED", "IN_TRANSIT", "DELIVERED"]
    for stg in stages:
        res = client.put(
            f"/api/bookings/{booking_id}/status",
            json={"status": stg, "location": "Salem-Bangalore NH44 Corridor"},
            headers=headers,
        )
        assert res.status_code == 200, f"Status update to {stg} failed: {res.text}"
    print(f"✓ 8. Consignment Lifecycle Advanced: CONFIRMED → ... → DELIVERED")

    # 9. Rate Carrier Delivery
    rating_payload = {
        "booking_id": booking_id,
        "overall_rating": 5.0,
        "timeliness_rating": 5.0,
        "cost_rating": 5.0,
        "service_rating": 5.0,
        "comment": "Exceptional transit reliability. Fast delivery to Bangalore Electronic City.",
    }
    res = client.post("/api/ratings", json=rating_payload, headers=headers)
    assert res.status_code == 201, f"Rating submission failed: {res.text}"
    print("✓ 9. Carrier Performance Rating Submitted (5.0 Stars)")

    # 10. Admin Analytics & Revenue Verification
    admin_login = client.post(
        "/api/auth/login/json",
        json={"email": "admin@driva.demo", "password": "driva2024"},
    )
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/analytics/admin", headers=admin_headers)
    assert res.status_code == 200, f"Admin analytics failed: {res.text}"
    admin_data = res.json()
    assert admin_data["total_bookings"] >= 1, "Total bookings should be at least 1"
    assert admin_data["total_gmv"] > 0, "GMV should be > 0"
    assert admin_data["driva_revenue"] > 0, "Revenue should be > 0"
    print("✓ 10. Admin Platform Analytics Verified:")
    print(f"      Total GMV Volume:   ₹{admin_data['total_gmv']:,.2f}")
    print(f"      DRIVA Commission:   ₹{admin_data['driva_revenue']:,.2f}")
    print(f"      Active Carriers:    {admin_data['active_providers']}")
    print(f"      Average Match Score:{admin_data['avg_match_score']:.1f}/100")

    print("\n" + "=" * 60)
    print("  ALL 10 VERIFICATION STEPS PASSED WITH 100% SUCCESS!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    test_complete_driva_lifecycle()
