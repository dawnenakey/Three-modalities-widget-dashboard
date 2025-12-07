#!/bin/bash

# PIVOT Deployment Script for EC2
# This script helps deploy the application to EC2

set -e

echo "🚀 PIVOT Deployment Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on EC2 or local
if [ -z "$EC2_HOST" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  For local deployment (pushing to EC2):"
    echo "    EC2_HOST=user@your-ec2-ip ./deploy.sh"
    echo ""
    echo "  For EC2 deployment (running on EC2):"
    echo "    ./deploy.sh"
    exit 1
fi

# If EC2_HOST is set, we're deploying FROM local TO EC2
if [ ! -z "$EC2_HOST" ]; then
    echo -e "${GREEN}Deploying to EC2: $EC2_HOST${NC}"
    
    # Create deployment directory on EC2
    ssh $EC2_HOST "mkdir -p ~/pivot-deploy"
    
    # Sync files (excluding node_modules, __pycache__, etc.)
    echo -e "${YELLOW}Syncing files to EC2...${NC}"
    rsync -avz --exclude 'node_modules' \
               --exclude '__pycache__' \
               --exclude '.git' \
               --exclude 'frontend/build' \
               --exclude '*.pyc' \
               --exclude '.env' \
               --exclude '.DS_Store' \
               ./ $EC2_HOST:~/pivot-deploy/
    
    echo -e "${GREEN}Files synced!${NC}"
    echo -e "${YELLOW}Now SSH into EC2 and run:${NC}"
    echo "  cd ~/pivot-deploy && ./deploy.sh"
    exit 0
fi

# We're on EC2 - run deployment steps
echo -e "${GREEN}Running deployment on EC2...${NC}"

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python3 not found. Installing...${NC}"
    sudo yum update -y
    sudo yum install -y python3 python3-pip
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
cd backend
python3 -m pip install --user --upgrade pip
python3 -m pip install --user -r requirements.txt
cd ..

# Install Node dependencies and build frontend
echo -e "${YELLOW}Installing Node dependencies...${NC}"
cd frontend
npm install
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
cd ..

# Check for .env file
if [ ! -f backend/.env ]; then
    echo -e "${RED}⚠️  WARNING: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env with the following variables:${NC}"
    echo "  MONGO_URL=your_mongodb_connection_string"
    echo "  DB_NAME=your_database_name"
    echo "  JWT_SECRET_KEY=your_secret_key"
    echo "  JWT_ALGORITHM=HS256"
    echo "  JWT_EXPIRATION_HOURS=24"
    echo "  OPENAI_API_KEY=your_openai_key"
    echo "  CORS_ORIGINS=http://localhost:3000,https://yourdomain.com"
    exit 1
fi

echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo ""
echo -e "${YELLOW}To start the server, run:${NC}"
echo "  cd backend && uvicorn server:app --host 0.0.0.0 --port 8001"
echo ""
echo -e "${YELLOW}Or use a process manager like PM2 or systemd${NC}"

