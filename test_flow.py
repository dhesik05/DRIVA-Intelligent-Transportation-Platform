import urllib.request, json

def post(url, data, token=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

login_resp = post('http://localhost:8000/api/auth/login/json', {'email':'business@driva.demo','password':'driva2024'})
token = login_resp['access_token']

req_data = {
    'pickup_location': 'Salem',
    'destination': 'Bangalore',
    'cargo_type': 'Electronics',
    'cargo_weight_kg': 200,
    'cargo_volume_m3': 0.8,
    'cargo_length_m': 2.5,
    'cargo_width_m': 1.5,
    'cargo_height_m': 1.2,
    'cargo_dimensions': '2.5m x 1.5m x 1.2m',
    'vehicle_type_preference': 'Tata Ace',
    'priority': 'HIGH',
    'special_requirements': 'Fragile electronics'
}

r1 = post('http://localhost:8000/api/transport-requests', req_data, token)
req_id = r1['id']
print(f"1. Create Request SUCCESS -> Request ID #{req_id}")

r2 = post(f'http://localhost:8000/api/matching/{req_id}', {}, token)
rec = r2.get('recommended', {})
print(f"2. ML Prediction & Smart Match SUCCESS -> Found {len(r2.get('options', []))} candidate options")
print(f"   [RECOMMENDED] Carrier: {rec.get('provider_name')} - {rec.get('vehicle_type')} ({rec.get('vehicle_number')})")
print(f"   Predicted Cost: Rs {rec.get('predicted_cost'):,.2f}")
print(f"   Predicted ETA: {rec.get('predicted_eta_hours'):.1f} hours")
print(f"   DRIVA Match Score: {rec.get('match_score')}/100")
print(f"   Weight Utilization: {rec.get('weight_utilization_pct')}% ({req_data['cargo_weight_kg']} kg / {rec.get('capacity_kg')} kg)")
print(f"   Dimension Fit: {rec.get('dimension_fit')} (Usable: {rec.get('usable_length_m')}x{rec.get('usable_width_m')}x{rec.get('usable_height_m')}m)")
print(f"   Deadline Met: {rec.get('deadline_met')}")
print(f"   Decision Factors:")
print(f"      - Route Compatibility (25%): {rec.get('route_score')}/100")
print(f"      - Cost Score (20%):          {rec.get('cost_score')}/100")
print(f"      - ETA Score (20%):           {rec.get('eta_score')}/100")
print(f"      - Capacity Score (15%):      {rec.get('capacity_score')}/100")
print(f"      - Vehicle Suitability (10%): {rec.get('suitability_score')}/100")
print(f"      - Reliability (5%):          {rec.get('provider_reliability')}/100")
print(f"      - Availability (5%):         {rec.get('availability_score')}/100")
