# Test Locally First - Step by Step

**Yes, we absolutely should test locally before deploying to EC2!** This guide will help you test everything locally first.

## Why Test Locally?

1. ✅ Catch errors before deploying
2. ✅ Verify AWS S3 integration works
3. ✅ Test all endpoints
4. ✅ Save time and avoid EC2 troubleshooting
5. ✅ Verify merged code works correctly

## Step 1: Verify Dependencies

```bash
cd backend
python3 -m pip install --user -r requirements.txt
```

Or install critical ones:
```bash
python3 -m pip install --user fastapi uvicorn[standard] motor pymongo boto3 pydantic[email] bcrypt PyJWT beautifulsoup4 requests aiofiles python-dotenv starlette email-validator
```

## Step 2: Verify Environment Variables

Check that `backend/.env` has all required variables:

```bash
cd backend
python3 -c "from dotenv import load_dotenv; from pathlib import Path; import os; load_dotenv(Path('.env')); print('MONGO_URL:', '✅' if os.getenv('MONGO_URL') else '❌'); print('AWS_ACCESS_KEY_ID:', '✅' if os.getenv('AWS_ACCESS_KEY_ID') else '❌'); print('S3_BUCKET_NAME:', os.getenv('S3_BUCKET_NAME', '❌ NOT SET'))"
```

**Required for local testing:**
- ✅ `MONGO_URL` - MongoDB connection
- ✅ `DB_NAME` - Database name
- ✅ `JWT_SECRET_KEY` - For authentication
- ✅ `AWS_ACCESS_KEY_ID` - For S3 uploads
- ✅ `AWS_SECRET_ACCESS_KEY` - For S3 uploads
- ✅ `S3_BUCKET_NAME` - Your S3 bucket name
- ✅ `AWS_REGION` - AWS region (e.g., us-east-1)

## Step 3: Test Server Structure

```bash
# From project root
python3 test_server_startup.py
```

This verifies:
- ✅ All imports work
- ✅ Server structure is correct
- ✅ Routes are configured
- ✅ S3 service integrated

## Step 4: Start the Server Locally

```bash
# Option 1: Use the convenience script
./start_local_test.sh

# Option 2: Manual start
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The server will start on `http://localhost:8001`

## Step 5: Test Basic Endpoints

### Test Root Endpoint
```bash
curl http://localhost:8001/api/
# Should return: {"message":"PIVOT API - Accessibility Platform"}
```

### View API Documentation
Open in browser: `http://localhost:8001/docs`

This gives you an interactive API explorer where you can test all endpoints!

## Step 6: Test Authentication (if MongoDB connected)

### Register a User
```bash
curl -X POST http://localhost:8001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "testpassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

Save the `access_token` from the response for authenticated requests.

## Step 7: Test S3 Upload Functionality

### Test S3 Service Import
```bash
cd backend
python3 -c "import s3_service; print('✅ S3 service OK'); print('Bucket:', s3_service.S3_BUCKET_NAME if s3_service.S3_BUCKET_NAME else 'NOT SET')"
```

### Test Presigned URL Generation (if you have a section ID)
```bash
# First, get your auth token from login
TOKEN="your_access_token_here"
SECTION_ID="your_section_id_here"

# Request upload URL
curl -X POST http://localhost:8001/api/sections/$SECTION_ID/video/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-video.mp4",
    "content_type": "video/mp4",
    "file_size": 1000000
  }'
```

This should return a presigned URL if S3 is configured correctly.

## Step 8: Test Frontend (Optional)

If you want to test the full stack:

```bash
cd frontend

# Install dependencies
npm install

# Set backend URL
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env.local

# Start frontend
npm start
```

Frontend will start on `http://localhost:3000`

## What to Verify

### ✅ Server Starts
- No import errors
- Server runs on port 8001
- API responds to requests

### ✅ MongoDB Connection
- Can register users
- Can login
- Database operations work

### ✅ AWS S3 Integration
- S3 service imports without errors
- Can generate presigned URLs
- Upload endpoints respond correctly

### ✅ Merged Code
- Server uses `s3_service` (not `r2_client`)
- Async scrape function works
- All routes accessible

## Troubleshooting Local Testing

### Server Won't Start
```bash
# Check for missing dependencies
python3 -c "import fastapi, motor, boto3" 2>&1

# Install missing ones
python3 -m pip install --user <missing-package>
```

### MongoDB Connection Fails
- Verify `MONGO_URL` in `.env` is correct
- Check MongoDB allows connections from your IP
- Test connection: `python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); client = AsyncIOMotorClient(os.getenv('MONGO_URL')); print('Connected!')"`

### S3 Upload Fails
- Verify AWS credentials in `.env`
- Check S3 bucket name matches
- Verify bucket CORS allows `http://localhost:3000`
- Test S3 connection: `python3 -c "import s3_service; print('S3 OK')"`

### Port Already in Use
```bash
# Find process using port 8001
lsof -i :8001

# Kill it
kill -9 <PID>
```

## Next Steps After Local Testing

Once everything works locally:

1. ✅ All endpoints tested
2. ✅ Authentication works
3. ✅ S3 uploads work
4. ✅ No errors in logs

**Then** proceed to EC2 deployment using `DEPLOY_NOW.md`

## Quick Test Checklist

- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] Root endpoint responds
- [ ] API docs accessible (`/docs`)
- [ ] Can register/login (if MongoDB connected)
- [ ] S3 service imports correctly
- [ ] Upload endpoints respond (if authenticated)

## Summary

**Always test locally first!** It's faster, easier to debug, and catches issues before deployment. Once everything works locally, deploying to EC2 is just a matter of copying files and starting the server.

