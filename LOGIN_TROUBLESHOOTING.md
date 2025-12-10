# Login Troubleshooting Guide

## ✅ Verified Working
- Backend server is running on `http://localhost:8001`
- Backend login endpoint works (tested with curl)
- User exists: `katherine@dozanu.com`
- Password: `pivot2025`
- Frontend backend URL: `http://localhost:8001` (correct)

## 🔍 Debug Steps

### 1. Check Browser Console
1. Open `http://localhost:3000` in your browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Try to login with:
   - Email: `katherine@dozanu.com`
   - Password: `pivot2025`
5. Look for debug messages:
   - 🔐 Attempting login...
   - ✅ Login successful! (if it works)
   - ❌ Login error: (if it fails)

### 2. Check Network Tab
1. In Developer Tools, go to the **Network** tab
2. Try to login again
3. Look for the `/api/auth/login` request
4. Check:
   - **Status Code**: Should be 200 (success) or 401 (wrong password)
   - **Request Payload**: Should show your email and password
   - **Response**: Should show the error message if it fails

### 3. Common Issues

#### Issue: "Network Error" or "Failed to fetch"
- **Cause**: Backend server not running or wrong URL
- **Fix**: 
  ```bash
  cd backend
  python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
  ```

#### Issue: "Invalid credentials" (401)
- **Cause**: Wrong password
- **Fix**: Use password `pivot2025` (all lowercase)

#### Issue: CORS Error
- **Cause**: Backend CORS not configured correctly
- **Fix**: Backend already includes `http://localhost:3000` in CORS origins

#### Issue: No error message, just doesn't work
- **Cause**: Frontend error handling might be swallowing the error
- **Fix**: Check browser console for the debug messages we added

### 4. Manual Test
Test the backend directly:
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"katherine@dozanu.com","password":"pivot2025"}'
```

Should return:
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {...}
}
```

### 5. Clear Browser Cache
Sometimes old tokens or cached data can cause issues:
1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear **Local Storage**
4. Try logging in again

## 📝 What to Share
If login still doesn't work, please share:
1. The exact error message you see
2. Browser console output (all messages)
3. Network tab details for the `/api/auth/login` request
4. Any other error messages

