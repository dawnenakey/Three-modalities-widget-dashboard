# How to Use Your Access Token

## After Successful Login

When you login, you receive a response like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { ... }
}
```

## Method 1: Using API Documentation (Easiest!)

### Step-by-Step:
1. **Open**: http://localhost:8001/docs
2. **Find the "Authorize" button** at the top right (🔒 icon)
3. **Click "Authorize"**
4. **In the popup**:
   - Leave "Value" field empty initially
   - Click "Authorize" to see the format
5. **Enter your token**:
   - Format: `Bearer YOUR_ACCESS_TOKEN`
   - Or just paste: `YOUR_ACCESS_TOKEN` (the "Bearer" prefix is added automatically)
6. **Click "Authorize"**
7. **Click "Close"**

Now all endpoints will automatically use your token! ✅

### Visual Guide:
```
┌─────────────────────────────────┐
│  FastAPI - Swagger UI    [🔒]  │  ← Click the lock icon
└─────────────────────────────────┘

After clicking:
┌─────────────────────────────────┐
│  Available authorizations       │
│  ┌───────────────────────────┐ │
│  │ httpBearer (http, Bearer)  │ │
│  │ Value: [paste token here]  │ │
│  │ [Authorize] [Close]        │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## Method 2: Using curl Commands

### Format:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8001/api/endpoint
```

### Example:
```bash
# Save token to variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/websites
```

### Get Token from Login Response:
```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

# Now use it
curl -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/websites
```

## Method 3: Using Postman or Insomnia

1. **Create a new request**
2. **Go to "Authorization" tab**
3. **Select**: "Bearer Token"
4. **Paste**: Your access token
5. **Send request**

## Method 4: Using JavaScript/Frontend

```javascript
const token = "your-access-token";

fetch('http://localhost:8001/api/websites', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Testing Your Token

### Quick Test:
```bash
# Test if token works
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8001/api/auth/me
```

**Expected Response**: Your user information

### If Token Expired:
- Tokens expire after 24 hours (default)
- Just login again to get a new token

## Common Issues

### "Unauthorized" Error
- Token might be expired → Login again
- Token format wrong → Use `Bearer YOUR_TOKEN`
- Missing "Bearer" prefix → Add it

### "Invalid token" Error
- Token copied incorrectly → Copy full token
- Token expired → Login again

## Quick Reference

**Token Format**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Where to put it**:
- ✅ API Docs: Click "Authorize" button → Paste token
- ✅ curl: `-H "Authorization: Bearer TOKEN"`
- ✅ Frontend: `headers: { 'Authorization': 'Bearer TOKEN' }`

## Next Steps

Once authorized in the API docs:
1. ✅ Try `/api/websites` - List your websites
2. ✅ Try `/api/sections/{id}/translations/generate` - Translate text
3. ✅ Try `/api/sections/{id}/audio/generate-translated` - Translate + Audio

All endpoints will now work with your authentication! 🎉

