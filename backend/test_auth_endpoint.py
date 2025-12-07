#!/usr/bin/env python3
"""
Test authentication against production endpoint
"""
import requests
import json

# Test login
print("🔐 Testing Production Login...")
print("="*60)

url = "https://testing.gopivot.me/api/auth/login"
credentials = {
    "email": "dawnena@dozanu.com",
    "password": "pivot2025"
}

print(f"POST {url}")
print(f"Body: {json.dumps(credentials, indent=2)}\n")

try:
    response = requests.post(url, json=credentials, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}\n")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ LOGIN SUCCESSFUL!")
        print(f"Token Type: {data.get('token_type')}")
        token = data.get('access_token')
        print(f"Token (first 50 chars): {token[:50]}...")
        
        # Test creating website with this token
        print("\n" + "="*60)
        print("📝 Testing Create Website with Fresh Token...")
        
        create_url = "https://testing.gopivot.me/api/websites"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        website_data = {
            "name": "Test Website",
            "url": "https://example.com"
        }
        
        create_response = requests.post(create_url, json=website_data, headers=headers, timeout=10)
        print(f"Status Code: {create_response.status_code}")
        
        if create_response.status_code == 200:
            print("✅ WEBSITE CREATED SUCCESSFULLY!")
            print(json.dumps(create_response.json(), indent=2))
        else:
            print(f"❌ FAILED TO CREATE WEBSITE")
            print(f"Response: {create_response.text}")
            
    else:
        print(f"❌ LOGIN FAILED")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ ERROR: {str(e)}")
