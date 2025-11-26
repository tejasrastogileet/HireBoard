# 🔧 HireHub Debugging Guide

## ✅ Fixes Applied

### Backend Fixes
1. **Stream SDK initialization** - Added comprehensive error logging
2. **ProtectRoute middleware** - Enhanced with detailed logging
3. **Chat token endpoint** - Added validation and error handling
4. **Server startup** - Added startup logging for all components
5. **Environment variables** - Fixed `CLIENT_URL` to point to Vercel frontend
6. **Stream user operations** - Added detailed error tracking

### Frontend Fixes
1. **useStreamClient hook** - Added detailed logging for all steps
2. **Stream client initialization** - Better error messages
3. **Token fetching** - Validation at each step
4. **Cleanup handling** - Better resource management

---

## 🚀 How to Debug Issues

### Step 1: Check Backend Logs
When the backend starts, you should see:
```
🚀 HireHub Backend Starting...
📌 Environment: production
📌 Port: 3000
✅ JSON middleware loaded
✅ CORS middleware loaded
✅ Clerk middleware loaded
✅ Inngest routes registered
✅ Chat routes registered
✅ Session routes registered
✅ Problem routes registered
✅ Admin routes registered
✅ Health check route registered
📚 Connecting to Database...
✅ Database connected successfully

✅ Stream SDK initialization starting...
   API Key: tnunf59ndf7q...
✅ Chat client initialized successfully
✅ Video server client initialized successfully

🚀 Server running on port 3000
📍 API URL: https://hire-board-eexv.vercel.app
```

**If you see errors here, fix them before proceeding.**

---

### Step 2: Check User Authentication Flow
In backend logs, when a user makes a request, you should see:
```
🔐 protectRoute: Processing request for clerkId: user_xxxxx
✅ User attached to request: user_xxxxx (John Doe)
✅ Stream user upsert completed for: user_xxxxx
```

**If Stream user upsert fails:**
- Check that `STREAM_API_KEY` and `STREAM_API_SECRET` are correct
- Verify the user has a valid Clerk ID

---

### Step 3: Check Token Generation
When requesting `/api/chat/token`, backend should log:
```
📝 Generating Stream token for user: user_xxxxx (John Doe)
✅ Stream token generated successfully for: user_xxxxx
```

**If token generation fails:**
- Check `req.user` is set properly (from protectRoute)
- Verify `clerkId` is not empty
- Check Stream API credentials

---

### Step 4: Check Frontend Stream Initialization
In browser console, you should see:
```
📝 useStreamClient: Fetching Stream token...
✅ Token received for user: user_xxxxx (John Doe)
📝 Initializing Stream Video client...
✅ Stream Video client initialized
📝 Joining video call: session_xxx...
✅ Joined video call successfully
📝 Initializing Stream Chat client...
📝 Connecting chat user: user_xxxxx...
✅ Chat client connected
📝 Watching chat channel: session_xxx...
✅ useStreamClient initialization complete
```

---

## 🔴 Common Issues & Solutions

### Issue 1: "User token is not set"
**Cause:** Token is undefined or null from backend
**Solution:**
1. Check backend logs for token generation errors
2. Verify `/api/chat/token` endpoint is returning data
3. Check Clerk authentication is working
4. Verify `protectRoute` middleware is executing

**Debug steps:**
```javascript
// In browser console
const res = await fetch('https://hireboard-production.up.railway.app/api/chat/token', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  credentials: 'include'
});
console.log(await res.json()); // Should show token, userId, etc.
```

---

### Issue 2: "The 'id' field on the user is missing"
**Cause:** User object doesn't have `id` property
**Solution:**
1. Ensure backend returns `userId` in token response
2. Check frontend passes `id: userId` to `initializeStreamClient`
3. Verify `userId` is not undefined

**Frontend check:**
```javascript
// In useStreamClient hook
console.log('Token response:', { token, userId, userName, userImage });
// Should show userId as a string like "user_xxxxx"
```

