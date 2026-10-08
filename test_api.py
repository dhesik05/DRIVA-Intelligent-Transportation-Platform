import urllib.request
import json
import urllib.parse

def post(url, data=None, headers=None):
    headers = headers or {}
    if data:
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

url_login = "http://localhost:8000/api/auth/login/json"
code, resp_login = post(url_login, {"email": "business@driva.demo", "password": "driva2024"})
if code != 200:
    print("Login failed:", resp_login)
    exit(1)

token = resp_login["access_token"]
headers = {"Authorization": f"Bearer {token}"}

payload = {
    "pickup_location": "Salem",
    "destination": "Bangalore",
    "cargo_type": "Electronics",
    "cargo_weight_kg": 200,
    "cargo_volume_m3": 0.8,
    "cargo_dimensions": "2.5m x 1.5m x 1.2m",
    "vehicle_type_preference": "Tata Ace",
    "deadline": "2026-10-10T10:00:00Z",
    "priority": "HIGH"
}
url_req = "http://localhost:8000/api/transport-requests"
code, resp_req = post(url_req, payload, headers)
if code not in (200, 201):
    print("Create req failed:", resp_req)
    exit(1)

req_id = resp_req["id"]
print("Created request:", req_id)

url_match = f"http://localhost:8000/api/matching/{req_id}"
code, resp_match = post(url_match, data={}, headers=headers)
print("Match status:", code)
with open("test_resp.json", "w", encoding="utf-8") as f:
    json.dump(resp_match, f, indent=2)
