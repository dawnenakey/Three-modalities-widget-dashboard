# AWS Migration Checklist

Use this checklist to ensure all AWS services are properly configured before deploying to EC2.

## ✅ Pre-Deployment Checklist

### AWS S3 Setup
- [ ] S3 bucket created (`pivot-s3-bucket` or your preferred name)
- [ ] S3 bucket CORS policy configured (see `DEPLOYMENT.md`)
- [ ] IAM user created with S3 access permissions
- [ ] AWS Access Key ID and Secret Access Key saved securely
- [ ] S3 bucket policy configured (if public reads needed)

### Environment Variables
- [ ] `AWS_ACCESS_KEY_ID` added to `backend/.env`
- [ ] `AWS_SECRET_ACCESS_KEY` added to `backend/.env`
- [ ] `AWS_REGION` set (e.g., `us-east-1`)
- [ ] `S3_BUCKET_NAME` matches your bucket name
- [ ] `PRESIGNED_URL_EXPIRATION` set (default: 600 seconds)
- [ ] `MONGO_URL` configured
- [ ] `DB_NAME` set
- [ ] `JWT_SECRET_KEY` set (min 32 characters)
- [ ] `OPENAI_API_KEY` configured
- [ ] `CORS_ORIGINS` includes your EC2 IP/domain

### EC2 Instance
- [ ] EC2 instance running (Ubuntu 20.04/22.04 or Amazon Linux 2)
- [ ] SSH access configured
- [ ] Security group allows:
  - [ ] Port 8001 (Backend API) - inbound
  - [ ] Port 3000 (Frontend) - inbound (if not using nginx)
  - [ ] Port 80 (HTTP) - inbound
  - [ ] Port 443 (HTTPS) - inbound
  - [ ] Port 443 (HTTPS) - outbound (for S3 API calls)
- [ ] Elastic IP assigned (optional, for static IP)

### Code Deployment
- [ ] Code merged and conflicts resolved
- [ ] Branch `conflict_071225_1858` merged into main (or current branch)
- [ ] All files synced to EC2
- [ ] Python dependencies installed
- [ ] Node dependencies installed
- [ ] Frontend built successfully

## ✅ Post-Deployment Verification

### Backend Tests
- [ ] Backend starts without errors
- [ ] API endpoint responds: `curl http://localhost:8001/api/`
- [ ] S3 service loads: `python3 -c "import s3_service; print('OK')"`
- [ ] MongoDB connection works
- [ ] JWT authentication works

### Frontend Tests
- [ ] Frontend builds without errors
- [ ] Frontend accessible at `http://your-ec2-ip:3000` or domain
- [ ] Frontend can connect to backend API
- [ ] Login/registration works

### Upload Functionality Tests
- [ ] Video upload URL generation works
- [ ] Video upload to S3 succeeds
- [ ] Video appears in S3 bucket
- [ ] Video playback works in dashboard
- [ ] Audio upload URL generation works
- [ ] Audio upload to S3 succeeds
- [ ] Audio appears in S3 bucket
- [ ] Audio playback works in dashboard

### Widget Tests
- [ ] Widget loads on test page
- [ ] Widget displays sections correctly
- [ ] Widget video playback works
- [ ] Widget audio playback works
- [ ] Widget text highlighting works

## 🔧 Troubleshooting Quick Reference

### S3 Upload Issues
```bash
# Test S3 connection
cd backend
python3 -c "import s3_service; print('S3 service OK')"

# Check AWS credentials
grep AWS backend/.env

# Verify bucket exists and is accessible
aws s3 ls s3://pivot-s3-bucket/ --profile default
```

### Backend Issues
```bash
# Check logs
pm2 logs pivot-backend
# or
sudo journalctl -u pivot-backend -f

# Test API
curl http://localhost:8001/api/

# Check environment variables loaded
cd backend
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('AWS_ACCESS_KEY_ID:', 'SET' if os.getenv('AWS_ACCESS_KEY_ID') else 'MISSING')"
```

### Frontend Issues
```bash
# Rebuild frontend
cd frontend
npm run build

# Check backend URL
cat .env.production

# Test backend connection from frontend
curl http://your-ec2-ip:8001/api/
```

## 📝 Notes

- **S3 Bucket Name**: Must match `S3_BUCKET_NAME` in `.env`
- **CORS Configuration**: Must include your EC2 IP/domain in allowed origins
- **IAM Permissions**: User needs `s3:PutObject`, `s3:GetObject`, `s3:PutObjectAcl` at minimum
- **Security**: Never commit `.env` files to git
- **Backup**: Keep a secure backup of all credentials

## 🚀 Ready for Production?

Before going live:
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Domain name configured
- [ ] DNS records pointing to EC2
- [ ] Security groups restricted to necessary IPs
- [ ] Monitoring set up (CloudWatch)
- [ ] Backups configured
- [ ] Load testing completed
- [ ] Documentation updated

