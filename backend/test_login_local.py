import requests
import json

url = "http://0.0.0.0:8001/api/auth/login"
payload = {
    "email": "Katherine@dozanu.com",
    "password": "pivot2025"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
