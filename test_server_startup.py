#!/usr/bin/env python3
"""
Test server startup without actually running it
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

def test_server_import():
    """Test that server can be imported and app is created"""
    print("🔍 Testing server import and app creation...")
    
    try:
        # Load environment first
        from dotenv import load_dotenv
        env_path = Path(__file__).parent / 'backend' / '.env'
        if env_path.exists():
            load_dotenv(env_path)
            print("  ✅ .env loaded")
        else:
            print("  ⚠️  .env not found (may cause errors)")
        
        # Try to import server
        import server
        print("  ✅ Server module imported")
        
        # Check app exists
        if hasattr(server, 'app'):
            print("  ✅ FastAPI app created")
        else:
            print("  ❌ FastAPI app not found")
            return False
        
        # Check router exists
        if hasattr(server, 'api_router'):
            print("  ✅ API router created")
        else:
            print("  ⚠️  API router not found")
        
        # Check critical endpoints exist
        routes = [route.path for route in server.app.routes]
        critical_routes = ['/api/', '/api/websites', '/api/sections']
        
        print("\n  📋 Available routes (sample):")
        for route in routes[:10]:
            print(f"     - {route}")
        
        found_critical = []
        for route in routes:
            for critical in critical_routes:
                if critical in route:
                    found_critical.append(critical)
        
        if found_critical:
            print(f"\n  ✅ Found critical routes: {', '.join(set(found_critical))}")
        
        # Check S3 service integration
        if 's3_service' in str(server.__dict__):
            print("  ✅ S3 service integrated")
        
        print("\n✅ Server structure is valid and ready to start!")
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 Server Startup Test")
    print("=" * 60)
    print()
    
    success = test_server_import()
    
    print()
    print("=" * 60)
    if success:
        print("✅ Server is ready to start!")
        print("\nTo start the server:")
        print("  cd backend")
        print("  python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload")
        print("\nOr use the script:")
        print("  ./start_local_test.sh")
    else:
        print("❌ Server has issues. Check errors above.")
    print("=" * 60)
    
    sys.exit(0 if success else 1)

