#!/usr/bin/env python3
"""
Direct test for the specific section that was just created
"""

import requests
import json

def test_direct_section_access():
    """Test accessing the newly created section directly"""
    
    # Login first
    base_url = "https://a11y-bridge-1.preview.emergentagent.com/api"
    
    login_data = {
        "email": "dawnena@dozanu.com",
        "password": "pivot2025"
    }
    
    print("🔐 Logging in...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return False
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # The section ID from our previous test
    section_id = "bc5ec16e-6e7f-4e9e-8d49-f10d042f357d"
    
    print(f"📋 Testing direct access to section: {section_id}")
    
    try:
        response = requests.get(f"{base_url}/sections/{section_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Section retrieved successfully!")
            print(f"   ID: {data.get('id')}")
            print(f"   Page ID: {data.get('page_id')}")
            print(f"   Selected Text: {data.get('selected_text', 'N/A')[:100]}...")
            print(f"   Position Order: {data.get('position_order')}")
            print(f"   Created At: {data.get('created_at')}")
            
            # Verify all required fields are present
            required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'created_at']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing fields: {missing_fields}")
                return False
            else:
                print("✅ All required fields present")
                return True
        else:
            print(f"❌ Failed to retrieve section: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def test_create_another_section():
    """Test creating another section to verify the fix works consistently"""
    
    base_url = "https://a11y-bridge-1.preview.emergentagent.com/api"
    
    login_data = {
        "email": "dawnena@dozanu.com",
        "password": "pivot2025"
    }
    
    print("\n🔐 Logging in for new section test...")
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        return False
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # Use the same page ID from previous test
    page_id = "84b02587-3995-4282-8493-28777681c98b"
    
    print(f"📝 Creating another section for page: {page_id}")
    
    section_data = {
        "selected_text": "Second test section to verify the Add Section fix works consistently. This confirms the frontend-backend payload alignment.",
        "position_order": 2
    }
    
    try:
        response = requests.post(f"{base_url}/pages/{page_id}/sections", json=section_data, headers=headers)
        
        if response.status_code in [200, 201]:
            data = response.json()
            print("✅ Second section created successfully!")
            print(f"   ID: {data.get('id')}")
            print(f"   Selected Text: {data.get('selected_text', 'N/A')[:100]}...")
            print(f"   Position Order: {data.get('position_order')}")
            
            # Now test direct access to this new section
            new_section_id = data['id']
            print(f"\n📋 Testing direct access to new section: {new_section_id}")
            
            response = requests.get(f"{base_url}/sections/{new_section_id}", headers=headers)
            
            if response.status_code == 200:
                section_data = response.json()
                print("✅ New section retrieved successfully!")
                print(f"   Selected Text: {section_data.get('selected_text', 'N/A')[:100]}...")
                return True
            else:
                print(f"❌ Failed to retrieve new section: {response.status_code}")
                return False
                
        else:
            print(f"❌ Failed to create section: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 DIRECT SECTION ACCESS TEST")
    print("=" * 50)
    
    success1 = test_direct_section_access()
    success2 = test_create_another_section()
    
    print("\n" + "=" * 50)
    print("📊 RESULTS:")
    print(f"Direct section access: {'✅ PASS' if success1 else '❌ FAIL'}")
    print(f"Create new section: {'✅ PASS' if success2 else '❌ FAIL'}")
    
    if success1 and success2:
        print("\n✅ ADD SECTION FUNCTIONALITY: WORKING CORRECTLY")
        print("The fix is successful - frontend sends 'selected_text' and backend processes it properly.")
    else:
        print("\n❌ ADD SECTION FUNCTIONALITY: ISSUES DETECTED")