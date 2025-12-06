#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

def test_website_creation():
    base_url = "https://testing.gopivot.me/api"
    
    # First login to get token
    login_data = {
        "email": "demo@pivot.com",
        "password": "demo123456"
    }
    
    print("1. Logging in...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code != 200:
        print("Login failed")
        return
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Test website creation with different URLs
    test_urls = [
        "https://example.com",
        "https://google.com",
        "https://httpbin.org/get"
    ]
    
    for url in test_urls:
        print(f"\n2. Testing website creation with URL: {url}")
        website_data = {
            "name": f"Test Website - {url}",
            "url": url
        }
        
        try:
            response = requests.post(f"{base_url}/websites", json=website_data, headers=headers, timeout=30)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("SUCCESS!")
                print(json.dumps(response.json(), indent=2))
                break
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    test_website_creation()