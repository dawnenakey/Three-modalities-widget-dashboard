# Docker-based EC2 Deployment Guide

This guide provides a Docker-based deployment approach for the PIVOT Widget Dashboard. This method is recommended for production deployments as it provides better isolation, consistency, and easier management.

## Overview

This deployment uses:
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nginx** for serving frontend and proxying backend
- **Separate containers** for frontend and backend

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS or Amazon Linux 2023)
- At least 2GB RAM (t2.small or t3.small minimum)
- 20GB storage
- MongoDB connection string (MongoDB Atlas recommended)
- OpenAI API key

## Quick Start

### 1. Launch EC2 Instance

1. Launch EC2 instance with Ubuntu 22.04 LTS
2. Configure Security Group:
   - Port 22 (SSH) - Your IP
   - Port 80 (HTTP) - 0.0.0.0/0
   - Port 8001 (Backend API) - 0.0.0.0/0
   - Port 443 (HTTPS) - 0.0.0.0/0 (optional, for SSL)

### 2. Connect and Install Docker

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Install git and curl
sudo apt-get install -y git curl

# Log out and back in for docker permissions
exit
```

### 3. Clone Repository

```bash
# SSH back into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Clone your repository
git clone YOUR_REPOSITORY_URL
cd Three-modalities-widget-dashboard
```

### 4. Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit environment file
nano backend/.env
```

Update these values in `backend/.env`:

```env
# MongoDB - Get from MongoDB Atlas or your MongoDB instance
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=pivot_widget

# JWT Secret - Generate a strong random key
JWT_SECRET_KEY=your_very_long_and_random_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS - Update with your domain
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com,https://*.cloudfront.net

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Backend URL - Use your EC2 public IP or domain
REACT_APP_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8001
```

**To get your EC2 public IP:**
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**To generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### 5. Deploy with Docker Compose

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy (this builds and starts all containers)
./deploy.sh
```

The deployment script will:
1. Check for Docker and Docker Compose
2. Stop any existing containers
3. Build Docker images
4. Start all services
5. Run health checks
6. Display access URLs

### 6. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test backend
curl http://localhost:8001/api/

# Test frontend
curl http://localhost/health
```

## Accessing Your Application

After successful deployment:

- **Frontend**: `http://YOUR_EC2_PUBLIC_IP`
- **Backend API**: `http://YOUR_EC2_PUBLIC_IP:8001/api`
- **API Documentation**: `http://YOUR_EC2_PUBLIC_IP:8001/docs`

## Architecture

```
┌─────────────────────────────────────┐
│         EC2 Instance (Port 80)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Frontend Container         │  │
│  │   (Nginx + React Build)      │  │
│  │   Port 80                    │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│             │ Proxy /api/          │
│             ↓                       │
│  ┌──────────────────────────────┐  │
│  │   Backend Container          │  │
│  │   (FastAPI + Python)         │  │
│  │   Port 8001                  │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         │
         ↓
   External Services
   - MongoDB Atlas
   - OpenAI API
```

## File Structure

```
.
├── docker-compose.yml          # Orchestration config
├── deploy.sh                   # Automated deployment script
├── DOCKER_DEPLOYMENT.md        # This file
│
├── backend/
│   ├── Dockerfile             # Backend container definition
│   ├── .env                   # Environment variables (create from .env.example)
│   ├── .env.example          # Environment template
│   ├── server.py             # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── uploads/              # Persistent storage (mounted volume)
│
└── frontend/
    ├── Dockerfile            # Frontend container definition
    ├── nginx.conf           # Nginx configuration
    ├── package.json         # Node dependencies
    └── src/                 # React source code
```

## Docker Commands Reference

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# View running containers
docker-compose ps
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View frontend logs only
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100

# Check container health
docker-compose ps
```

### Rebuilding

```bash
# Rebuild all images
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache backend

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers, volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Check disk usage
docker system df
```

## Updating the Application

### Method 1: Using Git Pull

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Method 2: From Local Machine

```bash
# On your local machine
git push origin main

# On EC2
git pull origin main
docker-compose up -d --build
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Check if ports are already in use
sudo lsof -i :80
sudo lsof -i :8001

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### MongoDB Connection Issues

1. Check `.env` file has correct `MONGO_URL`
2. Verify EC2 IP is whitelisted in MongoDB Atlas
3. Test connection:
   ```bash
   docker-compose logs backend | grep -i mongo
   ```

### Frontend Can't Reach Backend

1. Verify `REACT_APP_BACKEND_URL` in `backend/.env`
2. Rebuild frontend:
   ```bash
   docker-compose up -d --build frontend
   ```
3. Check nginx configuration in `frontend/nginx.conf`

### Permission Errors

```bash
# Fix permissions for uploads directory
sudo chown -R 1000:1000 backend/uploads

# Fix Docker socket permissions
sudo chmod 666 /var/run/docker.sock
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a

# Check Docker disk usage
docker system df
```

## Production Best Practices

### 1. Use Environment-Specific Configs

Never commit `.env` files with secrets. Always use `.env.example` as template.

### 2. Set Up SSL/HTTPS

```bash
# Install Certbot
sudo apt-get install -y certbot

# Get certificate (requires domain name)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use SSL
# Restart: docker-compose restart frontend
```

### 3. Configure Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### 4. Set Up Auto-Start

Create `/etc/systemd/system/pivot-app.service`:

```ini
[Unit]
Description=PIVOT Widget Dashboard
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/Three-modalities-widget-dashboard
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable pivot-app.service
sudo systemctl start pivot-app.service
```

### 5. Set Up Monitoring

```bash
# Install monitoring tools
docker stats                    # Real-time container stats
docker-compose logs -f         # Live logs

# Consider tools like:
# - AWS CloudWatch
# - Prometheus + Grafana
# - Datadog
```

### 6. Regular Backups

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/

# Backup MongoDB (if self-hosted)
# Use MongoDB Atlas automated backups if using Atlas
```

## Performance Tuning

### Increase Container Resources

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Enable Gzip Compression

Already enabled in `frontend/nginx.conf`. Verify:

```bash
curl -H "Accept-Encoding: gzip" -I http://YOUR_EC2_IP
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong MongoDB credentials
- [ ] Restrict CORS origins (not using `*`)
- [ ] Enable HTTPS/SSL
- [ ] Whitelist specific IPs in security groups
- [ ] Regularly update Docker images
- [ ] Use secrets management (AWS Secrets Manager)
- [ ] Enable AWS CloudWatch logging
- [ ] Set up automated security scanning
- [ ] Regular backup of data

## Comparison: Docker vs Traditional Deployment

| Feature | Docker Deployment | Traditional Deployment |
|---------|-------------------|------------------------|
| Setup Complexity | Medium | Easy |
| Isolation | Excellent | Limited |
| Consistency | High | Medium |
| Resource Usage | Higher | Lower |
| Scaling | Easy | Manual |
| Recommended For | Production | Testing/Development |

## Support and Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## Need Help?

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify `.env` configuration
3. Check security groups in AWS Console
4. Ensure EC2 instance has enough resources
5. Review this documentation's troubleshooting section

---

**Note**: For simpler deployment without Docker, see `DEPLOYMENT.md` for traditional installation method.
