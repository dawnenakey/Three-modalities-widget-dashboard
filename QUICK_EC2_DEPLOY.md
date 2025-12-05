# Quick EC2 Deployment Guide

Since you already have EC2 set up, here's the fastest path to get testing.gopivot.me working.

## Step 1: Gather Your EC2 Information

You need:
- ✅ **EC2 Public IP Address** (from AWS Console)
- ✅ **Your .pem key file** (used to launch the instance)
- ✅ **Security Groups allow ports:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Step 2: Configure DNS (If Not Done)

1. Go to your domain registrar (Route53, GoDaddy, etc.)
2. Add A record:
   ```
   Name: testing
   Type: A
   Value: [Your EC2 IP]
   TTL: 300
   ```
3. Test: `nslookup testing.gopivot.me` should return your EC2 IP

## Step 3: Connect to EC2 Using VS Code (Easiest Method)

### Install VS Code Remote-SSH:

1. **Install VS Code** from https://code.visualstudio.com/
2. **Install Remote-SSH extension:**
   - Open VS Code
   - Click Extensions icon (left sidebar)
   - Search "Remote - SSH"
   - Install it

3. **Configure SSH:**

   Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux), type "Remote-SSH: Open SSH Configuration File"

   Add this configuration:
   ```
   Host testing-gopivot
       HostName testing.gopivot.me
       User ubuntu
       IdentityFile /path/to/your-key.pem
   ```

   Replace `/path/to/your-key.pem` with actual path to your .pem file

4. **Connect:**
   - Press `Cmd+Shift+P` → "Remote-SSH: Connect to Host"
   - Select "testing-gopivot"
   - VS Code will connect to your server!

### Alternative: Simple Terminal SSH

```bash
# Make key secure
chmod 400 /path/to/your-key.pem

# Connect
ssh -i /path/to/your-key.pem ubuntu@testing.gopivot.me
```

## Step 4: Deploy Application to EC2

### Option A: Automated (Fastest)

**From your local machine:**

```bash
# Navigate to project
cd /path/to/Three-modalities-widget-dashboard

# Make sure you're on the right branch
git status

# Deploy to EC2
DEPLOY_MODE=local \
SERVER_USER=ubuntu \
SERVER_HOST=testing.gopivot.me \
./deploy-to-testing.sh
```

**Then SSH to EC2 and run:**

```bash
ssh -i your-key.pem ubuntu@testing.gopivot.me

cd /var/www/pivot
DEPLOY_MODE=server ./deploy-to-testing.sh
```

### Option B: Manual (If Automated Fails)

**1. Push code to EC2:**

```bash
# From your local machine
cd /path/to/Three-modalities-widget-dashboard

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'venv' \
  --exclude 'frontend/build' \
  -e "ssh -i /path/to/your-key.pem" \
  ./ ubuntu@testing.gopivot.me:/home/ubuntu/pivot-app/
```

**2. SSH to EC2:**

```bash
ssh -i /path/to/your-key.pem ubuntu@testing.gopivot.me
```

**3. Install system dependencies:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
  python3 \
  python3-pip \
  python3-venv \
  nginx \
  certbot \
  python3-certbot-nginx \
  git

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**4. Set up application directory:**

```bash
# Move to proper location
sudo mkdir -p /var/www/pivot
sudo chown ubuntu:ubuntu /var/www/pivot
cp -r /home/ubuntu/pivot-app/* /var/www/pivot/
cd /var/www/pivot
```

**5. Set up Python environment:**

```bash
cd /var/www/pivot

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

**6. Build frontend:**

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

cd ..
```

**7. Create directories:**

```bash
mkdir -p backend/uploads/videos
mkdir -p backend/uploads/audio
chmod -R 755 backend/uploads
```

**8. Configure environment variables:**

```bash
cd /var/www/pivot/backend
nano .env
```

Paste this and **FILL IN YOUR REAL VALUES:**

```env
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
DB_NAME=pivot_widget
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://testing.gopivot.me,https://*.cloudfront.net
OPENAI_API_KEY=sk-YOUR_ACTUAL_OPENAI_KEY
REACT_APP_BACKEND_URL=https://testing.gopivot.me/api
```

