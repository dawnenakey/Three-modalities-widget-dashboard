# Testing Deployment Guide - testing.gopivot.me

This guide will help you deploy the PIVOT application to the testing environment at testing.gopivot.me.

## Prerequisites

- Access to the testing.gopivot.me server
- MongoDB connection string configured
- OpenAI API key configured
- SSL certificate set up for testing.gopivot.me

## Deployment Architecture

The application consists of two main components:

1. **Frontend** - React application (built static files in `frontend/build`)
2. **Backend** - FastAPI Python server (in `backend/`)
3. **Widget** - JavaScript widget (`backend/static/widget.js`)

## Environment Configuration

### Backend Environment Variables

The backend requires a `.env` file in the `backend/` directory with the following variables:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=pivot_widget
JWT_SECRET_KEY=your_secure_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,https://testing.gopivot.me,https://*.cloudfront.net
OPENAI_API_KEY=sk-your-openai-api-key
REACT_APP_BACKEND_URL=https://testing.gopivot.me/api
```

**Important:** Make sure to update the following values:
- `MONGO_URL`: Your actual MongoDB connection string
- `JWT_SECRET_KEY`: A secure, randomly generated secret key
- `OPENAI_API_KEY`: Your actual OpenAI API key

### Frontend Environment Variables

The frontend has been built with the production environment pointing to `https://testing.gopivot.me/api`.

## Deployment Steps

### Option 1: Using Nginx with Reverse Proxy (Recommended)

This is the recommended approach for production/testing environments.

#### 1. Install Dependencies

**On the server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL (if not already installed)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Set Up the Backend

```bash
# Create application directory
sudo mkdir -p /var/www/pivot
cd /var/www/pivot

# Clone or copy your application files here
# (You can use git, rsync, or scp)

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
cd backend
pip install -r requirements.txt
```

#### 3. Configure Environment Variables

Create the backend `.env` file:

```bash
cd /var/www/pivot/backend
nano .env
```

Add your environment variables as shown in the "Backend Environment Variables" section above.

#### 4. Set Up Systemd Service for Backend

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/pivot-backend.service
```

Add the following content:

```ini
[Unit]
Description=PIVOT Backend API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/pivot/backend
Environment="PATH=/var/www/pivot/venv/bin"
ExecStart=/var/www/pivot/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start and enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pivot-backend
sudo systemctl start pivot-backend
sudo systemctl status pivot-backend
```

#### 5. Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/testing.gopivot.me
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name testing.gopivot.me;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name testing.gopivot.me;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/testing.gopivot.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/testing.gopivot.me/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

        # CORS headers for media files
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";

        # Cache media files
        expires 1y;
        add_header Cache-Control "public";
    }

    # Widget JavaScript file
    location /api/widget.js {
        alias /var/www/pivot/backend/static/widget.js;

        # CORS headers for widget
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Content-Type "application/javascript";

        # Cache but allow revalidation
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Other static files
    location /api/static/ {
        alias /var/www/pivot/backend/static/;

        # CORS headers
        add_header Access-Control-Allow-Origin *;

        expires 1d;
        add_header Cache-Control "public";
    }

    # File upload size limit
    client_max_body_size 100M;
}
```

Enable the site and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/testing.gopivot.me /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 6. Set Up SSL Certificate (if not already done)

```bash
sudo certbot --nginx -d testing.gopivot.me
```

Follow the prompts to set up SSL.

### Option 2: Quick Testing Setup (Development)

For quick testing without Nginx:

```bash
# Start backend on port 8001
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001

# In another terminal, serve frontend
cd frontend/build
python3 -m http.server 3000
```

Then set up port forwarding or use a reverse proxy to expose ports 3000 and 8001.

## Testing the Deployment

### 1. Test Backend API

```bash
curl https://testing.gopivot.me/api/
```

You should see: `{"message":"PIVOT API - Accessibility Platform"}`

### 2. Test Frontend

Open your browser and navigate to: `https://testing.gopivot.me`

You should see the PIVOT dashboard login page.

### 3. Test Widget

Create a test HTML file with the widget embed code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Testing PIVOT Widget</h1>
    <p>This is a test page for the PIVOT accessibility widget.</p>

    <!-- PIVOT Widget -->
    <script src="https://testing.gopivot.me/api/widget.js"
            data-website-id="YOUR_WEBSITE_ID"></script>
</body>
</html>
```

Replace `YOUR_WEBSITE_ID` with an actual website ID from your dashboard.

### 4. View Logs

**Backend logs:**
```bash
sudo journalctl -u pivot-backend -f
```

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Backend Not Starting

**Check logs:**
```bash
sudo journalctl -u pivot-backend -n 50
```

**Common issues:**
- Missing `.env` file or incorrect environment variables
- MongoDB connection issues
- Missing Python dependencies

### Frontend Not Loading

**Check Nginx configuration:**
```bash
sudo nginx -t
```

**Verify build files exist:**
```bash
ls -la /var/www/pivot/frontend/build
```

### Widget Not Loading

**Check CORS configuration:**
- Ensure `CORS_ORIGINS` in backend `.env` includes your domain
- Verify Nginx is serving the widget.js file correctly

**Test widget.js directly:**
```bash
curl https://testing.gopivot.me/api/widget.js
```

### File Upload Issues

**Check permissions:**
```bash
sudo chown -R www-data:www-data /var/www/pivot/backend/uploads
sudo chmod -R 755 /var/www/pivot/backend/uploads
```

**Check Nginx upload size limit:**
Verify `client_max_body_size` is set appropriately in Nginx config.

## Updating the Deployment

When you need to update the application:

### Update Backend

```bash
cd /var/www/pivot
git pull origin claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL

# Activate virtual environment
source venv/bin/activate

# Update dependencies if needed
cd backend
pip install -r requirements.txt

# Restart backend service
sudo systemctl restart pivot-backend
```

### Update Frontend

```bash
cd /var/www/pivot
git pull origin claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL

# Rebuild frontend if needed
cd frontend
npm install --legacy-peer-deps
npm run build

# Copy build files (if needed)
sudo cp -r build/* /var/www/pivot/frontend/build/

# Restart Nginx to clear cache
sudo systemctl restart nginx
```

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] JWT secret key is secure and not committed to git
- [ ] MongoDB connection uses authentication
- [ ] CORS origins are properly configured
- [ ] File upload directory has correct permissions
- [ ] Firewall configured to only allow ports 80 and 443
- [ ] Backend is not directly accessible from the internet (only through Nginx)
- [ ] Environment variables are not committed to git
- [ ] Regular backups of MongoDB database
- [ ] Logs are being rotated properly

## Monitoring

Set up basic monitoring for:

1. **Backend health:** Check `/api/` endpoint returns 200
2. **Frontend availability:** Check main page loads
3. **Disk space:** Monitor uploads directory
4. **Service status:** Check systemd service is running
5. **Nginx status:** Check Nginx is running and responding

## Support

For issues or questions about the deployment:

1. Check the logs first (backend and Nginx)
2. Review this deployment guide
3. Check the main WIDGET_DOCUMENTATION.md for widget-specific issues
4. Verify all environment variables are correctly set

---

**Deployment Date:** 2025-12-05
**Branch:** claude/fix-deployment-testing-01DJXu66DgiGzMZT3fVEJkWL
**Environment:** Testing (testing.gopivot.me)
