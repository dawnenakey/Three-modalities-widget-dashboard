import requests
import sys
import json
import os
from datetime import datetime
from pathlib import Path

class PIVOTAPITester:
    def __init__(self, base_url="https://tri-lingual-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_resources = {
            'websites': [],
            'pages': [],
            'sections': []
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            'test': name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)
        
        if files:
            # Remove Content-Type for file uploads
            test_headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=test_headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f", Response: {json.dumps(response_data, indent=2)[:200]}..."
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details)
                    return True, {}
            elif not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data}"
                except:
                    details += f", Error: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}
            else:
                self.log_test(name, True, details)
                return True, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # Use the same credentials from registration
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_create_website(self):
        """Test website creation"""
        website_data = {
            "name": "Test Website",
            "url": "https://example.com"
        }
        
        success, response = self.run_test("Create Website", "POST", "websites", 200, website_data)
        if success and 'id' in response:
            self.created_resources['websites'].append(response['id'])
            return True, response['id']
        return False, None

    def test_get_websites(self):
        """Test get websites"""
        return self.run_test("Get Websites", "GET", "websites", 200)

    def test_get_website_detail(self, website_id):
        """Test get website detail"""
        return self.run_test("Get Website Detail", "GET", f"websites/{website_id}", 200)

    def test_create_page(self, website_id):
        """Test page creation with auto-scraping"""
        page_data = {
            "url": "https://example.com"
        }
        
        success, response = self.run_test("Create Page with Auto-scraping", "POST", f"websites/{website_id}/pages", 200, page_data)
        if success and 'id' in response:
            self.created_resources['pages'].append(response['id'])
            return True, response['id']
        return False, None

    def test_get_pages(self, website_id):
        """Test get pages for website"""
        return self.run_test("Get Pages", "GET", f"websites/{website_id}/pages", 200)

    def test_get_page_detail(self, page_id):
        """Test get page detail"""
        return self.run_test("Get Page Detail", "GET", f"pages/{page_id}", 200)

    def test_get_sections(self, page_id):
        """Test get sections for page"""
        success, response = self.run_test("Get Sections", "GET", f"pages/{page_id}/sections", 200)
        if success and response and len(response) > 0:
            # Store first section ID for further testing
            self.created_resources['sections'].append(response[0]['id'])
            return True, response[0]['id']
        return False, None

    def test_create_section(self, page_id):
        """Test manual section creation"""
        section_data = {
            "selected_text": "This is a test section for accessibility content.",
            "position_order": 1
        }
        
        success, response = self.run_test("Create Section", "POST", f"pages/{page_id}/sections", 200, section_data)
        if success and 'id' in response:
            self.created_resources['sections'].append(response['id'])
            return True, response['id']
        return False, None

    def test_get_section_detail(self, section_id):
        """Test get section detail"""
        return self.run_test("Get Section Detail", "GET", f"sections/{section_id}", 200)

    def test_upload_video(self, section_id):
        """Test video upload (simulated)"""
        # Create a small test video file
        test_video_content = b"fake video content for testing"
        files = {'video': ('test_video.mp4', test_video_content, 'video/mp4')}
        data = {'language': 'ASL (American Sign Language)'}
        
        return self.run_test("Upload Video", "POST", f"sections/{section_id}/videos", 200, data, files)

    def test_get_videos(self, section_id):
        """Test get videos for section"""
        return self.run_test("Get Videos", "GET", f"sections/{section_id}/videos", 200)

    def test_upload_audio(self, section_id):
        """Test audio upload (simulated)"""
        # Create a small test audio file
        test_audio_content = b"fake audio content for testing"
        files = {'audio': ('test_audio.mp3', test_audio_content, 'audio/mp3')}
        data = {'language': 'English'}
        
        return self.run_test("Upload Audio", "POST", f"sections/{section_id}/audio", 200, data, files)

    def test_generate_tts_audio(self, section_id):
        """Test OpenAI TTS audio generation"""
        tts_data = {
            'language': 'English',
            'voice': 'alloy'
        }
        
        return self.run_test("Generate TTS Audio", "POST", f"sections/{section_id}/audio/generate", 200, tts_data)

    def test_get_audios(self, section_id):
        """Test get audios for section"""
        return self.run_test("Get Audios", "GET", f"sections/{section_id}/audio", 200)

    def test_widget_api(self, website_id):
        """Test public widget API"""
        page_url = "https://example.com"
        return self.run_test("Widget API", "GET", f"widget/{website_id}/content?page_url={page_url}", 200)

    def test_analytics(self, website_id):
        """Test analytics endpoint"""
        return self.run_test("Analytics", "GET", f"analytics/{website_id}", 200)

    def cleanup_resources(self):
        """Clean up created resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete websites (this should cascade delete pages and sections)
        for website_id in self.created_resources['websites']:
            try:
                self.run_test("Cleanup Website", "DELETE", f"websites/{website_id}", 200)
            except:
                pass

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting PIVOT API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Basic API tests
        self.test_root_endpoint()
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        self.test_get_current_user()
        
        # Website management tests
        website_success, website_id = self.test_create_website()
        if not website_success:
            print("❌ Website creation failed, stopping tests")
            return False
            
        self.test_get_websites()
        self.test_get_website_detail(website_id)
        
        # Page management tests
        page_success, page_id = self.test_create_page(website_id)
        if not page_success:
            print("❌ Page creation failed, stopping tests")
            return False
            
        self.test_get_pages(website_id)
        self.test_get_page_detail(page_id)
        
        # Section management tests
        sections_success, section_id = self.test_get_sections(page_id)
        if not sections_success:
            # Try creating a manual section
            sections_success, section_id = self.test_create_section(page_id)
            
        if sections_success and section_id:
            self.test_get_section_detail(section_id)
            
            # File upload tests
            self.test_upload_video(section_id)
            self.test_get_videos(section_id)
            self.test_upload_audio(section_id)
            self.test_get_audios(section_id)
            
            # TTS generation test
            self.test_generate_tts_audio(section_id)
        
        # Widget and analytics tests
        self.test_widget_api(website_id)
        self.test_analytics(website_id)
        
        # Cleanup
        self.cleanup_resources()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PIVOTAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save detailed results
        results_file = "/app/backend_test_results.json"
        with open(results_file, 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': tester.tests_run,
                    'passed_tests': tester.tests_passed,
                    'failed_tests': tester.tests_run - tester.tests_passed,
                    'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
                },
                'detailed_results': tester.test_results
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: {results_file}")
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"❌ Test suite failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())