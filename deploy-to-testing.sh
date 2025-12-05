#!/bin/bash

# Deployment Script for testing.gopivot.me
# This script helps deploy the PIVOT application to the testing server

set -e

echo "🚀 PIVOT Deployment to testing.gopivot.me"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're running locally or on server
if [ -z "$DEPLOY_MODE" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  For local deployment (pushing to server):"
    echo "    DEPLOY_MODE=local SERVER_USER=ubuntu SERVER_HOST=testing.gopivot.me ./deploy-to-testing.sh"
    echo ""
    echo "  For server deployment (running on server):"
    echo "    DEPLOY_MODE=server ./deploy-to-testing.sh"
    exit 1
fi

# Local deployment - sync files to server
if [ "$DEPLOY_MODE" = "local" ]; then
    if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ]; then
        echo -e "${RED}Error: SERVER_USER and SERVER_HOST must be set${NC}"
        echo "Example: SERVER_USER=ubuntu SERVER_HOST=testing.gopivot.me"
        exit 1
    fi

    echo -e "${GREEN}Deploying FROM local TO server: $SERVER_USER@$SERVER_HOST${NC}"

    # Create deployment directory on server
    echo -e "${YELLOW}Creating deployment directory on server...${NC}"
    ssh $SERVER_USER@$SERVER_HOST "sudo mkdir -p /var/www/pivot && sudo chown $SERVER_USER:$SERVER_USER /var/www/pivot"

    # Sync files to server
    echo -e "${YELLOW}Syncing files to server (this may take a few minutes)...${NC}"
    rsync -avz --progress \
               --exclude 'node_modules' \
               --exclude '__pycache__' \
               --exclude '.git' \
               --exclude 'frontend/build' \
               --exclude '*.pyc' \
               --exclude '.env' \
               --exclude '.env.*' \
               --exclude 'venv' \
               --exclude '.venv' \
               --exclude 'backend/uploads' \
               ./ $SERVER_USER@$SERVER_HOST:/var/www/pivot/

    echo -e "${GREEN}✅ Files synced successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. SSH into the server:"
    echo "   ssh $SERVER_USER@$SERVER_HOST"
    echo ""
    echo "2. Run the server deployment script:"
    echo "   cd /var/www/pivot && DEPLOY_MODE=server ./deploy-to-testing.sh"
    echo ""
    echo "3. Configure your environment variables in backend/.env"
    exit 0
fi

# Server deployment - install dependencies and configure services
if [ "$DEPLOY_MODE" = "server" ]; then
    echo -e "${GREEN}Running deployment ON server...${NC}"

    # Check we're in the right directory
    if [ ! -f "backend/server.py" ]; then
        echo -e "${RED}Error: Must be run from the project root directory${NC}"
        exit 1
    fi

    # Update system packages
    echo -e "${YELLOW}Updating system packages...${NC}"
    sudo apt update

    # Install Python 3 and pip
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    if ! command -v python3 &> /dev/null; then
        sudo apt install -y python3 python3-pip python3-venv
    fi

    # Create Python virtual environment
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi

    source venv/bin/activate

    # Install Python packages
    echo -e "${YELLOW}Installing Python packages...${NC}"
    cd backend
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..

    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Installing Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi

    # Install frontend dependencies and build
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install --legacy-peer-deps

    echo -e "${YELLOW}Building frontend...${NC}"
    npm run build
    cd ..

    # Create upload directories
    echo -e "${YELLOW}Creating upload directories...${NC}"
    mkdir -p backend/uploads/videos
    mkdir -p backend/uploads/audio
    chmod -R 755 backend/uploads

    # Check for .env file
    if [ ! -f backend/.env ]; then
        echo -e "${RED}⚠️  WARNING: backend/.env file not found!${NC}"
        echo -e "${YELLOW}Creating template .env file...${NC}"
        cat > backend/.env <<EOL
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=pivot_widget
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,https://testing.gopivot.me,https://*.cloudfront.net
OPENAI_API_KEY=sk-your-openai-api-key-here
REACT_APP_BACKEND_URL=https://testing.gopivot.me/api
EOL
        echo -e "${RED}Please edit backend/.env and add your actual credentials!${NC}"
        echo "Run: nano backend/.env"
    fi

    # Set up systemd service
    echo -e "${YELLOW}Setting up systemd service...${NC}"
    sudo tee /etc/systemd/system/pivot-backend.service > /dev/null <<EOL
[Unit]
Description=PIVOT Backend API
After=network.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=/var/www/pivot/backend
Environment="PATH=/var/www/pivot/venv/bin"
ExecStart=/var/www/pivot/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

    # Reload systemd and start service
    sudo systemctl daemon-reload
    sudo systemctl enable pivot-backend

    echo -e "${YELLOW}Starting backend service...${NC}"
    sudo systemctl restart pivot-backend

    # Wait a moment for service to start
    sleep 2

    # Check service status
    if sudo systemctl is-active --quiet pivot-backend; then
        echo -e "${GREEN}✅ Backend service started successfully!${NC}"
    else
        echo -e "${RED}❌ Backend service failed to start${NC}"
        echo "Check logs with: sudo journalctl -u pivot-backend -n 50"
    fi

    # Install Nginx if not present
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}Installing Nginx...${NC}"
        sudo apt install -y nginx
    fi

    # Create Nginx configuration
    echo -e "${YELLOW}Creating Nginx configuration...${NC}"
    sudo tee /etc/nginx/sites-available/testing.gopivot.me > /dev/null <<'EOL'
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
EOL

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/testing.gopivot.me /etc/nginx/sites-enabled/

    # Test Nginx configuration
    echo -e "${YELLOW}Testing Nginx configuration...${NC}"
    if sudo nginx -t; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
        sudo systemctl restart nginx
        echo -e "${GREEN}✅ Nginx restarted${NC}"
    else
        echo -e "${RED}❌ Nginx configuration has errors${NC}"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo ""
    echo "1. Configure your environment variables:"
    echo "   nano /var/www/pivot/backend/.env"
    echo ""
    echo "2. Restart the backend service:"
    echo "   sudo systemctl restart pivot-backend"
    echo ""
    echo "3. Set up SSL certificate (IMPORTANT for production):"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d testing.gopivot.me"
    echo ""
    echo "4. Test your deployment:"
    echo "   curl http://testing.gopivot.me/api/"
    echo ""
    echo "5. View logs:"
    echo "   Backend: sudo journalctl -u pivot-backend -f"
    echo "   Nginx: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo -e "${GREEN}Your application should now be accessible at:${NC}"
    echo "   http://testing.gopivot.me (will redirect to HTTPS after SSL setup)"
    echo ""
fi
