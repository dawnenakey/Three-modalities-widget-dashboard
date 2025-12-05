# Complete Setup Guide for testing.gopivot.me
## Starting from Scratch

This guide will walk you through setting up your PIVOT application on testing.gopivot.me with no existing infrastructure.

---

## Phase 1: Server Setup

### Option A: AWS EC2 (Recommended)

1. **Launch an EC2 Instance:**
   - Go to AWS Console → EC2 → Launch Instance
   - Choose: **Ubuntu Server 22.04 LTS**
   - Instance type: **t3.medium** (2 vCPU, 4GB RAM) minimum
   - Storage: **20GB** minimum (30GB recommended)
   - Create or select a key pair (download the .pem file!)

2. **Configure Security Group:**

   Add these inbound rules:
   - **SSH (22)** - Source: Your IP only (for security)
   - **HTTP (80)** - Source: 0.0.0.0/0 (anywhere)
   - **HTTPS (443)** - Source: 0.0.0.0/0 (anywhere)

3. **Launch the instance and note the Public IP address**

### Option B: DigitalOcean Droplet

1. **Create a Droplet:**
   - Choose: **Ubuntu 22.04 LTS**
   - Plan: **Basic - $12/month** (2GB RAM, 1 vCPU) minimum
   - Add SSH key or use password authentication
   - Choose a datacenter region close to your users
   - Create Droplet

2. **Note the IP address** from the droplet dashboard

### Option C: Other Cloud Providers

Similar steps for:
- Google Cloud Platform (Compute Engine)
- Linode
- Vultr
- Azure

**Minimum requirements:**
- 2GB RAM
- 2 vCPU
- 20GB storage
- Ubuntu 22.04 LTS

---

## Phase 2: Domain Configuration

### Set Up DNS for testing.gopivot.me

1. **Go to your domain registrar** (where you bought gopivot.me)
   - GoDaddy, Namecheap, Route53, Cloudflare, etc.

2. **Add an A Record:**
   ```
   Type: A
   Name: testing
   Value: [Your Server IP Address]
   TTL: 300 (or default)
   ```

3. **Wait for DNS propagation** (usually 5-30 minutes)

4. **Test DNS resolution:**
   ```bash
   # On your local machine
   nslookup testing.gopivot.me
   # Should return your server IP
   ```

---

## Phase 3: Initial Server Access

### Connect to Your Server

**For AWS/DigitalOcean/Cloud:**

```bash
# Make your key file secure (if using .pem file)
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@testing.gopivot.me
# OR if using password:
ssh root@testing.gopivot.me
```

**First time setup on server:**

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Create a user if you're logged in as root
sudo adduser ubuntu
sudo usermod -aG sudo ubuntu

# Switch to the new user
su - ubuntu
```

---

## Phase 4: Deploy the Application

### Method 1: Automated Deployment (Easiest)

**On your local machine:**

```bash
# Navigate to your project
cd /path/to/Three-modalities-widget-dashboard

# Make sure you have the latest changes
git pull origin claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL

# Deploy to server
DEPLOY_MODE=local \
SERVER_USER=ubuntu \
SERVER_HOST=testing.gopivot.me \
./deploy-to-testing.sh
```

**Then SSH into the server:**

```bash
ssh ubuntu@testing.gopivot.me

# Run the server setup
cd /var/www/pivot
DEPLOY_MODE=server ./deploy-to-testing.sh
```

### Method 2: Manual Deployment

**On your local machine:**

```bash
# Clone the repository to get the code locally if you don't have it
git clone https://github.com/dawnenakey/Three-modalities-widget-dashboard.git
cd Three-modalities-widget-dashboard
git checkout claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL

# Sync files to server
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'venv' \
  -e "ssh -i your-key.pem" \
  ./ ubuntu@testing.gopivot.me:/var/www/pivot/
```

**On the server:**

```bash
ssh ubuntu@testing.gopivot.me

