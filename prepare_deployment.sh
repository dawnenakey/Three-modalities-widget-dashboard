#!/bin/bash
# Prepare deployment package - verify everything is ready

set -e

echo "🚀 PIVOT Deployment Preparation"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "merge-conflict-071225-1858" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on expected branch${NC}"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo "   Consider committing or stashing them before deployment"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check backend/.env exists
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env exists${NC}"
    
    # Check for AWS credentials (without showing values)
    if grep -q "AWS_ACCESS_KEY_ID" backend/.env && grep -q "AWS_SECRET_ACCESS_KEY" backend/.env; then
        echo -e "${GREEN}✅ AWS credentials found in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  AWS credentials not found in .env${NC}"
        echo "   Make sure to add them before deploying to EC2"
    fi
    
    if grep -q "S3_BUCKET_NAME" backend/.env; then
        BUCKET=$(grep "S3_BUCKET_NAME" backend/.env | cut -d '=' -f2)
        echo -e "${GREEN}✅ S3_BUCKET_NAME: $BUCKET${NC}"
    else
        echo -e "${YELLOW}⚠️  S3_BUCKET_NAME not found${NC}"
    fi
else
    echo -e "${RED}❌ backend/.env not found${NC}"
    echo "   You'll need to create it on EC2 with your credentials"
fi

# Check critical files
echo ""
echo "📁 Checking critical files..."
FILES=(
    "backend/server.py"
    "backend/s3_service.py"
    "backend/requirements.txt"
    "deploy.sh"
    "DEPLOYMENT.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file (missing!)"
    fi
done

# Check Python syntax
echo ""
echo "🐍 Checking Python syntax..."
if python3 -m py_compile backend/server.py backend/s3_service.py 2>/dev/null; then
    echo -e "${GREEN}✅ Python syntax OK${NC}"
else
    echo -e "${RED}❌ Python syntax errors found${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set EC2_HOST environment variable:"
echo "   export EC2_HOST=\"ec2-user@your-ec2-ip\""
echo ""
echo "2. Deploy to EC2:"
echo "   EC2_HOST=\"ec2-user@your-ec2-ip\" ./deploy.sh"
echo ""
echo "3. SSH into EC2 and complete setup:"
echo "   ssh ec2-user@your-ec2-ip"
echo "   cd ~/pivot-deploy && ./deploy.sh"
echo ""

