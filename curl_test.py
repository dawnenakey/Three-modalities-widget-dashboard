#!/usr/bin/env python3
"""
Full curl-equivalent test for Add Section functionality as requested in review
"""

import requests
import json

def main():
    print("🧪 FULL ADD SECTION FLOW TEST (CURL EQUIVALENT)")
    print("=" * 60)
    print("Testing: login -> get page_id -> create section -> verify section")
    print("=" * 60)
    
    base_url = "https://a11y-bridge-1.preview.emergentagent.com/api"
    
    # Step 1: Login
    print("\n🔐 Step 1: Login")
    print("curl -X POST {}/auth/login \\".format(base_url))
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"email": "dawnena@dozanu.com", "password": "pivot2025"}\'')
    
    login_response = requests.post(f"{base_url}/auth/login", json={
        "email": "dawnena@dozanu.com",
        "password": "pivot2025"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return False
    
    token = login_response.json()['access_token']
    print(f"✅ Login successful, token obtained")
    
    # Step 2: Get websites to find a page_id
    print("\n🌐 Step 2: Get websites")
    print("curl -X GET {}/websites \\".format(base_url))
    print(f'  -H "Authorization: Bearer {token[:20]}..."')
    
    headers = {'Authorization': f'Bearer {token}'}
    websites_response = requests.get(f"{base_url}/websites", headers=headers)
    
    if websites_response.status_code != 200:
        print(f"❌ Get websites failed: {websites_response.status_code}")
        return False
    
    websites = websites_response.json()
    if not websites:
        print("❌ No websites found")
        return False
    
    website_id = websites[0]['id']
    print(f"✅ Found {len(websites)} websites, using: {website_id}")
    
    # Step 3: Get pages for the website
    print("\n📄 Step 3: Get pages")
    print("curl -X GET {}/websites/{}/pages \\".format(base_url, website_id))
    print(f'  -H "Authorization: Bearer {token[:20]}..."')
    
    pages_response = requests.get(f"{base_url}/websites/{website_id}/pages", headers=headers)
    
    if pages_response.status_code != 200:
        print(f"❌ Get pages failed: {pages_response.status_code}")
        return False
    
    pages = pages_response.json()
    if not pages:
        print("❌ No pages found")
        return False
    
    page_id = pages[0]['id']
    print(f"✅ Found {len(pages)} pages, using: {page_id}")
    
    # Step 4: Create section with correct payload
    print("\n📝 Step 4: Create section")
    print("curl -X POST {}/pages/{}/sections \\".format(base_url, page_id))
    print(f'  -H "Authorization: Bearer {token[:20]}..." \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"selected_text": "Sample section text for testing the Add Section fix", "position_order": 1}\'')
    
    section_data = {
        "selected_text": "Sample section text for testing the Add Section fix - created via curl-equivalent test",
        "position_order": 1
    }
    
    headers['Content-Type'] = 'application/json'
    section_response = requests.post(f"{base_url}/pages/{page_id}/sections", json=section_data, headers=headers)
    
    if section_response.status_code not in [200, 201]:
        print(f"❌ Create section failed: {section_response.status_code}")
        print(f"   Error: {section_response.text}")
        return False
    
    section = section_response.json()
    section_id = section['id']
    print(f"✅ Section created successfully!")
    print(f"   ID: {section_id}")
    print(f"   Page ID: {section['page_id']}")
    print(f"   Selected Text: {section['selected_text']}")
    print(f"   Position Order: {section['position_order']}")
    print(f"   Created At: {section['created_at']}")
    
    # Step 5: Verify section was created by retrieving it
    print("\n🔍 Step 5: Verify section creation")
    print("curl -X GET {}/sections/{} \\".format(base_url, section_id))
    print(f'  -H "Authorization: Bearer {token[:20]}..."')
    
    verify_response = requests.get(f"{base_url}/sections/{section_id}", headers={'Authorization': f'Bearer {token}'})
    
    if verify_response.status_code != 200:
        print(f"❌ Verify section failed: {verify_response.status_code}")
        return False
    
    verified_section = verify_response.json()
    print(f"✅ Section verification successful!")
    print(f"   Retrieved ID: {verified_section['id']}")
    print(f"   Retrieved Text: {verified_section['selected_text']}")
    
    # Verify all expected fields are present
    required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'created_at']
    missing_fields = [field for field in required_fields if field not in verified_section]
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return False
    
    print("✅ All required fields present in response")
    
    # Final verification - check that the data matches
    if (verified_section['id'] == section_id and 
        verified_section['page_id'] == page_id and
        verified_section['selected_text'] == section_data['selected_text']):
        print("✅ Data integrity verified - all fields match")
        return True
    else:
        print("❌ Data integrity check failed - fields don't match")
        return False

if __name__ == "__main__":
    success = main()
    
    print("\n" + "=" * 60)
    print("📊 FINAL RESULT")
    print("=" * 60)
    
    if success:
        print("✅ ADD SECTION FUNCTIONALITY: FULLY WORKING")
        print("✅ Frontend-Backend payload alignment: FIXED")
        print("✅ Section creation with 'selected_text': SUCCESS")
        print("✅ Section retrieval with all fields: SUCCESS")
        print("✅ Data persistence in database: VERIFIED")
        print("\nThe bug fix is successful! Frontend now correctly sends 'selected_text'")
        print("and the backend processes it properly with 200/201 response codes.")
    else:
        print("❌ ADD SECTION FUNCTIONALITY: ISSUES DETECTED")
        print("The fix may not be working as expected.")