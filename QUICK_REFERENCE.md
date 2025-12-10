# Quick Reference Guide

## 🌐 URLs

### Local Development
- **Backend API**: http://localhost:8001
- **Backend API Docs**: http://localhost:8001/docs
- **Frontend**: http://localhost:3000 (when running)

### MongoDB Atlas
- **Dashboard**: https://cloud.mongodb.com/
- **Your Cluster**: cluster0.dt2i9ox.mongodb.net
- **Database**: pivot_accessibility

### AWS Services
- **AWS Console**: https://console.aws.amazon.com/
- **S3 Bucket**: pivot-s3-bucket
- **Region**: us-east-1

## 🔧 Starting Services

### Backend Server
```bash
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
# Create .env.local if needed
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env.local
npm install  # if first time
npm start
```

## 📝 MongoDB Atlas Checklist

1. **Login**: https://cloud.mongodb.com/
2. **Select Cluster**: cluster0
3. **Check Network Access**:
   - Go to "Network Access" in left sidebar
   - Add your IP or `0.0.0.0/0` for testing
4. **Check Database Users**:
   - Go to "Database Access"
   - Verify `dawnena_db_user` exists
   - Check password matches
5. **Get Connection String**:
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:8001/api/
```

### Test Frontend
Open: http://localhost:3000

### Test MongoDB Connection
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
        client = AsyncIOMotorClient(os.getenv('MONGO_URL'), serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print('✅ MongoDB connected!')
        client.close()
    except Exception as e:
        print(f'❌ Error: {e}')

asyncio.run(test())
"
```

## 🔑 Environment Variables

### Backend (.env in backend/)
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name (pivot_accessibility)
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `S3_BUCKET_NAME` - S3 bucket name
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET_KEY` - JWT secret

### Frontend (.env.local in frontend/)
- `REACT_APP_BACKEND_URL` - Backend API URL (http://localhost:8001)

## 🐛 Common Issues

### MongoDB Connection Failed
- Check password in connection string
- Verify IP is whitelisted in MongoDB Atlas
- Get fresh connection string from Atlas

### Frontend Can't Connect to Backend
- Check `REACT_APP_BACKEND_URL` in frontend/.env.local
- Verify backend is running on port 8001
- Check CORS settings in backend

### 500 Internal Server Error
- Check server logs
- Verify all environment variables are set
- Test MongoDB connection separately

