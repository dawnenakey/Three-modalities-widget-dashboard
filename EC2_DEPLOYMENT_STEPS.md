# EC2 Deployment Steps

You're now on EC2. Follow these steps in order:

## Step 1: Navigate to Deployment Directory

```bash
cd ~/pivot-deploy
ls -la  # Verify files are there
```

## Step 2: Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

## Step 3: Run Deployment Script

```bash
./deploy.sh
```

This script will:
- Check and install Python 3 (if needed)
- Check and install Node.js (if needed)
- Install Python dependencies from `backend/requirements.txt`
- Install Node dependencies in `frontend/`
- Build the frontend

**Note**: This may take 5-10 minutes depending on your instance.

## Step 4: Create .env File

**IMPORTANT**: You need to create the `.env` file with your credentials.

### Option A: Copy from your Mac (Easiest)

**From your Mac Terminal** (open a new terminal window):
```bash
scp -i ~/.ssh/ec2-pivot-key backend/.env ubuntu@13.222.11.150:~/pivot-deploy/backend/.env
```

### Option B: Create Manually on EC2

**On EC2**, create the file:
```bash
cd ~/pivot-deploy/backend
nano .env
```

Paste your environment variables (same as your local `.env`):
```env
# MongoDB
MONGO_URL=your_mongodb_connection_string
DB_NAME=pivot_accessibility

# JWT
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=pivot-s3-bucket
PRESIGNED_URL_EXPIRATION=600

# OpenAI
OPENAI_API_KEY=your_openai_key

# CORS (IMPORTANT: Include your EC2 IP)
CORS_ORIGINS=http://13.222.11.150:3000,http://13.222.11.150:8001,https://testing.gopivot.me
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Verify .env File

```bash
cd ~/pivot-deploy/backend
cat .env  # Should show your environment variables
```

## Step 6: Start the Services

### Option A: Using PM2 (Recommended - Keeps services running)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd ~/pivot-deploy/backend
pm2 start "python3 -m uvicorn server:app --host 0.0.0.0 --port 8001" --name pivot-backend

# Start frontend
cd ~/pivot-deploy/frontend
pm2 start "npm start" --name pivot-frontend

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions it prints (usually involves running a sudo command)
```

### Option B: Manual Start (For Testing)

```bash
# Start backend (in one terminal)
cd ~/pivot-deploy/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001

# Start frontend (in another terminal or use screen/tmux)
cd ~/pivot-deploy/frontend
npm start
```

## Step 7: Test the Deployment

### Test Backend
```bash
# On EC2
curl http://localhost:8001/api/

# From your Mac
curl http://13.222.11.150:8001/api/
```

### Test Frontend
Open in browser: `http://13.222.11.150:3000`

## Step 8: Check Security Group

Make sure your EC2 Security Group allows:
- **Port 8001** (Backend) - Inbound from `0.0.0.0/0` or your IP
- **Port 3000** (Frontend) - Inbound from `0.0.0.0/0` or your IP
- **Port 22** (SSH) - Inbound from your IP

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
sudo lsof -i :8001

# Check logs
pm2 logs pivot-backend
# or if running manually, check the terminal output

# Verify .env file
cat ~/pivot-deploy/backend/.env
```

### Frontend won't start
```bash
# Check if port is in use
sudo lsof -i :3000

# Check logs
pm2 logs pivot-frontend

# Rebuild frontend
cd ~/pivot-deploy/frontend
npm run build
```

### Can't connect from outside
- Check Security Group rules
- Verify services are running: `pm2 list` or `ps aux | grep uvicorn`
- Check if services are bound to `0.0.0.0` (not just `localhost`)

## Next Steps

Once everything is running:
1. Test login at `http://13.222.11.150:3000`
2. Test API at `http://13.222.11.150:8001/docs`
3. Verify S3 uploads work
4. Test AWS Polly and Translate features

