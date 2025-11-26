<h1 align="center">✨ HireBoard — Full-Stack Interview Platform ✨</h1>

✨ Highlights:

- 🧑‍💻 VSCode-Powered Code Editor  
- 🔐 Authentication via Clerk  
- 🎥 1-on-1 Video Interview Rooms  

# HireBoard — Full-Stack Interview Platform

HireBoard is a full-stack interview and practice platform combining a collaborative code editor, live video interview rooms, real-time chat, and secure code execution for automated problem testing.

**Key features:**
- **Interactive Code Editor** powered by Monaco (VSCode) with language support (JS, TS, Python, C++, etc.)
- **Authentication** using Clerk (email/social auth + user avatars)
- **Live Video Rooms** with camera/mic toggles, screen share and recording
- **Real-time Chat** and session controls (room locking, participant management)
- **Secure Code Execution** via an isolated runner (Piston or configured executor)
- **Practice Problems** with auto-test evaluation and output comparison
- **Admin Panel** for problems and sessions management (protected by Clerk admin IDs)
- **Background Jobs** via Inngest for async tasks

---

**Repo layout (top-level)**

- `backend/` — Express API, MongoDB models, auth, background jobs  
- `frontend/` — React + Vite SPA, components, pages, Tailwind + daisyUI  
- `README.md` — this file  

---

**Tech stack**

- Frontend: React, Vite, Tailwind CSS + daisyUI, Monaco Editor, Clerk React  
- Backend: Node.js, Express, Mongoose (MongoDB), Inngest, Stream, Clerk  
- Dev tooling: TanStack Query, Axios, ESLint, Prettier  

---

**Environment & Configuration**

Backend (`backend/.env`):

```env
PORT=3000
NODE_ENV=development
DB_URL=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

ADMIN_CLERK_IDS=user_xxx,user_yyy
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
Frontend (frontend/.env):

env
Copy code
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=your_stream_api_key
VITE_ADMIN_CLERK_IDS=user_xxx,user_yyy
Local Development

Backend:

powershell
Copy code
cd backend
npm install
npm run dev
Frontend:

powershell
Copy code
cd frontend
npm install
npm run dev
Open: http://localhost:5173

Deployment Notes

Backend → any Node hosting

Frontend → Vercel / Netlify / Cloudflare Pages

Keep .env secret

Troubleshooting

Clerk keys

Stream API

Theme context for editor

Contributing

Fork

Feature branch

Code

PR

Roadmap

Better mobile layout

E2E tests

SSO + RBAC

License

MIT or your choice.

yaml
Copy code
