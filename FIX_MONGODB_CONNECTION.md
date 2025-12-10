# Fix MongoDB Connection Error

## Problem
The login endpoint returns **500 Internal Server Error** because MongoDB connection is failing.

## Root Cause
The `MONGO_URL` in `backend/.env` appears to be a placeholder value instead of your actual MongoDB connection string.

## Solution

### Step 1: Update backend/.env

Edit `backend/.env` and make sure `MONGO_URL` has your actual MongoDB connection string:

```env
# Replace this placeholder:
MONGO_URL=your_mongo_url

# With your actual MongoDB connection string:
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

**Or if using a standard MongoDB connection:**
```env
MONGO_URL=mongodb://username:password@host:port/
```

### Step 2: Verify Other Required Variables

Also make sure these are set correctly:
```env
DB_NAME=pivot_accessibility
JWT_SECRET_KEY=your-secret-key-min-32-characters
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Step 3: Restart the Server

After updating `.env`, restart the server:

```bash
# Find and kill the current server
lsof -ti:8001 | xargs kill -9

# Start it again
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Step 4: Test Connection

Test the MongoDB connection:
```bash
cd backend
python3 -c "
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import asyncio

load_dotenv(Path('.env'))

async def test():
    try:
        client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        await client.admin.command('ping')
        print('✅ MongoDB connection successful!')
        client.close()
    except Exception as e:
        print(f'❌ Error: {e}')

asyncio.run(test())
"
```

### Step 5: Test Login Again

Once MongoDB is connected:
1. Open `http://localhost:8001/docs`
2. Try the `/api/auth/login` endpoint again
3. It should work now!

## Common MongoDB Connection String Formats

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```

### Local MongoDB
```
mongodb://localhost:27017/
```

### MongoDB with Database Name
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?appName=Cluster0
```

## Troubleshooting

### Still Getting 500 Error?
1. Check MongoDB connection string is correct
2. Verify MongoDB allows connections from your IP (if using Atlas)
3. Check if MongoDB service is running (if local)
4. Verify username/password are correct
5. Check server logs for detailed error messages

### Connection Timeout?
- If using MongoDB Atlas, check IP whitelist
- Verify network connectivity
- Check firewall settings

### Authentication Failed?
- Verify username and password in connection string
- Check database user permissions
- Ensure user has access to the specified database

