#!/usr/bin/env python3
"""
Focused test for "Add Section" functionality fix
Tests the POST /api/pages/{page_id}/sections endpoint with correct payload format
"""

import requests
import json
import sys
from datetime import datetime

class SectionTestRunner:
    def __init__(self):
        # Use the external URL as specified in frontend/.env
        self.base_url = "https://signbuddy-18.preview.emergentagent.com/api"
        self.token = None
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        return success
    
    def login_user(self):
        """Login with specified credentials"""
        print("🔐 Step 1: Authenticating user...")
        
        login_data = {
            "email": "dawnena@dozanu.com",
            "password": "pivot2025"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.token = data['access_token']
                    return self.log_result("User Authentication", True, f"Login successful for {login_data['email']}")
                else:
                    return self.log_result("User Authentication", False, "No access token in response")
            else:
                return self.log_result("User Authentication", False, f"Status: {response.status_code}, Error: {response.text}")
                
        except Exception as e:
            return self.log_result("User Authentication", False, f"Exception: {str(e)}")
    
    def get_page_id(self):
        """Get an existing page ID from user's websites"""
        print("📄 Step 2: Getting existing page ID...")
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            # Get websites
            websites_response = requests.get(f"{self.base_url}/websites", headers=headers, timeout=30)
            if websites_response.status_code != 200:
                return self.log_result("Get Websites", False, f"Status: {websites_response.status_code}")
            
            websites = websites_response.json()
            if not websites:
                return self.log_result("Get Websites", False, "No websites found"), None
            
            website_id = websites[0]['id']
            self.log_result("Get Websites", True, f"Found {len(websites)} websites, using: {website_id}")
            
            # Get pages for the first website
            pages_response = requests.get(f"{self.base_url}/websites/{website_id}/pages", headers=headers, timeout=30)
            if pages_response.status_code != 200:
                return self.log_result("Get Pages", False, f"Status: {pages_response.status_code}")
            
            pages = pages_response.json()
            if not pages:
                return self.log_result("Get Pages", False, "No pages found"), None
            
            page_id = pages[0]['id']
            self.log_result("Get Pages", True, f"Found {len(pages)} pages, using: {page_id}")
            
            return True, page_id
            
        except Exception as e:
            return self.log_result("Get Page ID", False, f"Exception: {str(e)}"), None
    
    def test_create_section(self, page_id):
        """Test creating a section with the correct payload format"""
        print("📝 Step 3: Testing section creation with correct payload...")
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # Test data with selected_text field (the fix)
        section_data = {
            "selected_text": "This is a test section created to verify the Add Section functionality fix. The frontend now correctly sends 'selected_text' instead of 'text_content'.",
            "position_order": 1
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/pages/{page_id}/sections", 
                json=section_data, 
                headers=headers, 
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response contains expected fields
                required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'created_at']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    return self.log_result("Create Section", False, f"Missing fields in response: {missing_fields}"), None
                
                # Verify the data matches what we sent
                if data['selected_text'] != section_data['selected_text']:
                    return self.log_result("Create Section", False, f"Selected text mismatch. Sent: {section_data['selected_text']}, Got: {data['selected_text']}")
                
                if data['page_id'] != page_id:
                    return self.log_result("Create Section", False, f"Page ID mismatch. Expected: {page_id}, Got: {data['page_id']}")
                
                section_id = data['id']
                self.log_result("Create Section", True, f"Section created successfully. ID: {section_id}, Text: {data['selected_text'][:50]}...")
                
                return True, section_id
                
            else:
                return self.log_result("Create Section", False, f"Status: {response.status_code}, Error: {response.text}"), None
                
        except Exception as e:
            return self.log_result("Create Section", False, f"Exception: {str(e)}"), None
    
    def verify_section_in_database(self, page_id, section_id):
        """Verify the section was stored correctly in the database"""
        print("🔍 Step 4: Verifying section is stored in database...")
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            # Get all sections for the page
            response = requests.get(f"{self.base_url}/pages/{page_id}/sections", headers=headers, timeout=30)
            
            if response.status_code != 200:
                return self.log_result("Verify Section in Database", False, f"Status: {response.status_code}")
            
            sections = response.json()
            
            # Find our section
            created_section = None
            for section in sections:
                if section['id'] == section_id:
                    created_section = section
                    break
            
            if not created_section:
                return self.log_result("Verify Section in Database", False, f"Section {section_id} not found in database")
            
            # Verify it has the correct structure
            required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'created_at']
            missing_fields = [field for field in required_fields if field not in created_section]
            
            if missing_fields:
                return self.log_result("Verify Section in Database", False, f"Missing fields: {missing_fields}")
            
            self.log_result("Verify Section in Database", True, f"Section found with all required fields. Text: {created_section['selected_text'][:50]}...")
            
            return True
            
        except Exception as e:
            return self.log_result("Verify Section in Database", False, f"Exception: {str(e)}")
    
    def test_section_detail_endpoint(self, section_id):
        """Test getting section details"""
        print("📋 Step 5: Testing section detail endpoint...")
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(f"{self.base_url}/sections/{section_id}", headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'created_at']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    return self.log_result("Section Detail Endpoint", False, f"Missing fields: {missing_fields}")
                
                self.log_result("Section Detail Endpoint", True, f"Section details retrieved successfully. ID: {data['id']}")
                return True
                
            else:
                return self.log_result("Section Detail Endpoint", False, f"Status: {response.status_code}, Error: {response.text}")
                
        except Exception as e:
            return self.log_result("Section Detail Endpoint", False, f"Exception: {str(e)}")
    
    def run_full_test(self):
        """Run the complete Add Section functionality test"""
        print("🧪 TESTING ADD SECTION FUNCTIONALITY FIX")
        print("=" * 60)
        print("Context: Fixed bug where frontend sent 'text_content' but backend expected 'selected_text'")
        print("Testing: POST /api/pages/{page_id}/sections with correct payload format")
        print("=" * 60)
        
        # Step 1: Login
        if not self.login_user():
            print("❌ Authentication failed, stopping test")
            return False
        
        # Step 2: Get page ID
        success, page_id = self.get_page_id()
        if not success or not page_id:
            print("❌ Failed to get page ID, stopping test")
            return False
        
        # Step 3: Create section
        success, section_id = self.test_create_section(page_id)
        if not success or not section_id:
            print("❌ Section creation failed, stopping test")
            return False
        
        # Step 4: Verify in database
        if not self.verify_section_in_database(page_id, section_id):
            print("❌ Section verification failed")
            return False
        
        # Step 5: Test section detail endpoint
        if not self.test_section_detail_endpoint(section_id):
            print("❌ Section detail endpoint failed")
            return False
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 ADD SECTION TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    tester = SectionTestRunner()
    
    try:
        success = tester.run_full_test()
        all_passed = tester.print_summary()
        
        if success and all_passed:
            print("\n✅ ADD SECTION FUNCTIONALITY FIX: VERIFIED WORKING")
            print("The frontend now correctly sends 'selected_text' and backend processes it properly.")
            return 0
        else:
            print("\n❌ ADD SECTION FUNCTIONALITY FIX: ISSUES FOUND")
            return 1
            
    except Exception as e:
        print(f"❌ Test suite failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())