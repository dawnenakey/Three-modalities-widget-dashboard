# Deploy to Your EC2 Instance

## Your EC2 Details
- **Instance ID**: i-027e3d5d672eb15b8
- **Public IP**: 13.222.11.150
- **Public DNS**: ec2-13-222-11-150.compute-1.amazonaws.com
- **Instance Type**: t3.small
- **Region**: us-east-1
- **State**: Running ✅

## Step 1: Test SSH Connection

First, verify you can connect to your EC2 instance:

```bash
# Try with ec2-user (Amazon Linux)
ssh ec2-user@13.222.11.150

# OR if that doesn't work, try ubuntu (Ubuntu)
ssh ubuntu@13.222.11.150
```

**Note**: You may need to specify your SSH key:
```bash
ssh -i /path/to/your-key.pem ec2-user@13.222.11.150
```

## Step 2: Deploy Files to EC2

Once SSH works, deploy the code:

```bash
# Set your EC2 connection (replace 'ec2-user' if needed)
export EC2_HOST="ec2-user@13.222.11.150"

# If you need to specify SSH key:
export EC2_HOST="ec2-user@13.222.11.150"
export SSH_KEY="/path/to/your-key.pem"

# Make deploy script executable
chmod +x deploy.sh

# Deploy files
EC2_HOST="ec2-user@13.222.11.150" ./deploy.sh
```

**If you need to use SSH key:**
```bash
# Modify the deploy.sh to use -i flag, or use rsync directly:
rsync -avz -e "ssh -i /path/to/your-key.pem" \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'frontend/build' \
  --exclude '*.pyc' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  ./ ec2-user@13.222.11.150:~/pivot-deploy/
```

## Step 3: SSH into EC2 and Complete Setup

```bash
ssh ec2-user@13.222.11.150
cd ~/pivot-deploy
./deploy.sh
```

## Step 4: Create .env File on EC2

**IMPORTANT**: Copy your local `backend/.env` to EC2:

```bash
# From your local machine, copy .env file:
scp backend/.env ec2-user@13.222.11.150:~/pivot-deploy/backend/.env

# OR manually create it on EC2:
ssh ec2-user@13.222.11.150
cd ~/pivot-deploy/backend
nano .env
# Paste your environment variables (same as local)
```

## Step 5: Update CORS Origins

Make sure your `.env` includes the EC2 IP in CORS:

```env
CORS_ORIGINS=http://13.222.11.150:3000,http://13.222.11.150:8001,https://testing.gopivot.me
```

## Step 6: Start the Services

On EC2:

```bash
cd ~/pivot-deploy

# Start backend
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 &

# Start frontend (if serving from EC2)
cd ../frontend
npm start &
```

Or use PM2 for process management:

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
pm2 startup
```

## Step 7: Configure Security Group

Make sure your EC2 security group allows:
- **Port 8001** (Backend API) - inbound from your IP or 0.0.0.0/0
- **Port 3000** (Frontend) - inbound from your IP or 0.0.0.0/0
- **Port 22** (SSH) - inbound from your IP

## Step 8: Test Deployment

```bash
# Test backend
curl http://13.222.11.150:8001/api/

# Test frontend (if running)
curl http://13.222.11.150:3000
```

## Troubleshooting

### SSH Connection Issues
```bash
# Check if instance is accessible
ping 13.222.11.150

# Try with verbose SSH
ssh -v ec2-user@13.222.11.150
```

### Permission Issues
```bash
# Make sure deploy.sh is executable
chmod +x deploy.sh
```

### Port Already in Use
```bash
# Check what's using port 8001
sudo lsof -i :8001

# Kill process if needed
sudo kill -9 <PID>
```

