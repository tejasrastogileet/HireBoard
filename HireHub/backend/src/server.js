import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import problemRoutes from "./routes/problemRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

console.log("🚀 HireHub Backend Starting...");
console.log(`📌 Environment: ${ENV.NODE_ENV}`);
console.log(`📌 Port: ${ENV.PORT}`);

/* ----------------------------------------------------------
   1) JSON middleware
----------------------------------------------------------- */
app.use(express.json());
console.log("✅ JSON middleware loaded");

/* ----------------------------------------------------------
   2) GLOBAL OPTIONS HANDLER (Clerk ko skip karta hai)
----------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    // ⭐⭐⭐ FINAL FIX ⭐⭐⭐
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, Accept"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    return res.sendStatus(200);
  }
  next();
});

/* ----------------------------------------------------------
   3) CORS (allow localhost + main domain + ALL previews)
----------------------------------------------------------- */
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      const allowed = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://hire-board-eexv.vercel.app",
          "https://hire-board.vercel.app" 
      ];

      if (allowed.includes(origin)) return cb(null, true);
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      console.log("❌ CORS Blocked:", origin);
      return cb(new Error("CORS Blocked: " + origin), false);
    },
    credentials: true,
  })
);
console.log("✅ CORS middleware loaded");

/* ----------------------------------------------------------
   4) CLERK — MUST come AFTER CORS + OPTIONS
----------------------------------------------------------- */
app.use(clerkMiddleware());
console.log("✅ Clerk middleware loaded");

/* ----------------------------------------------------------
   4.5) REQUEST LOGGING (for debugging)
----------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log(`\n📨 API Request: ${req.method} ${req.path}`);
    console.log(`   Full URL: ${req.originalUrl}`);
  }
  next();
});

/* ----------------------------------------------------------
   5) API ROUTES
----------------------------------------------------------- */
app.use("/api/inngest", serve({ client: inngest, functions }));
console.log("✅ Inngest routes registered");

app.use("/api/chat", chatRoutes);
console.log("✅ Chat routes registered");

app.use("/api/sessions", sessionRoutes);
console.log("✅ Session routes registered");

app.use("/api/problems", problemRoutes);
console.log("✅ Problem routes registered");

app.use("/api/admin", adminRoutes);
console.log("✅ Admin routes registered");

/* ----------------------------------------------------------
   6) HEALTH CHECK
----------------------------------------------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "API is running!" });
});
console.log("✅ Health check route registered");

/* ----------------------------------------------------------
   7) RAILWAY BACKEND-ONLY
----------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("HireBoard Backend Running");
});

/* ----------------------------------------------------------
   8) 404 Handler
----------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

/* ----------------------------------------------------------
   START SERVER
----------------------------------------------------------- */
const start = async () => {
  try {
    console.log("\n📚 Connecting to Database...");
    await connectDB();
    console.log("✅ Database connected successfully\n");

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
      console.log(`📍 API URL: ${ENV.CLIENT_URL || "http://localhost:" + ENV.PORT}`);
    });
  } catch (e) {
    console.error("❌ Server start error:", e.message);
    process.exit(1);
  }
};

start();
