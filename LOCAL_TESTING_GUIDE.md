# Local Testing Guide

This guide will help you test the merged code locally before deploying to EC2.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python3 -m pip install --user -r requirements.txt
```

Or install just the critical ones:
```bash
python3 -m pip install --user fastapi uvicorn[standard] motor pymongo boto3 pydantic[email] bcrypt PyJWT beautifulsoup4 requests aiofiles python-dotenv starlette
```

### 2. Verify Environment Variables

Make sure `backend/.env` has at minimum:
```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=pivot_accessibility
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Note:** AWS S3 credentials are optional for basic testing, but required for upload functionality.

### 3. Run Tests

```bash
# Test imports and structure
python3 test_local.py

# Test server startup (without running it)
python3 test_server_startup.py
```

### 4. Start the Server

```bash
# Option 1: Use the script
./start_local_test.sh

# Option 2: Manual start
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The server will start on `http://localhost:8001`

### 5. Test Endpoints

Once the server is running:

```bash
# Test root endpoint
curl http://localhost:8001/api/

# View API documentation
open http://localhost:8001/docs
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Server starts without errors
- [ ] Root endpoint responds: `curl http://localhost:8001/api/`
- [ ] API docs accessible: `http://localhost:8001/docs`

### ✅ Authentication (if MongoDB is connected)
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] JWT token is generated

### ✅ S3 Service (if AWS credentials are set)
- [ ] S3 service imports without errors
- [ ] Can generate presigned upload URLs (test endpoint)
- [ ] Upload functionality works

### ✅ Merged Code Verification
- [ ] `scrape_page_content` function uses async (`asyncio.to_thread`)
- [ ] S3 service is used (not R2)
- [ ] All endpoints are accessible

## Troubleshooting

### Missing Dependencies
```bash
cd backend
python3 -m pip install --user -r requirements.txt
```

### MongoDB Connection Issues
- Verify `MONGO_URL` in `.env` is correct
- Check if MongoDB allows connections from your IP
- Test connection: `python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); client = AsyncIOMotorClient(os.getenv('MONGO_URL')); print('Connected!')"`

### AWS S3 Issues
- AWS credentials are optional for basic testing
- Upload endpoints will fail without AWS credentials
- To test uploads, add to `.env`:
  ```env
  AWS_ACCESS_KEY_ID=your_key
  AWS_SECRET_ACCESS_KEY=your_secret
  AWS_REGION=us-east-1
  S3_BUCKET_NAME=your-bucket-name
  ```

### Port Already in Use
```bash
# Find process using port 8001
lsof -i :8001

# Kill it
kill -9 <PID>
```

## What to Test Before EC2 Deployment

1. **Server Starts**: ✅ No import errors, server runs
2. **API Endpoints**: ✅ All routes are accessible
3. **MongoDB Connection**: ✅ Can connect to database
4. **S3 Service**: ✅ Can import and use (if credentials set)
5. **Merged Code**: ✅ Async scrape function works
6. **No Syntax Errors**: ✅ All Python files compile

## Next Steps

Once local testing passes:
1. Review `DEPLOYMENT.md` or `DEPLOY_NOW.md` for deployment steps
2. Set up AWS S3 bucket and credentials
3. Deploy to EC2 using `deploy.sh` or manual steps
4. Follow `AWS_MIGRATION_CHECKLIST.md` for verification

