# Access the Dashboard UI

## Dashboard URL

**Once the frontend starts, open in your browser:**
```
http://localhost:3000
```

## What You'll See

### Login Page (First)
- If not logged in, you'll see the login page
- Use your credentials to login
- After login, you'll be redirected to the dashboard

### Dashboard Home (`/`)
- Overview of your websites
- Statistics
- Quick actions

### Available Pages
- **Dashboard** (`/`) - Main dashboard
- **Websites** (`/websites`) - Manage websites
- **Website Detail** (`/websites/:id`) - View/edit website
- **Page Detail** (`/pages/:id`) - Manage pages
- **Section Detail** (`/sections/:id`) - Manage sections (where you can test Polly/Translate!)
- **Analytics** (`/analytics`) - View analytics
- **Settings** (`/settings`) - User settings
- **Installation Guide** (`/installation-guides`) - Installation instructions

## Testing the New Features

### In Section Detail Page
1. Navigate to a website
2. Go to a page
3. Click on a section
4. You'll see:
   - **Generate AI Audio** - Can now use `provider=polly`
   - **Text Translations** - Can use auto-translate
   - **Upload Audio** - Upload audio files

### New Features Available
- ✅ Auto-translate text to target language
- ✅ Generate audio with AWS Polly
- ✅ Combined translate + audio generation

## Frontend Status

The frontend is starting in the background. It usually takes 10-30 seconds.

**Check if it's ready:**
- Open: http://localhost:3000
- If you see a page (even if it's loading), it's working!

## Troubleshooting

### Frontend Won't Start
```bash
cd frontend
npm install  # Install dependencies
npm start    # Start again
```

### Can't Connect to Backend
- Verify backend is running: http://localhost:8001/api/
- Check `.env.local` has: `REACT_APP_BACKEND_URL=http://localhost:8001`

### Login Issues
- Make sure backend is running
- Check MongoDB connection
- Verify credentials are correct

## Quick Access

**Dashboard**: http://localhost:3000
**Backend API**: http://localhost:8001
**API Docs**: http://localhost:8001/docs