# Install system dependencies
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Set up Python environment
cd /var/www/pivot
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Build frontend
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Create upload directories
mkdir -p backend/uploads/{videos,audio}
chmod -R 755 backend/uploads
```

---

## Phase 5: Configure Environment Variables

**On the server:**

```bash
cd /var/www/pivot/backend
nano .env
```

**Paste this template and fill in your actual values:**

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=pivot_widget

# JWT Configuration (generate a secure random key)
JWT_SECRET_KEY=paste-output-from-openssl-rand-hex-32-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS Configuration
CORS_ORIGINS=https://testing.gopivot.me,https://*.cloudfront.net

# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Backend URL (for reference)
REACT_APP_BACKEND_URL=https://testing.gopivot.me/api
```

**Generate a secure JWT secret:**

```bash
# On the server, run this to generate a secure key:
openssl rand -hex 32
# Copy the output and paste it as JWT_SECRET_KEY
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Phase 6: Set Up Backend Service

**On the server:**

```bash
# Create systemd service file
sudo nano /etc/systemd/system/pivot-backend.service
```

**Paste this:**

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

**Start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable pivot-backend
sudo systemctl start pivot-backend
sudo systemctl status pivot-backend
```

You should see "active (running)" in green.

---

## Phase 7: Configure Nginx

**On the server:**

```bash
sudo nano /etc/nginx/sites-available/testing.gopivot.me
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name testing.gopivot.me;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve React build files
    location / {
        root /var/www/pivot/frontend/build;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for large file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Static files (uploads, videos, audio)
    location /api/uploads/ {
        alias /var/www/pivot/backend/uploads/;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        expires 1y;
        add_header Cache-Control "public";
    }

    # Widget JavaScript file
    location /api/widget.js {
        alias /var/www/pivot/backend/static/widget.js;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Content-Type "application/javascript";
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Other static files
    location /api/static/ {
        alias /var/www/pivot/backend/static/;
        add_header Access-Control-Allow-Origin *;
        expires 1d;
        add_header Cache-Control "public";
    }

    # File upload size limit
    client_max_body_size 100M;
}
```

**Enable the site:**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/testing.gopivot.me /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Phase 8: Set Up SSL Certificate (CRITICAL!)

**On the server:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (this will automatically configure Nginx)
sudo certbot --nginx -d testing.gopivot.me

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to terms of service
# 3. Choose whether to redirect HTTP to HTTPS (choose YES)
```

**Set up auto-renewal:**

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically adds a cron job, but verify:
sudo systemctl status certbot.timer
```

---

## Phase 9: Testing Your Deployment

### Test 1: Backend API

```bash
# On the server or your local machine:
curl https://testing.gopivot.me/api/
```

**Expected output:**
```json
{"message":"PIVOT API - Accessibility Platform"}
```

### Test 2: Frontend

Open your browser and go to:
```
https://testing.gopivot.me
```

You should see the PIVOT login page!

### Test 3: API Documentation

```
https://testing.gopivot.me/api/docs
```

You should see the FastAPI automatic documentation.

### Test 4: Widget

1. Log into the dashboard: `https://testing.gopivot.me`
2. Create a website
3. Create a page
4. Upload a video or audio
5. Copy the widget embed code
6. Test it on a sample HTML page

---

## Phase 10: Create Initial Admin User

**On the server:**

```bash
cd /var/www/pivot/backend

# Activate virtual environment
source ../venv/bin/activate

# Create admin user using Python
python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import bcrypt
import uuid
from datetime import datetime, timezone

load_dotenv()

async def create_admin():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    # Check if admin already exists
    existing = await db.users.find_one({"email": "admin@gopivot.me"})
    if existing:
        print("Admin user already exists!")
        return

    # Create admin user
    password = "ChangeThisPassword123!"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@gopivot.me",
        "name": "Admin User",
        "password": hashed.decode('utf-8'),
        "created_at": datetime.now(timezone.utc),
        "is_admin": True
    }

    await db.users.insert_one(admin_user)
    print(f"Admin user created!")
    print(f"Email: admin@gopivot.me")
    print(f"Password: {password}")
    print("IMPORTANT: Change this password after first login!")

asyncio.run(create_admin())
EOF
```

