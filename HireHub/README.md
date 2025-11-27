# HireBoard - Collaborative Coding Interview Platform

A full-stack platform for practicing coding problems, collaborating in real-time pair-programming sessions with a shared code editor, chatting via Socket.IO, and managing custom problems through an admin dashboard.

## 🚀 Live Deployment

- **Frontend**: https://hire-board.vercel.app
- **Backend API**: https://hireboard-production.up.railway.app/api
- **Backend Health**: https://hireboard-production.up.railway.app/health

## Core Features

- **Practice Problems**: Browse and solve curated plus admin-created coding problems with starter code and difficulty levels.
- **Live Pair-Programming Sessions**: Invite collaborators via code and work together in a shared, real-time code editor.
- **Real-time Chat**: Socket.IO-based in-session messaging for instant collaboration and discussion.
- **Admin Dashboard**: Create, edit, and delete problems with full control over title, difficulty, description, and starter code.
- **User Roles & Permissions**: Admin/user permission system for managing users and problem access.
- **Dark Mode**: Persistent theme toggle using DaisyUI.
- **Clerk Authentication**: Secure auth with development bypass helpers for local testing.

## Tech Stack

### Backend
- **Node.js + Express**: REST API server
- **MongoDB + Mongoose**: Database for users, problems, sessions, and audit logs
- **Socket.IO**: Real-time bidirectional communication for sessions
- **Clerk**: Authentication and user management
- **Inngest**: Workflow orchestration

### Frontend
- **React 19 + Vite**: Fast, modern frontend with hot module replacement
- **React Router**: Client-side routing
- **Clerk React**: Authentication UI
- **DaisyUI + Tailwind CSS**: Component library and styling
- **socket.io-client**: WebSocket client for real-time updates
- **Axios**: HTTP client for API calls
- **react-hot-toast**: Toast notifications

Project structure
```
HireHub/
├── backend/ (Express + Socket.IO)
├── frontend/ (Vite + React)
└── package.json (workspace)
```

Local development
1) Backend
```bash
cd HireHub/backend
npm install
```
Create `backend/.env` (example):
```
PORT=3000
NODE_ENV=development
DB_URL=mongodb+srv://YOUR_MONGODB_USERNAME:YOUR_MONGODB_PASSWORD@cluster.mongodb.net/hirehub
CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
ADMIN_CLERK_IDS=YOUR_CLERK_USER_ID
CLIENT_URL=http://localhost:5173
INNGEST_EVENT_KEY=YOUR_INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY=YOUR_INNGEST_SIGNING_KEY
# Optional dev helpers:
DISABLE_AUTH=false
DEV_FAKE_CLERK_ID=dev_user
```
Start backend:
```bash
npm run dev
```

2) Frontend
```bash
cd HireHub/frontend
npm install
```
Create `frontend/.env` (example):
```
VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_CLERK_IDS=YOUR_CLERK_USER_ID
```
Start frontend:
```bash
npm run dev
```

## Deployment

### Production Checklist
- Set `NODE_ENV=production`
- Ensure `ADMIN_CLERK_IDS` env var is configured
- Disable `DISABLE_AUTH` flag (or keep unset)
- Use production Clerk keys
- Database connection string should point to production DB
- `CLIENT_URL` should point to deployed frontend URL
- `BACKEND_URL` should point to deployed backend URL
- For scalability: replace in-memory socketStore with Redis

### Deploying to Railway (Backend)

1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `DB_URL` (MongoDB connection string)
   - `CLERK_PUBLISHABLE_KEY` (from Clerk dashboard)
   - `CLERK_SECRET_KEY` (from Clerk dashboard)
   - `ADMIN_CLERK_IDS` (your Clerk user ID)
   - `CLIENT_URL=https://hire-board.vercel.app` (or your Vercel frontend URL)
   - `BACKEND_URL=https://hireboard-production.up.railway.app` (or your Railway backend URL)
   - `INNGEST_EVENT_KEY` (from Inngest dashboard)
   - `INNGEST_SIGNING_KEY` (from Inngest dashboard)
4. Railway will auto-detect Node.js and start the server

### Deploying to Vercel (Frontend)

1. Connect Vercel to GitHub repo
2. Set root directory: `HireHub/frontend`
3. Set environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY` (from Clerk dashboard)
   - `VITE_API_URL=https://hireboard-production.up.railway.app/api` (or your backend URL)
   - `VITE_ADMIN_CLERK_IDS` (your Clerk user ID)
4. Deploy (Vercel will auto-detect Vite and build)

Socket.IO notes
- Socket.IO does not require an API key. Secure connections by validating auth during handshake, using CORS, and enabling TLS.
- For horizontal scaling, add a Redis adapter and provide `REDIS_URL` to share socket state.
License: MIT
- **Node.js + Express**: REST API server
- **MongoDB + Mongoose**: Database for users, problems, sessions, and audit logs
- **Socket.IO**: Real-time bidirectional communication for sessions
- **Clerk**: Authentication and user management
- **Stream Chat SDK**: Chat messaging backend
- **Inngest**: Workflow orchestration

### Frontend
- **React 19 + Vite**: Fast, modern frontend with hot module replacement
- **React Router**: Client-side routing
- **Clerk React**: Authentication UI
- **DaisyUI + Tailwind CSS**: Component library and styling
- **socket.io-client**: WebSocket client for real-time updates
- **Axios**: HTTP client for API calls
- **react-hot-toast**: Toast notifications

## Project Structure