---

### Issue 3: "CORS policy blocked"
**Cause:** Origin not in CORS whitelist
**Solution:**
1. Check current Vercel preview URL
2. Add it to backend CORS whitelist (already has `*.vercel.app`)
3. Verify `withCredentials: true` in frontend axios

**Backend fix location:**
```javascript
// src/server.js - CORS configuration
const allowed = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://hire-board-eexv.vercel.app"
];
```

---

### Issue 4: "Failed to upsert Stream user"
**Cause:** Stream API credentials are wrong
**Solution:**
1. Verify `STREAM_API_KEY` and `STREAM_API_SECRET` in `.env`
2. Check they match Stream Dashboard
3. Regenerate keys if needed

**Verification:**
```bash
# Backend
echo $STREAM_API_KEY
echo $STREAM_API_SECRET

# Frontend
echo $VITE_STREAM_API_KEY
```

---

### Issue 5: "Backend is down → ERR_FAILED"
**Cause:** Backend crashes during startup
**Solution:**
1. Check all environment variables are set
2. Check MongoDB connection string is valid
3. Check Clerk keys are correct
4. Look for errors in startup logs

**Restart backend:**
```bash
cd backend
npm install # Install dependencies
npm start   # Start server
```

---

## 🧪 Testing the Flow

### Full Test Flow:
1. **Frontend loads:**
   - Check browser console for no auth errors
   - Login with Clerk

2. **Create session:**
   - Click "Create Session" button
   - Check backend logs for session creation
   - Check database for new session

3. **Join video call:**
   - Go to session page
   - Check browser console for Stream initialization logs
   - Verify video window loads
   - Check backend logs for token generation

4. **Send chat message:**
   - Type in chat box
   - Verify message appears for both users
   - Check Stream chat logs

---

## 📊 Logging Checklist

### Backend Checklist
- [ ] All middleware loads successfully
- [ ] Database connects
- [ ] Stream SDK initializes
- [ ] User authentication works
- [ ] Token generation succeeds
- [ ] Stream user upsert works

### Frontend Checklist
- [ ] Clerk authentication loads
- [ ] API calls succeed (check Network tab)
- [ ] Token response has all fields
- [ ] Stream client initializes
- [ ] Video call connects
- [ ] Chat connects

---

## 🚀 Quick Start for Debugging

```bash
# Terminal 1: Backend
cd backend
npm install
npm start
# Watch for startup logs

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Navigate to http://localhost:5173

# Terminal 3: Monitor backend logs
tail -f backend-logs.txt  # If you set up logging
```

---

## 📝 Environment Variables Checklist

### Backend (.env)
```
PORT=3000
NODE_ENV=production
DB_URL=mongodb+srv://...
STREAM_API_KEY=tnunf59ndf7q
STREAM_API_SECRET=qmusjaangfgqwk297zr7suyzkqqp2fuhce2qaaz5u2p5ny6tcsjuu5was3q6skdk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLIENT_URL=https://hire-board-eexv.vercel.app
```

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://hireboard-production.up.railway.app/api
VITE_STREAM_API_KEY=qmusjaangfgqwk297zr7suyzkqqp2fuhce2qaaz5u2p5ny6tcsjuu5was3q6skdk
```

---

## 🆘 When All Else Fails

1. **Clear browser cache:**
   - DevTools → Application → Clear Storage → Clear All

2. **Rebuild frontend:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Rebuild backend:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

4. **Check Railway logs:**
   - Go to Railway dashboard
   - Click your project
   - Check Logs for errors

5. **Check Vercel logs:**
   - Go to Vercel dashboard
   - Click your project
   - Check Deployments for build errors

---

## 📞 Support

If you still have issues:
1. Collect all logs (backend + frontend + browser)
2. Check the exact error message
3. Cross-reference with this guide
4. Search for that error + "Stream SDK" or "Clerk"
