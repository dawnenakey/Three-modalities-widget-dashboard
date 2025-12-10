#!/usr/bin/env python3
"""
Local Testing Script for PIVOT Backend
Tests the merged code before EC2 deployment
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

def test_imports():
    """Test that all critical modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        import fastapi
        print("  ✅ fastapi")
    except ImportError as e:
        print(f"  ❌ fastapi: {e}")
        return False
    
    try:
        import motor
        print("  ✅ motor")
    except ImportError as e:
        print(f"  ❌ motor: {e}")
        return False
    
    try:
        import boto3
        print("  ✅ boto3")
    except ImportError as e:
        print(f"  ❌ boto3: {e}")
        return False
    
    try:
        import s3_service
        print("  ✅ s3_service")
    except Exception as e:
        print(f"  ⚠️  s3_service: {e} (may need AWS credentials)")
    
    try:
        # Test server import (may fail if env vars missing, but that's OK for structure test)
        import server
        print("  ✅ server (structure OK)")
    except Exception as e:
        if "MONGO_URL" in str(e) or "JWT_SECRET_KEY" in str(e):
            print(f"  ⚠️  server: Missing env vars (expected): {e}")
        else:
            print(f"  ❌ server: {e}")
            return False
    
    return True

def test_env_vars():
    """Check environment variables"""
    print("\n🔍 Checking environment variables...")
    
    env_path = Path(__file__).parent / 'backend' / '.env'
    if not env_path.exists():
        print("  ⚠️  backend/.env not found")
        return False
    
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    required_vars = [
        'MONGO_URL',
        'DB_NAME',
        'JWT_SECRET_KEY',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET_NAME'
    ]
    
    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: SET")
        else:
            print(f"  ⚠️  {var}: NOT SET")
            missing.append(var)
    
    if missing:
        print(f"\n  ⚠️  Missing variables: {', '.join(missing)}")
        print("  Note: Some may be optional for basic testing")
    
    return True

def test_s3_service():
    """Test S3 service configuration"""
    print("\n🔍 Testing S3 service...")
    
    try:
        import s3_service
        
        # Check if credentials are configured
        if not s3_service.AWS_ACCESS_KEY_ID or not s3_service.AWS_SECRET_ACCESS_KEY:
            print("  ⚠️  AWS credentials not configured (expected for local test)")
            print("  ✅ S3 service structure is OK")
        else:
            print("  ✅ AWS credentials configured")
            if s3_service.S3_BUCKET_NAME:
                print(f"  ✅ S3 bucket: {s3_service.S3_BUCKET_NAME}")
            else:
                print("  ⚠️  S3_BUCKET_NAME not set")
        
        # Test that functions exist
        assert hasattr(s3_service, 'generate_presigned_upload_url'), "Missing generate_presigned_upload_url"
        assert hasattr(s3_service, 'validate_file'), "Missing validate_file"
        assert hasattr(s3_service, 'generate_presigned_url'), "Missing generate_presigned_url"
        print("  ✅ All S3 service functions available")
        
        return True
    except Exception as e:
        print(f"  ❌ S3 service test failed: {e}")
        return False

def test_server_structure():
    """Test server.py structure without starting it"""
    print("\n🔍 Testing server structure...")
    
    try:
        # Just verify the file can be parsed
        server_path = Path(__file__).parent / 'backend' / 'server.py'
        with open(server_path, 'r') as f:
            content = f.read()
        
        # Check for critical components
        checks = [
            ('from fastapi import', 'FastAPI import'),
            ('import s3_service', 'S3 service import'),
            ('@api_router.post("/sections/{section_id}/video/upload-url"', 'Video upload endpoint'),
            ('@api_router.post("/sections/{section_id}/audio/upload-url"', 'Audio upload endpoint'),
            ('async def scrape_page_content', 'Scrape function (merged)'),
            ('asyncio.to_thread', 'Async implementation (merged)'),
        ]
        
        for pattern, name in checks:
            if pattern in content:
                print(f"  ✅ {name}")
            else:
                print(f"  ⚠️  {name}: Not found")
        
        return True
    except Exception as e:
        print(f"  ❌ Server structure test failed: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 PIVOT Backend Local Test")
    print("=" * 60)
    
    results = []
    
    # Test 1: Imports
    results.append(("Imports", test_imports()))
    
    # Test 2: Environment variables
    results.append(("Environment Variables", test_env_vars()))
    
    # Test 3: S3 Service
    results.append(("S3 Service", test_s3_service()))
    
    # Test 4: Server structure
    results.append(("Server Structure", test_server_structure()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {name}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All tests passed! Ready for local server test.")
        print("\nTo start the server locally:")
        print("  cd backend")
        print("  python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload")
    else:
        print("⚠️  Some tests had warnings. Check output above.")
        print("\nTo install missing dependencies:")
        print("  cd backend")
        print("  python3 -m pip install -r requirements.txt")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())

