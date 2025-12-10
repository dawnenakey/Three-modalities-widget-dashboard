# EC2 Deployment Guide

This guide will help you deploy the PIVOT application to EC2 for testing.

## Prerequisites

- EC2 instance running (Ubuntu/Amazon Linux)
- SSH access to EC2
- MongoDB connection string
- OpenAI API key
- Domain name (optional, for production)

## Quick Deployment (From Your Mac)

### Option 1: Using the Deployment Script

1. **Set your EC2 connection details:**
   ```bash
   export EC2_HOST="ec2-user@your-ec2-ip-or-domain"
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   EC2_HOST="ec2-user@your-ec2-ip" ./deploy.sh
   ```

3. **SSH into EC2 and complete setup:**
   ```bash
   ssh ec2-user@your-ec2-ip
   cd ~/pivot-deploy
   ./deploy.sh
   ```

### Option 2: Manual Deployment

#### Step 1: Transfer Files to EC2

From your Mac terminal:

```bash
# Create deployment directory on EC2
ssh ec2-user@your-ec2-ip "mkdir -p ~/pivot-deploy"

# Sync files (excluding unnecessary files)
rsync -avz --exclude 'node_modules' \
           --exclude '__pycache__' \
           --exclude '.git' \
           --exclude 'frontend/build' \
           --exclude '*.pyc' \
           --exclude '.env' \
           ./ ec2-user@your-ec2-ip:~/pivot-deploy/
```

#### Step 2: SSH into EC2

```bash
ssh ec2-user@your-ec2-ip
cd ~/pivot-deploy
```

#### Step 3: Install Dependencies

**Install Python 3 and pip (if not already installed):**
```bash
# For Amazon Linux
sudo yum update -y
sudo yum install -y python3 python3-pip

# For Ubuntu
sudo apt update
sudo apt install -y python3 python3-pip
```

**Install Python dependencies:**
```bash
cd backend
python3 -m pip install --user --upgrade pip
python3 -m pip install --user -r requirements.txt
cd ..
```

**Install Node.js (if not installed):**
```bash
# For Amazon Linux
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# For Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Install Node dependencies and build frontend:**
```bash
cd frontend
npm install
npm run build
cd ..
```

#### Step 4: Set Up Environment Variables

Create `backend/.env` file:

```bash
cd backend
nano .env
```

Add the following (replace with your actual values):

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=pivot_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AWS S3 Configuration (REQUIRED FOR VIDEO/AUDIO UPLOADS)
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=pivot-s3-bucket
PRESIGNED_URL_EXPIRATION=600

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
EMERGENT_LLM_KEY=your-emergent-key-if-using

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Backend URL (for frontend)
REACT_APP_BACKEND_URL=http://your-ec2-ip:8001
```

**⚠️ IMPORTANT:** 
- The application uses **AWS S3** for media uploads (not R2)
- You must create an S3 bucket and configure CORS (see `AWS_S3_MIGRATION_SUMMARY.md` for details)
- Without AWS credentials, video/audio uploads will fail

**Important:** Update `REACT_APP_BACKEND_URL` in `frontend/.env` or `frontend/.env.production` as well:

```bash
cd ../frontend
echo "REACT_APP_BACKEND_URL=http://your-ec2-ip:8001" > .env.production
npm run build  # Rebuild with new env
```

#### Step 5: Configure Security Groups

In AWS EC2 Console:
1. Go to Security Groups
2. Edit inbound rules
3. Add rules for:
   - Port 8001 (Backend API) - Source: Your IP or 0.0.0.0/0 for testing
   - Port 3000 (Frontend) - Source: Your IP or 0.0.0.0/0 for testing
   - Port 80/443 (If using nginx) - Source: 0.0.0.0/0

#### Step 6: Start the Backend Server

**Option A: Direct run (for testing):**
```bash
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

**Option B: Using PM2 (recommended for production):**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start "python3 -m uvicorn server:app --host 0.0.0.0 --port 8001" --name pivot-backend

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

**Option C: Using systemd (Linux service):**
```bash
sudo nano /etc/systemd/system/pivot-backend.service
```

Add:
```ini
[Unit]
Description=PIVOT Backend API
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/pivot-deploy/backend
Environment="PATH=/home/ec2-user/.local/bin:/usr/bin"
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pivot-backend
sudo systemctl start pivot-backend
sudo systemctl status pivot-backend
```

#### Step 7: Serve Frontend (Optional - for production)

**Option A: Serve with nginx:**
```bash
# Install nginx
sudo yum install -y nginx  # Amazon Linux
# or
sudo apt install -y nginx   # Ubuntu

# Configure nginx
sudo nano /etc/nginx/sites-available/pivot
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ec2-user/pivot-deploy/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static {
        alias /home/ec2-user/pivot-deploy/backend/static;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/pivot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Option B: Serve frontend with Python (simple testing):**
```bash
cd frontend/build
python3 -m http.server 3000
```

## Testing Your Deployment

1. **Test Backend API:**
   ```bash
   curl http://your-ec2-ip:8001/api/
   ```

2. **Test Frontend:**
   Open browser: `http://your-ec2-ip:3000`

3. **Check logs:**
   ```bash
   # If using PM2
   pm2 logs pivot-backend
   
   # If using systemd
   sudo journalctl -u pivot-backend -f
   ```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8001
sudo lsof -i :8001
# Kill it
sudo kill -9 <PID>
```

### Permission Denied
```bash
# Make sure uploads directory is writable
chmod -R 755 backend/uploads
```

### MongoDB Connection Issues
- Check security group allows outbound connections
- Verify MongoDB connection string is correct
- Check MongoDB IP whitelist includes EC2 IP

### Frontend Can't Connect to Backend
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check CORS settings in backend
- Verify security groups allow traffic

## Quick Commands Reference

```bash
# View backend logs
pm2 logs pivot-backend
# or
sudo journalctl -u pivot-backend -f

# Restart backend
pm2 restart pivot-backend
# or
sudo systemctl restart pivot-backend

# Check if backend is running
curl http://localhost:8001/api/

# Update code (from Mac)
rsync -avz --exclude 'node_modules' --exclude '__pycache__' ./ ec2-user@your-ec2-ip:~/pivot-deploy/
```

## Next Steps

- Set up SSL certificate with Let's Encrypt
- Configure domain name DNS
- Set up automated backups
- Configure monitoring and alerts
- Set up CI/CD pipeline