**Generate JWT Secret:**
```bash
openssl rand -hex 32
# Copy output and paste as JWT_SECRET_KEY
```

Save: `Ctrl+X`, `Y`, `Enter`

**9. Set up backend service:**

```bash
sudo nano /etc/systemd/system/pivot-backend.service
```

Paste:

```ini
[Unit]
Description=PIVOT Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/pivot/backend
Environment="PATH=/var/www/pivot/venv/bin"
ExecStart=/var/www/pivot/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pivot-backend
sudo systemctl start pivot-backend
sudo systemctl status pivot-backend
```

You should see "active (running)" in green!

**10. Configure Nginx:**

```bash
sudo nano /etc/nginx/sites-available/testing.gopivot.me
```

Paste the configuration from COMPLETE_SETUP_GUIDE.md (the Nginx section)

Enable site:

```bash
sudo ln -sf /etc/nginx/sites-available/testing.gopivot.me /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**11. Set up SSL:**

```bash
sudo certbot --nginx -d testing.gopivot.me
```

Follow prompts:
- Enter email
- Agree to terms
- Choose: Redirect HTTP to HTTPS

## Step 5: Test Your Deployment

**1. Test backend:**
```bash
curl https://testing.gopivot.me/api/
```

Expected: `{"message":"PIVOT API - Accessibility Platform"}`

**2. Test frontend:**

Open browser: `https://testing.gopivot.me`

Should see login page!

**3. Check logs if issues:**
```bash
# Backend logs
sudo journalctl -u pivot-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Common Issues & Fixes

### Issue: "Connection refused" when testing backend

**Problem:** Backend service not running

**Fix:**
```bash
sudo systemctl status pivot-backend
sudo journalctl -u pivot-backend -n 50
```

Check the logs for specific error. Usually:
- Missing .env file
- Wrong MongoDB connection string
- Python package issue

### Issue: 502 Bad Gateway

**Problem:** Nginx can't reach backend

**Fix:**
```bash
# Check if backend is running on port 8001
sudo lsof -i :8001

# If nothing, backend isn't running
sudo systemctl restart pivot-backend
```

### Issue: Frontend blank page

**Problem:** Frontend not built or Nginx misconfigured

**Fix:**
```bash
# Check build exists
ls -la /var/www/pivot/frontend/build

# If empty, rebuild
cd /var/www/pivot/frontend
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: Can't upload files

**Problem:** Permissions

**Fix:**
```bash
sudo chown -R ubuntu:ubuntu /var/www/pivot/backend/uploads
chmod -R 755 /var/www/pivot/backend/uploads
```

### Issue: MongoDB connection error

**Problem:** MongoDB not accessible

**Fix:**
1. Check MongoDB Atlas Network Access - whitelist your EC2 IP
2. Verify connection string is correct
3. Test connection:

```bash
cd /var/www/pivot/backend
source ../venv/bin/activate
python3 << 'EOF'
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

load_dotenv()

async def test():
    try:
        client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        await client.admin.command('ping')
        print("✅ MongoDB connected!")
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test())
EOF
```

## Quick Commands Reference

```bash
# Check all services status
sudo systemctl status pivot-backend
sudo systemctl status nginx

# Restart services
sudo systemctl restart pivot-backend
sudo systemctl restart nginx

# View logs
sudo journalctl -u pivot-backend -f
sudo tail -f /var/log/nginx/error.log

# Test backend locally on server
curl http://localhost:8001/api/

# Check what's running on port 8001
sudo lsof -i :8001

# Check Nginx configuration
sudo nginx -t
```

## After Successful Deployment

1. **Create admin user** - See COMPLETE_SETUP_GUIDE.md Phase 10
2. **Test widget** - Create website, upload content, test embed
3. **Show stakeholders** - Share https://testing.gopivot.me

## Need Help?

If you're stuck at any step:
1. Check the specific error message
2. Look in the logs (commands above)
3. Verify each previous step completed successfully
4. Ask for help with the specific error you're seeing

Remember: Most issues are either:
- Missing environment variables
- MongoDB connection problems
- File permissions
- Services not running

Check these four things first!