---

## Troubleshooting Common Issues

### Issue: Backend not starting

**Check logs:**
```bash
sudo journalctl -u pivot-backend -n 50
```

**Common causes:**
- Missing environment variables in `.env`
- MongoDB connection issues
- Python package installation issues

**Fix:**
```bash
# Restart the backend
sudo systemctl restart pivot-backend

# Check status
sudo systemctl status pivot-backend
```

### Issue: Nginx shows 502 Bad Gateway

**This means Nginx can't connect to the backend.**

```bash
# Check if backend is running
sudo systemctl status pivot-backend

# Check what's listening on port 8001
sudo lsof -i :8001

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Frontend shows blank page

**Check browser console for errors.**

```bash
# Verify frontend build exists
ls -la /var/www/pivot/frontend/build

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Issue: Can't connect to MongoDB

**Check your MongoDB Atlas settings:**
- Whitelist your server IP in MongoDB Atlas Network Access
- Verify connection string is correct
- Test connection:

```bash
cd /var/www/pivot/backend
source ../venv/bin/activate
python3 -c "from motor.motor_asyncio import AsyncIOMotorClient; import os; from dotenv import load_dotenv; load_dotenv(); print('Testing connection...'); client = AsyncIOMotorClient(os.environ['MONGO_URL']); print('Connected!' if client else 'Failed')"
```

### Issue: SSL certificate won't install

**Make sure:**
- DNS is properly configured (test with `nslookup testing.gopivot.me`)
- Port 80 is open in your firewall
- Nginx is running

### Issue: File uploads fail

**Check permissions:**
```bash
sudo chown -R ubuntu:ubuntu /var/www/pivot/backend/uploads
chmod -R 755 /var/www/pivot/backend/uploads
```

---

## Monitoring and Maintenance

### View Logs

```bash
# Backend logs
sudo journalctl -u pivot-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart pivot-backend

# Restart Nginx
sudo systemctl restart nginx
```

### Update Application

```bash
cd /var/www/pivot

# Pull latest changes
git pull origin claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL

# Update Python dependencies
source venv/bin/activate
cd backend
pip install -r requirements.txt
cd ..

# Rebuild frontend
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Restart services
sudo systemctl restart pivot-backend
sudo systemctl reload nginx
```

---

## Security Checklist

- [ ] SSL certificate installed and working
- [ ] SSH key authentication enabled (disable password auth)
- [ ] Firewall configured (only ports 22, 80, 443)
- [ ] Strong JWT secret key generated
- [ ] MongoDB connection secured with authentication
- [ ] Admin password changed from default
- [ ] Regular backups configured
- [ ] Fail2ban installed for SSH protection
- [ ] Server automatically updating security patches

### Optional Security Improvements

```bash
# Install fail2ban (protects against brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## What to Tell Stakeholders

Your application is now live at:

**Dashboard:** https://testing.gopivot.me

**Widget Embed Code:**
```html
<script src="https://testing.gopivot.me/api/widget.js"
        data-website-id="YOUR_WEBSITE_ID"></script>
```

**Features Available:**
- Multi-language video content (ASL, etc.)
- Multi-language audio narration
- Text content with captions
- Easy widget integration
- Mobile responsive
- Secure and scalable

---

## Next Steps After Deployment

1. **Create demo content:**
   - Log into dashboard
   - Create a sample website
   - Upload demo videos/audio
   - Test the widget

2. **Test with stakeholders:**
   - Share the dashboard URL
   - Provide login credentials
   - Walk through widget installation

3. **Monitor performance:**
   - Check server resources
   - Monitor error logs
   - Track user feedback

4. **Plan for production:**
   - Determine if you need a separate production domain
   - Plan scaling strategy
   - Set up monitoring and alerts

---

**Congratulations!** 🎉

Your PIVOT application is now live and ready for testing!

If you run into any issues, refer to the troubleshooting section above or check the logs for specific error messages.
