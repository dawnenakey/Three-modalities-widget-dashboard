# Deploy to EC2 - Quick Start Guide

Since you've already completed Steps 1 & 2 (S3 setup and environment variables), let's proceed with deployment!

## Current Status
- ✅ AWS S3 bucket created and configured
- ✅ Environment variables prepared
- ✅ Code merged and tested locally
- ✅ Branch: `merge-conflict-071225-1858`

## Step 3: Deploy to EC2

### Option A: Using Deployment Script (Easiest)

1. **Set your EC2 connection details:**
   ```bash
   export EC2_HOST="ec2-user@your-ec2-ip-or-domain"
   ```
   
   Replace with your actual EC2 details:
   - `ec2-user` or `ubuntu` (depending on your AMI)
   - Your EC2 public IP or domain name

2. **Deploy files to EC2:**
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

### Option B: Manual Deployment

See `DEPLOYMENT.md` for detailed manual instructions.

## Step 4: Set Up Environment Variables on EC2

**IMPORTANT:** You need to create `backend/.env` on the EC2 instance with your credentials.

1. **SSH into EC2:**
   ```bash
   ssh ec2-user@your-ec2-ip
   cd ~/pivot-deploy/backend
   ```

2. **Create .env file:**
   ```bash
   nano .env
   ```

3. **Paste your environment variables** (same as your local .env):
   ```env
   # MongoDB
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=pivot_accessibility
   
   # JWT
   JWT_SECRET_KEY=your_secret_key
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=24
   
   # AWS S3 (you already have these)
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   PRESIGNED_URL_EXPIRATION=600
   
   # OpenAI
   OPENAI_API_KEY=your_openai_key
   
   # CORS
   CORS_ORIGINS=http://your-ec2-ip:3000,https://your-domain.com
   ```

4. **Save and exit** (Ctrl+X, then Y, then Enter)

5. **Update frontend environment:**
   ```bash
   cd ../frontend
   echo "REACT_APP_BACKEND_URL=http://your-ec2-ip:8001" > .env.production
   # Or if using domain:
   # echo "REACT_APP_BACKEND_URL=https://your-domain.com" > .env.production
   npm run build
   ```

## Step 5: Configure Security Groups

In AWS EC2 Console:
1. Go to **EC2 Dashboard** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules**
4. Add these rules:
   - **Type:** Custom TCP, **Port:** 8001, **Source:** 0.0.0.0/0 (or your IP)
   - **Type:** Custom TCP, **Port:** 3000, **Source:** 0.0.0.0/0 (or your IP)
   - **Type:** HTTP, **Port:** 80, **Source:** 0.0.0.0/0
   - **Type:** HTTPS, **Port:** 443, **Source:** 0.0.0.0/0

## Step 6: Start the Backend Server

On your EC2 instance:

```bash
cd ~/pivot-deploy/backend

# Install PM2 (process manager)
sudo npm install -g pm2

# Start the backend
pm2 start "python3 -m uvicorn server:app --host 0.0.0.0 --port 8001" --name pivot-backend

# Save PM2 configuration
pm2 save
pm2 startup  # Follow the instructions shown
```

## Step 7: Verify Deployment

1. **Test backend API:**
   ```bash
   curl http://localhost:8001/api/
   # Should return: {"message":"PIVOT API - Accessibility Platform"}
   ```

2. **Test from your local machine:**
   ```bash
   curl http://your-ec2-ip:8001/api/
   ```

3. **Check logs:**
   ```bash
   pm2 logs pivot-backend
   ```

4. **Test S3 connection:**
   ```bash
   cd ~/pivot-deploy/backend
   python3 -c "import s3_service; print('S3 service OK')"
   ```

## Troubleshooting

### Can't connect to EC2
- Check security group allows SSH (port 22) from your IP
- Verify EC2 instance is running
- Check your SSH key is correct

### Backend won't start
- Check `.env` file exists and has all variables
- Verify Python dependencies: `pip3 list | grep fastapi`
- Check logs: `pm2 logs pivot-backend`

### S3 uploads fail
- Verify AWS credentials in `.env`
- Check S3 bucket CORS configuration
- Verify security group allows outbound HTTPS (port 443)

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Test video/audio upload functionality
3. ✅ Set up domain name (optional)
4. ✅ Configure SSL certificate (Let's Encrypt)
5. ✅ Set up monitoring

## Quick Commands Reference

```bash
# View logs
pm2 logs pivot-backend

# Restart backend
pm2 restart pivot-backend

# Stop backend
pm2 stop pivot-backend

# Check status
pm2 status

# Update code (from local machine)
rsync -avz --exclude 'node_modules' --exclude '__pycache__' ./ ec2-user@your-ec2-ip:~/pivot-deploy/
```

