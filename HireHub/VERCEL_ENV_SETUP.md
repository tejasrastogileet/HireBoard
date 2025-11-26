# 📋 Vercel Environment Variables — Quick Reference

## Copy-Paste Ready for Vercel Dashboard

### Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these three variables:

---

### Variable 1: API URL
```
Name:  VITE_API_URL
Value: https://hireboard-production.up.railway.app/api
```

---

### Variable 2: Clerk Publishable Key
```
Name:  VITE_CLERK_PUBLISHABLE_KEY
Value: pk_test_dmFsdWVkLWNoaWNrZW4tNDUuY2xlcmsuYWNjb3VudHMuZGV2JA
```

---

### Variable 3: Stream API Key
```
Name:  VITE_STREAM_API_KEY
Value: qmusjaangfgqwk297zr7suyzkqqp2fuhce2qaaz5u2p5ny6tcsjuu5was3q6skdk
```

---

## After Adding Variables:

1. Click "Add Environment Variables"
2. Click "Redeploy" in Deployments tab
3. Wait for deployment to complete
4. Test in browser console: Should see `📝 Frontend API Base URL: ...`

---

## If Variables Are Already Set:

Just redeploy:
1. Go to Vercel Dashboard → Deployments
2. Click three dots on latest deployment
3. Select "Redeploy"

---

## Testing After Deployment:

```javascript
// In browser console (DevTools F12):
// Should see:
📝 Frontend API Base URL: https://hireboard-production.up.railway.app/api

// Then try this:
fetch('https://hireboard-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
// Should see: { msg: "API is running!" }
```

✅ If you see both messages → Everything is working!
