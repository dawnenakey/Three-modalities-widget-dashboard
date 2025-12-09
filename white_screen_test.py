#!/usr/bin/env python3
"""
Comprehensive White Screen Debug Test
Debug persistent white screen issue after video upload on mobile browsers
"""

import requests
import sys
import json
import os
from datetime import datetime
from pathlib import Path

class WhiteScreenDebugTester:
    def __init__(self, base_url="https://a11y-bridge-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
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

    def test_comprehensive_white_screen_debug(self):
        """Comprehensive test for white screen issue after video upload as per review request"""
        print("🔍 COMPREHENSIVE WHITE SCREEN DEBUG TEST")
        print("Review Request: Debug persistent white screen after video upload on mobile browsers")
        print("Context: User experiencing white screen after uploading video on mobile (iPhone Chrome, Safari, DuckDuckGo)")
        print("Audio uploads work fine, but video uploads cause white screen")
        print(f"Testing against: {self.base_url}")
        print("=" * 80)

        # Step 1: Login as katherine+admin@dozanu.com / pivot2025
        print("\n🔐 Step 1: Login as katherine+admin@dozanu.com / pivot2025")
        print("-" * 50)
        
        # Try dawnena first as we know this user has the problematic data
        login_data = {
            "email": "dawnena@dozanu.com", 
            "password": "pivot2025"
        }
        
        success, response = self.run_test("Login with dawnena@dozanu.com", "POST", "auth/login", 200, login_data)
        if not success or 'access_token' not in response:
            print("❌ Dawnena login failed, trying katherine+admin")
            # Try katherine as fallback
            login_data = {
                "email": "katherine+admin@dozanu.com",
                "password": "pivot2025"
            }
            success, response = self.run_test("Login with katherine+admin@dozanu.com (fallback)", "POST", "auth/login", 200, login_data)
            if not success:
                # Try demo user as last resort
                login_data = {
                    "email": "demo@pivot.com",
                    "password": "demo123456"
                }
                success, response = self.run_test("Login with demo@pivot.com (last resort)", "POST", "auth/login", 200, login_data)
                if not success:
                    print("❌ All login attempts failed, stopping tests")
                    return False
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"✅ Login successful. User ID: {self.user_id}")

        # Step 2: Find the Testing GoPivot website
        print("\n🌐 Step 2: Find the Testing GoPivot website")
        print("-" * 50)
        
        success, websites = self.run_test("Get All Websites", "GET", "websites", 200)
        if not success or not websites:
            print("❌ No websites found for user")
            return False
        
        print(f"✅ Found {len(websites)} websites")
        testing_website = None
        for i, website in enumerate(websites):
            website_name = website.get('name', 'Unknown')
            website_url = website.get('url', 'Unknown')
            print(f"   Website {i+1}: {website_name} - URL: {website_url} (ID: {website.get('id', 'Unknown')})")
            
            # Look for Testing GoPivot website
            if 'testing' in website_name.lower() or 'gopivot' in website_name.lower() or 'testing.gopivot.me' in website_url:
                testing_website = website
                print(f"   ✅ Found Testing GoPivot website: {website_name}")

        if not testing_website:
            print("❌ Testing GoPivot website not found, using first website as fallback")
            testing_website = websites[0]
            print(f"Using fallback website: {testing_website.get('name', 'Unknown')}")

        website_id = testing_website.get('id')

        # Step 3: Get all pages and sections for this website
        print("\n📄 Step 3: Get all pages and sections for this website")
        print("-" * 50)
        
        success, pages = self.run_test("Get All Pages for Website", "GET", f"websites/{website_id}/pages", 200)
        if not success or not pages:
            print("❌ No pages found for website")
            return False
        
        print(f"✅ Found {len(pages)} pages")
        pdf_page = None
        all_sections = []
        old_schema_sections = []
        
        for i, page in enumerate(pages):
            page_url = page.get('url', 'Unknown')
            page_id = page.get('id')
            print(f"   Page {i+1}: {page_url} (ID: {page_id}, Status: {page.get('status', 'Unknown')})")
            
            # Check if this is the PDF page
            if 'pdf' in page_url.lower() or page_url.endswith('/pdf'):
                pdf_page = page
                print(f"   ✅ Found PDF page: {page_url}")
            
            # Get sections for this page
            success, sections = self.run_test(f"Get Sections for Page {i+1}", "GET", f"pages/{page_id}/sections", 200)
            if success and sections:
                print(f"     → Found {len(sections)} sections")
                all_sections.extend(sections)
                
                # Check each section for old schema fields
                for section in sections:
                    section_id = section.get('id')
                    has_old_schema = False
                    old_fields = []
                    
                    # Check for old schema fields
                    if 'title' in section:
                        has_old_schema = True
                        old_fields.append('title')
                    if 'text' in section and 'selected_text' not in section:
                        has_old_schema = True
                        old_fields.append('text (without selected_text)')
                    if 'order' in section and 'position_order' not in section:
                        has_old_schema = True
                        old_fields.append('order (without position_order)')
                    
                    if has_old_schema:
                        old_schema_sections.append({
                            'section_id': section_id,
                            'page_url': page_url,
                            'old_fields': old_fields,
                            'section': section
                        })
                        print(f"     ❌ OLD SCHEMA SECTION FOUND: {section_id} - Fields: {', '.join(old_fields)}")
            else:
                print(f"     ❌ Failed to get sections for page {i+1}")

        # Step 4: Check if there are ANY remaining sections with old schema fields
        print("\n🔍 Step 4: Check for remaining sections with old schema fields")
        print("-" * 50)
        
        if old_schema_sections:
            print(f"❌ CRITICAL ISSUE: Found {len(old_schema_sections)} sections with old schema!")
            print("These sections will cause ResponseValidationError when API tries to return them:")
            
            for i, old_section in enumerate(old_schema_sections, 1):
                print(f"   {i}. Section ID: {old_section['section_id']}")
                print(f"      Page: {old_section['page_url']}")
                print(f"      Old fields: {', '.join(old_section['old_fields'])}")
                
                # Test if this section causes API errors
                section_id = old_section['section_id']
                success, _ = self.run_test(f"Test Old Schema Section {i}", "GET", f"sections/{section_id}", 200)
                if not success:
                    print(f"      ❌ This section causes API errors!")
                else:
                    print(f"      ✅ This section returns 200 OK")
        else:
            print("✅ No sections with old schema found - migration appears complete")

        # Step 5: For each section that has videos, test the APIs
        print("\n🎥 Step 5: Test video-related APIs for sections with videos")
        print("-" * 50)
        
        sections_with_videos = []
        video_api_errors = []
        
        for section in all_sections:
            section_id = section.get('id')
            
            # Test GET /api/sections/{section_id}/videos
            success, videos_data = self.run_test(f"GET Videos for Section", "GET", f"sections/{section_id}/videos", 200)
            if success and videos_data and len(videos_data) > 0:
                sections_with_videos.append({
                    'section_id': section_id,
                    'videos': videos_data,
                    'section': section
                })
                print(f"   ✅ Section {section_id}: Found {len(videos_data)} videos")
                
                # Test each video URL
                for i, video in enumerate(videos_data):
                    video_url = video.get('video_url')
                    if video_url:
                        # Convert to external URL if needed
                        if not video_url.startswith('http'):
                            external_url = f"https://a11y-bridge-1.preview.emergentagent.com{video_url}"
                        else:
                            external_url = video_url
                        
                        try:
                            video_response = requests.get(external_url, timeout=10)
                            if video_response.status_code != 200:
                                video_api_errors.append(f"Video URL not accessible: {external_url} (Status: {video_response.status_code})")
                                print(f"     ❌ Video {i+1} not accessible: {video_response.status_code}")
                            else:
                                print(f"     ✅ Video {i+1} accessible: 200 OK")
                        except Exception as e:
                            video_api_errors.append(f"Video URL error: {external_url} - {str(e)}")
                            print(f"     ❌ Video {i+1} error: {str(e)}")
            elif not success:
                video_api_errors.append(f"GET /api/sections/{section_id}/videos failed")
                print(f"   ❌ Section {section_id}: Failed to get videos")
            else:
                print(f"   → Section {section_id}: No videos found")

        # Step 6: Specifically check sections on the PDF page
        print("\n📄 Step 6: Specifically check sections on the PDF page")
        print("-" * 50)
        
        if pdf_page:
            pdf_page_id = pdf_page.get('id')
            pdf_page_url = pdf_page.get('url')
            
            success, pdf_sections = self.run_test("Get PDF Page Sections", "GET", f"pages/{pdf_page_id}/sections", 200)
            if success and pdf_sections:
                print(f"✅ PDF page has {len(pdf_sections)} sections")
                
                for i, section in enumerate(pdf_sections, 1):
                    section_id = section.get('id')
                    section_text = section.get('selected_text', section.get('text_content', 'No text'))[:50]
                    
                    print(f"   Section {i}: {section_text}... (ID: {section_id})")
                    
                    # Test critical endpoints for this section
                    success, _ = self.run_test(f"PDF Section {i} Details", "GET", f"sections/{section_id}", 200)
                    if not success:
                        video_api_errors.append(f"PDF page section {section_id} details API failed")
                    
                    success, videos = self.run_test(f"PDF Section {i} Videos", "GET", f"sections/{section_id}/videos", 200)
                    if not success:
                        video_api_errors.append(f"PDF page section {section_id} videos API failed")
                    elif videos:
                        print(f"     → Has {len(videos)} videos")
            else:
                print("❌ Failed to get sections for PDF page")
                video_api_errors.append("Failed to get sections for PDF page")
        else:
            print("❌ PDF page not found")

        # Step 7: Look for ResponseValidationError or 500 errors in backend logs
        print("\n📋 Step 7: Check backend logs for errors")
        print("-" * 50)
        
        # Check supervisor backend logs
        try:
            import subprocess
            log_result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.err.log'], 
                                      capture_output=True, text=True, timeout=10)
            if log_result.returncode == 0 and log_result.stdout:
                print("✅ Backend error logs found:")
                log_lines = log_result.stdout.strip().split('\n')
                error_count = 0
                for line in log_lines[-20:]:  # Show last 20 lines
                    if 'error' in line.lower() or 'exception' in line.lower() or '500' in line:
                        print(f"   ❌ {line}")
                        error_count += 1
                    elif 'responsevalidationerror' in line.lower():
                        print(f"   🚨 VALIDATION ERROR: {line}")
                        error_count += 1
                
                if error_count == 0:
                    print("   ✅ No recent errors found in backend logs")
            else:
                print("❌ Could not read backend logs")
        except Exception as e:
            print(f"❌ Error reading logs: {str(e)}")

        # Step 8: Test the video upload flow simulation
        print("\n🎬 Step 8: Test video upload flow simulation")
        print("-" * 50)
        
        if sections_with_videos:
            # Use first section with videos for testing
            test_section = sections_with_videos[0]
            section_id = test_section['section_id']
            
            print(f"Testing video upload confirmation flow for section: {section_id}")
            
            # Simulate video upload confirmation (this is what happens after mobile upload)
            # Test if section data can be retrieved after upload
            success, section_data = self.run_test("Post-Upload Section Retrieval", "GET", f"sections/{section_id}", 200)
            if not success:
                video_api_errors.append("Post-upload section retrieval failed - this causes white screen")
                print("❌ Post-upload section retrieval failed - THIS CAUSES WHITE SCREEN")
            else:
                print("✅ Post-upload section retrieval works")
                
                # Verify response structure matches Pydantic model
                required_fields = ['id', 'page_id', 'selected_text', 'position_order', 'status']
                missing_fields = []
                for field in required_fields:
                    if field not in section_data:
                        missing_fields.append(field)
                
                if missing_fields:
                    video_api_errors.append(f"Section response missing required fields: {', '.join(missing_fields)}")
                    print(f"❌ Section response missing fields: {', '.join(missing_fields)}")
                else:
                    print("✅ Section response structure is valid")

        # Step 9: Final Analysis and Summary
        print("\n🔍 Step 9: Final Analysis and Summary")
        print("=" * 50)
        
        print(f"\n📊 COMPREHENSIVE TEST RESULTS:")
        print(f"• Total websites: {len(websites)}")
        print(f"• Total pages: {len(pages)}")
        print(f"• Total sections: {len(all_sections)}")
        print(f"• Sections with old schema: {len(old_schema_sections)}")
        print(f"• Sections with videos: {len(sections_with_videos)}")
        print(f"• Video API errors: {len(video_api_errors)}")
        print(f"• PDF page found: {'Yes' if pdf_page else 'No'}")
        
        print(f"\n🚨 ROOT CAUSE ANALYSIS:")
        if old_schema_sections:
            print("❌ CRITICAL ISSUE: Old schema sections still exist!")
            print("   → These sections cause ResponseValidationError when API tries to return them")
            print("   → This causes 500 errors on GET /api/pages/{id}/sections")
            print("   → Frontend fetchData() fails after video upload, resulting in white screen")
            print("   → SOLUTION: Migrate remaining old schema sections to new schema")
        elif video_api_errors:
            print("❌ VIDEO API ISSUES FOUND:")
            for error in video_api_errors:
                print(f"   → {error}")
            print("   → These API failures cause white screen after video upload")
        else:
            print("✅ NO CRITICAL ISSUES FOUND")
            print("   → All sections use new schema")
            print("   → All video APIs return 200 OK")
            print("   → All video URLs are accessible")
            print("   → White screen issue appears to be resolved")
        
        print(f"\n💡 RECOMMENDATIONS:")
        if old_schema_sections:
            print("   1. URGENT: Migrate remaining old schema sections")
            print("   2. Add database migration script to handle old schema")
            print("   3. Add validation to prevent old schema sections")
        elif video_api_errors:
            print("   1. Fix video API endpoint errors")
            print("   2. Verify video file storage and URL generation")
            print("   3. Add proper error handling in frontend")
        else:
            print("   1. White screen issue appears resolved")
            print("   2. Monitor for any new reports")
            print("   3. Consider adding frontend error boundaries")
        
        return len(old_schema_sections) == 0 and len(video_api_errors) == 0

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

if __name__ == "__main__":
    tester = WhiteScreenDebugTester()
    success = tester.test_comprehensive_white_screen_debug()
    tester.print_summary()
    sys.exit(0 if success else 1)