```
HireHub/
├── backend/
│   ├── src/
│   │   ├── server.js                 # Express + Socket.IO setup
│   │   ├── controllers/              # Business logic for routes
│   │   ├── models/                   # Mongoose schemas
│   │   ├── routes/                   # API endpoint definitions
│   │   ├── middleware/               # Auth and admin checks
│   │   └── lib/                      # Utilities (DB, env, socket store)
│   ├── package.json
│   └── .env                          # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/                    # Page components (Dashboard, Problems, Admin, etc.)
│   │   ├── components/               # Reusable UI components
│   │   ├── api/                      # API helper functions
│   │   ├── hooks/                    # Custom React hooks (useSocket, etc.)
│   │   ├── lib/                      # Utilities (axios config, piston, etc.)
│   │   ├── data/                     # Static problem data
│   │   └── contexts/                 # React context (theme, etc.)
│   ├── vite.config.js
│   ├── package.json
│   └── .env                          # Frontend environment variables
└── package.json                      # Root workspace (npm workspaces)
```

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Clerk account for auth keys

### Backend Setup

1. Install dependencies:
```bash
cd HireHub/backend
npm install
```

2. Create `.env` file:
```
PORT=3000
NODE_ENV=development
DB_URL=mongodb+srv://[your_connection_string]
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
ADMIN_CLERK_IDS=your_clerk_id_for_testing
CLIENT_URL=http://localhost:5173
```

3. Start the backend:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Install dependencies:
```bash
cd HireHub/frontend
npm install
```

2. Create `.env` file:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_CLERK_IDS=your_clerk_id_for_testing
```

3. Start the frontend:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## API Routes

### Sessions (`/api/sessions`)
- `GET /my-recent` - Get user's recent sessions (protected)
- `GET /:id` - Get session by ID (protected)
- `POST /:id/join` - Join a session (protected)
- `POST /:id/leave` - Leave a session (protected)
- `POST /:id/end` - End session (host only)
- `POST /end-all` - End all sessions (admin only)

### Problems (`/api/problems`)
- `GET /` - Get all problems (protected)
- `GET /:id` - Get problem by ID (protected)
- `POST /` - Create problem (admin only)
- `PUT /:id` - Update problem (admin only)
- `DELETE /:id` - Delete problem (admin only)

### Admin (`/api/admin`)
- `GET /users` - List all users (admin only)
- `PUT /users/:id` - Update user admin status (admin only)

### Chat (`/api/chat`)
- Stream Chat API proxy endpoints

## Real-time Events (Socket.IO)

### Connection Query Parameters
- `room`: Session call ID
- `clerkId`: User's Clerk ID

### Events
- `connected` - Confirmation of socket connection
- `message` - Send/receive chat messages
- `user_joined` - User joined the session
- `user_left` - User left the session
- `code_change` - Code editor update
- `typing` - Typing indicator
- `error` - Connection or validation errors

## Key Features Explained

### Admin Panel
- Create new problems with title, difficulty, category, description, and starter code
- Edit existing problems
- Delete problems
- Manage user permissions (promote/demote admins)

### Problem Page
- View problem details (description, examples, constraints)
- Code editor with starter code
- Run code against test cases (via Piston API)
- Session creation to invite another user

### Session Page
- Real-time chat with other participant
- Shared code editor (updates broadcast via Socket.IO)
- Typing indicators
- User join/leave notifications

### Dark Mode
- Persistent theme preference using DaisyUI
- Toggle in navbar

## Development Features

### Local-First Configuration
- Frontend defaults to `http://localhost:3000/api` if `VITE_API_URL` not set
- Backend supports `DISABLE_AUTH=true` for dev bypass (dev only)
- In-memory socket store (socketStore) for session access control

### Database Fallback
- Socket.IO validates users against in-memory allowed list
- Falls back to MongoDB to check if user is host/participant of session
- Survives temporary socket store misses

### Comprehensive Logging
- Backend logs all API requests, auth checks, and socket events
- Frontend logs API calls and socket connection status
- Errors include debug details in development

## Deployment

### Production Checklist
- Set `NODE_ENV=production`
- Ensure `ADMIN_CLERK_IDS` env var is configured
- Disable `DISABLE_AUTH` flag (or keep unset)
- Use production Clerk keys
- Database connection string should point to production DB
- `CLIENT_URL` should point to deployed frontend URL
- For scalability: replace in-memory socketStore with Redis

### Deploying to Railway/Vercel

**Backend (Railway):**
1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard
4. Railway will auto-detect Node.js and start the server

**Frontend (Vercel):**
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Add environment variables: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`, `VITE_ADMIN_CLERK_IDS`
4. Deploy

## Scripts

### Backend
- `npm run dev` - Start dev server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Troubleshooting

### Socket.IO connection fails
- Ensure backend is running on `http://localhost:3000`
- Check browser console for CORS errors
- Verify `VITE_API_URL` matches backend URL in frontend `.env`

### 401 Unauthorized on protected routes
- Ensure user is signed in via Clerk
- Check browser cookies have Clerk session token
- Verify `CLERK_SECRET_KEY` is set correctly

### Admin features not showing
- Set `VITE_ADMIN_CLERK_IDS` to your Clerk user ID in frontend `.env`
- Refresh the browser after changing env
- Or set `ADMIN_CLERK_IDS` in backend `.env` and toggle admin via API

### Database connection errors
- Verify MongoDB connection string in `DB_URL`
- Check network access is enabled in MongoDB Atlas
- Ensure IP whitelist includes your development machine

## Future Enhancements

- Redis-backed socket store for horizontal scaling
- Code execution engine (Piston API integration)
- Video call integration
- Problem difficulty-based recommendations
- User leaderboard and statistics
- Test case management per problem
- Workspace/team management
- Code submission history

## License

MIT License

## Support

For issues, questions, or contributions, please open an issue or pull request on GitHub.
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
