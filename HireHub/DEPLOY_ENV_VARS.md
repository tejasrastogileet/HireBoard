# Env var lists for quick copy-paste

Below are ready-to-paste key=value lists for Railway (backend) and Vercel (frontend). Use the Railway list in Railway's project settings and the Vercel list in Vercel's Environment Variables for your project.

## Railway (Backend) — paste into Railway Secrets
DB_URL=YOUR_MONGODB_CONNECTION_STRING
CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
ADMIN_CLERK_IDS=CLERK_ID_1,CLERK_ID_2
CLIENT_URL=https://your-frontend-domain.vercel.app
INNGEST_EVENT_KEY=YOUR_INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY=YOUR_INNGEST_SIGNING_KEY
DISABLE_AUTH=false
# Optional (for scaling)
REDIS_URL=redis://user:pass@host:port

## Vercel (Frontend) — paste into Vercel Environment Variables
VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
VITE_ADMIN_CLERK_IDS=CLERK_ID_1,CLERK_ID_2
VITE_API_URL=https://your-backend.up.railway.app/api

Notes:
- For production, set `DISABLE_AUTH=false` and use production Clerk keys.
- `VITE_API_URL` should point to your Railway backend URL (append `/api` if your backend exposes routes under `/api`).
- Keep these secrets private and do not commit real credentials to the repo.
