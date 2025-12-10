# Testing Tips - Avoiding "Not Found" Errors

## Common Causes of "Not Found" Errors

1. **Wrong URL path** - Make sure you're using `/api/` prefix
2. **Missing authentication** - Many endpoints require a Bearer token
3. **Wrong HTTP method** - Check if it's GET, POST, PUT, DELETE
4. **Missing path parameters** - Some endpoints need IDs in the URL

## How to Test Properly

### Option 1: Use Interactive API Docs (Easiest!)

1. Open: `http://localhost:8001/docs`
2. This shows all available endpoints
3. Click "Try it out" on any endpoint
4. Fill in parameters and click "Execute"
5. See the response directly

### Option 2: Test with curl

#### Public Endpoints (No Auth):
```bash
# Root endpoint
curl http://localhost:8001/api/

# Register a user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "testpassword123"
  }'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

#### Authenticated Endpoints (Need Token):
```bash
# First, login and save the token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Then use the token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/websites
```

## Available Endpoints

### Authentication (No Auth Required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Websites (Requires Auth)
- `GET /api/websites` - List websites
- `POST /api/websites` - Create website
- `GET /api/websites/{id}` - Get website

### Sections (Requires Auth)
- `GET /api/sections/{id}` - Get section
- `POST /api/sections/{id}/video/upload-url` - Get S3 upload URL
- `POST /api/sections/{id}/audio/upload-url` - Get S3 upload URL

### Other
- `GET /api/stats` - Dashboard stats (requires auth)
- `GET /api/` - Root endpoint (no auth)

## Quick Test Script

```bash
# Test root
echo "Testing root..."
curl http://localhost:8001/api/

# Test register
echo -e "\n\nTesting register..."
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","password":"test123"}'

# Test login
echo -e "\n\nTesting login..."
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Troubleshooting

### "Not Found" Error
- Check the URL is correct (include `/api/` prefix)
- Verify the endpoint exists in `/docs`
- Check if authentication is required

### "Unauthorized" Error
- You need to login first and get a token
- Include `Authorization: Bearer <token>` header

### "Internal Server Error"
- Check server logs
- Verify environment variables are set
- Check MongoDB connection

## Best Practice

**Always use `/docs` first!** It's the easiest way to:
- See all available endpoints
- Understand required parameters
- Test without writing curl commands
- See example requests/responses

