# Manual Deployment Steps

Since SSH works for you, follow these steps:

## Step 1: Deploy Files to EC2

**On your Mac Terminal**, run:

```bash
cd /Users/dawnenakey/Three-modalities-widget-dashboard

rsync -avz -e "ssh -i ~/.ssh/ec2-pivot-key" \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'frontend/build' \
  --exclude '*.pyc' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  ./ ubuntu@13.222.11.150:~/pivot-deploy/
```

This will sync all files to EC2 (excluding unnecessary files).

## Step 2: SSH into EC2

```bash
ssh -i ~/.ssh/ec2-pivot-key ubuntu@13.222.11.150
```

## Step 3: Run Deployment Script on EC2

Once on EC2:

```bash
cd ~/pivot-deploy
chmod +x deploy.sh
./deploy.sh
```

This will:
- Install Python 3 and Node.js (if needed)
- Install Python dependencies
- Install Node dependencies
- Build the frontend

## Step 4: Create .env File on EC2

**IMPORTANT**: Copy your local `.env` file to EC2:

**From your Mac:**
```bash
scp -i ~/.ssh/ec2-pivot-key backend/.env ubuntu@13.222.11.150:~/pivot-deploy/backend/.env
```

**OR manually create it on EC2:**
```bash
# On EC2
cd ~/pivot-deploy/backend
nano .env
# Paste your environment variables (same as local)
# Save: Ctrl+X, Y, Enter
```

## Step 5: Update CORS in .env

Make sure your `.env` includes the EC2 IP:

```env
CORS_ORIGINS=http://13.222.11.150:3000,http://13.222.11.150:8001,https://testing.gopivot.me
```

## Step 6: Start the Services

**On EC2**, you can start services manually or use PM2:

### Option A: Manual Start
```bash
# Start backend
cd ~/pivot-deploy/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &

# Start frontend (in another terminal or screen)
cd ~/pivot-deploy/frontend
npm start &
```

### Option B: Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start backend
cd ~/pivot-deploy/backend
pm2 start "python3 -m uvicorn server:app --host 0.0.0.0 --port 8001" --name pivot-backend

# Start frontend
cd ~/pivot-deploy/frontend
pm2 start "npm start" --name pivot-frontend

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

## Step 7: Test Deployment

```bash
# Test backend
curl http://localhost:8001/api/

# Test from your Mac
curl http://13.222.11.150:8001/api/
```

## Step 8: Configure Security Group

Make sure your EC2 security group allows:
- **Port 8001** (Backend API) - inbound
- **Port 3000** (Frontend) - inbound
- **Port 22** (SSH) - inbound

## Troubleshooting

If you get errors:
- Check logs: `pm2 logs` or check the terminal output
- Verify .env file exists: `cat ~/pivot-deploy/backend/.env`
- Check if ports are in use: `sudo lsof -i :8001`

