# Start Services on EC2

## Step 1: Copy .env File

### Option A: Copy from Mac (Easiest)

**From your Mac Terminal:**
```bash
scp -i ~/.ssh/ec2-pivot-key backend/.env ubuntu@13.222.11.150:~/pivot-deploy/backend/.env
```

### Option B: Create Manually on EC2

**On EC2:**
```bash
cd ~/pivot-deploy/backend
nano .env
```

Paste your environment variables (same as local):
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

# CORS (IMPORTANT: Include EC2 IP)
CORS_ORIGINS=http://13.222.11.150:3000,http://13.222.11.150:8001,https://testing.gopivot.me
```

Save: `Ctrl+X`, `Y`, `Enter`

## Step 2: Verify .env File

```bash
cd ~/pivot-deploy/backend
cat .env
```

Make sure all required variables are present.

## Step 3: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

## Step 4: Start Backend Service

```bash
cd ~/pivot-deploy/backend
pm2 start "python3 -m uvicorn server:app --host 0.0.0.0 --port 8001" --name pivot-backend
```

## Step 5: Start Frontend Service

```bash
cd ~/pivot-deploy/frontend
pm2 start "npm start" --name pivot-frontend
```

## Step 6: Save PM2 Configuration

```bash
# Save current process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions it prints (usually run a sudo command)
```

## Step 7: Check Services Status

```bash
# List all processes
pm2 list

# View logs
pm2 logs

# View specific service logs
pm2 logs pivot-backend
pm2 logs pivot-frontend
```

## Step 8: Test the Deployment

### Test Backend

**On EC2:**
```bash
curl http://localhost:8001/api/
```

**From your Mac:**
```bash
curl http://13.222.11.150:8001/api/
```

Should return: `{"message":"PIVOT API - Accessibility Platform"}`

### Test Frontend

Open in browser: `http://13.222.11.150:3000`

### Test API Documentation

Open in browser: `http://13.222.11.150:8001/docs`

## PM2 Commands Reference

```bash
# Start a service
pm2 start <name>

# Stop a service
pm2 stop <name>

# Restart a service
pm2 restart <name>

# Delete a service
pm2 delete <name>

# View logs
pm2 logs <name>

# Monitor all services
pm2 monit

# Save current configuration
pm2 save
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs pivot-backend

# Check if port is in use
sudo lsof -i :8001

# Verify .env file
cat ~/pivot-deploy/backend/.env
```

### Frontend won't start
```bash
# Check logs
pm2 logs pivot-frontend

# Check if port is in use
sudo lsof -i :3000

# Rebuild if needed
cd ~/pivot-deploy/frontend
npm run build
```

### Can't access from outside EC2
- Check Security Group allows ports 8001 and 3000
- Verify services are running: `pm2 list`
- Check services are bound to `0.0.0.0` (not `localhost`)

### Services stop after SSH disconnect
- Make sure you ran `pm2 save` and `pm2 startup`
- Check PM2 is configured to start on boot

