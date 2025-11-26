# Deployment Steps — Frontend on Vercel, Backend on Railway

This file contains concise, copy-pasteable steps to deploy the frontend to Vercel and the backend to Railway, plus the required environment variables and notes about Socket.IO.

## 1. Prepare repository
- Push your repository to GitHub (the root should contain `frontend/` and `backend/` folders).

## 2. Backend — Railway
1. Create a Railway account (https://railway.app) and sign in.
2. Create a new project → Deploy from GitHub → select your repository and choose the `backend` folder as the service root.
3. Railway will detect Node.js. In the Railway project settings, set environment variables (Secrets):
   - `DB_URL` = your MongoDB connection string (MongoDB Atlas)
   - `CLERK_PUBLISHABLE_KEY` = Clerk publishable key
   - `CLERK_SECRET_KEY` = Clerk secret key
   - `ADMIN_CLERK_IDS` = comma-separated Clerk user IDs that should be admins
   - `CLIENT_URL` = your frontend URL (set after frontend deploy)
   - `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` (only if you use Inngest workflows)
   - Optional: `DISABLE_AUTH=false` (explicitly false for production)
4. If you plan to scale Socket.IO, add `REDIS_URL` and configure the app to use the Redis adapter.
5. Trigger a deploy or let Railway auto-deploy. After deployment Railway will provide a public URL (e.g., `https://your-backend.up.railway.app`).

Notes for Railway
- Use the `start` script for production; Railway runs `npm start` by default. Ensure `package.json` has a `start` script that runs `node src/server.js` (already present).
- If MongoDB Atlas restricts IP access, add Railway's dynamic IP ranges or use VPC peering where supported.

## 3. Frontend — Vercel
1. Create a Vercel account (https://vercel.com) and sign in.
2. Click "New Project" → Import from GitHub → select your repository.
3. When configuring the project set the Root Directory to `frontend` (so Vercel builds only the frontend)
4. Build settings (usually auto-detected):
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables in Vercel (Project → Settings → Environment Variables):
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk publishable key
   - `VITE_ADMIN_CLERK_IDS` = comma-separated Clerk admin IDs
   - `VITE_API_URL` = the Railway backend URL + `/api` (e.g., `https://your-backend.up.railway.app/api`)
6. Deploy. After successful build, Vercel will provide a domain (e.g., `https://your-app.vercel.app`).

Quick local commands to verify production build:
```bash
# frontend
cd frontend
npm install
npm run build
npm run preview
# backend
cd backend
npm install
npm run dev
```

## 4. Socket.IO — Do you need a key?
- No: Socket.IO itself does not require an API key. You host a Socket.IO server on your backend and clients connect to it.
- Secure your socket connections by:
  - Validating authentication (e.g., Clerk session token) in the handshake
  - Restricting allowed origins via CORS (your server already validates origins)
  - Using TLS (HTTPS / WSS)
- If you use a third-party real-time provider (Pusher, Ably, Stream Realtime) then those require API keys.
- For horizontal scaling, use the Socket.IO Redis adapter; Redis will require a `REDIS_URL` secret.

## 5. Environment variables cheat sheet

Backend (Railway):
- `DB_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_CLERK_IDS`
- `CLIENT_URL`
- `INNGEST_EVENT_KEY` (optional)
- `INNGEST_SIGNING_KEY` (optional)
- `DISABLE_AUTH=false`
- `REDIS_URL` (optional, for scaling)

Frontend (Vercel):
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_ADMIN_CLERK_IDS`
- `VITE_API_URL` (point to Railway backend + `/api`)

## 6. Post-deploy checklist
- Update `CLIENT_URL` on Railway to the Vercel domain.
- Update `VITE_API_URL` on Vercel to the Railway backend URL.
- Confirm CORS on backend allows the Vercel domain.
- Sign in via Clerk on production and verify admin access.

---
If you want, I can now:
- Add these env vars to your `.env.example` files, or
- Make a tiny script to print required env vars for copy-paste into Railway/Vercel dashboards.
