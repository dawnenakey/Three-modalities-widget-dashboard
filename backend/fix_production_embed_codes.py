#!/usr/bin/env python3
"""
Fix embed codes on PRODUCTION (testing.gopivot.me)
"""

import asyncio
import httpx

BASE_URL = "https://testing.gopivot.me/api"

async def fix_production_embeds():
    """Update all embed codes on production to use correct URL"""
    
    print("🔧 Fixing Production Embed Codes")
    print("=" * 80)
    
    # Login as demo user to get access
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Try demo account
        print("\n🔐 Logging in...")
        login_response = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "demo@pivot.com", "password": "demo123456"}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("✅ Logged in successfully")
        
        # Get all websites
        print("\n📊 Getting all websites...")
        websites_response = await client.get(
            f"{BASE_URL}/websites",
            headers=headers
        )
        
        if websites_response.status_code != 200:
            print(f"❌ Failed to get websites: {websites_response.text}")
            return
        
        websites = websites_response.json()
        print(f"Found {len(websites)} websites")
        
        # Update each website
        updated_count = 0
        for website in websites:
            old_embed = website.get('embed_code', '')
            website_id = website['id']
            website_name = website['name']
            
            # Generate new embed code
            new_embed = f'<script src="https://testing.gopivot.me/api/widget.js" data-website-id="{website_id}"></script>'
            
            if 'emergent' in old_embed.lower() or old_embed != new_embed:
                print(f"\n📝 Updating: {website_name}")
                print(f"   Old: {old_embed[:80]}...")
                print(f"   New: {new_embed}")
                
                # Update website
                update_response = await client.put(
                    f"{BASE_URL}/websites/{website_id}",
                    headers=headers,
                    json={
                        "name": website['name'],
                        "url": website['url'],
                        "embed_code": new_embed
                    }
                )
                
                if update_response.status_code == 200:
                    print(f"   ✅ Updated successfully")
                    updated_count += 1
                else:
                    print(f"   ❌ Failed: {update_response.text}")
            else:
                print(f"\n✅ Already correct: {website_name}")
        
        print("\n" + "=" * 80)
        print(f"✅ Updated {updated_count} website(s)")
        print("=" * 80)

if __name__ == "__main__":
    asyncio.run(fix_production_embeds())
