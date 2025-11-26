import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { addAllowed, removeAllowed, isAllowed } from "./lib/socketStore.js";
import Session from "./models/Session.js";

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

    // Create HTTP server for Socket.IO
    const http = createServer(app);

    // Helper to validate allowed origins for sockets (allows localhost in dev)
    const socketAllowed = (origin) => {
      if (!origin) return true; // allow non-browser (e.g. server-side) connections

      const allowed = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://hire-board-eexv.vercel.app",
        "https://hire-board.vercel.app",
      ];

      if (allowed.includes(origin)) return true;
      if (origin.endsWith(".vercel.app")) return true;
      return false;
    };

    const io = new Server(http, {
      cors: {
        origin: (origin, callback) => {
          if (socketAllowed(origin)) return callback(null, true);
          console.log("❌ Socket.IO CORS blocked:", origin);
          return callback(new Error("CORS Blocked: " + origin), false);
        },
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    console.log("🔌 Socket.IO server initialized");
    console.log(`📨 CORS origin configured for: ${ENV.CLIENT_URL || "all origins"}`);

    /* Socket.IO Connection Handler */
    io.on("connection", async (socket) => {
      const { room, clerkId } = socket.handshake.query;
      
      console.log(`\n🔗 Socket connection attempt - room: ${room}, clerkId: ${clerkId}`);

      // Validate parameters
      if (!room || !clerkId) {
        console.log("❌ Missing room or clerkId in socket handshake");
        socket.emit("error", "Missing room or clerkId");
        return socket.disconnect();
      }

      // Verify user is allowed in this room
      if (!isAllowed(room, clerkId)) {
        console.log(`❌ User ${clerkId} not present in socketStore for room ${room}. Trying DB fallback.`);

        // DB fallback: if session exists and user is host or participant, allow automatically
        try {
          const sessionDoc = await Session.findOne({ callId: room }).populate("host", "clerkId").populate("participant", "clerkId");
          if (sessionDoc) {
            const hostClerk = sessionDoc.host ? sessionDoc.host.clerkId : null;
            const partClerk = sessionDoc.participant ? sessionDoc.participant.clerkId : null;
            if (clerkId === hostClerk || clerkId === partClerk) {
              console.log(`✅ DB fallback allowed user ${clerkId} for room ${room} (host/participant match)`);
              addAllowed(room, clerkId);
              // continue to allow connection
            } else {
              console.log(`❌ DB fallback did not match host/participant for ${clerkId} in room ${room}`);
              socket.emit("error", "not_allowed");
              return socket.disconnect();
            }
          } else {
            console.log(`❌ No session found with callId ${room} during DB fallback`);
            socket.emit("error", "not_allowed");
            return socket.disconnect();
          }
        } catch (dbErr) {
          console.error("❌ Socket DB fallback error:", dbErr);
          socket.emit("error", "not_allowed");
          return socket.disconnect();
        }
      }

      console.log(`✅ User ${clerkId} joined room ${room}`);
      socket.join(room);
      socket.emit("connected", { room, clerkId });
      io.to(room).emit("user_joined", { clerkId, timestamp: Date.now() });

      /* Message Handler */
      socket.on("message", (data) => {
        const { text } = data;
        if (!text || !text.trim()) return;

        const message = {
          clerkId,
          text: text.trim(),
          timestamp: Date.now()
        };

        console.log(`💬 Message in ${room} from ${clerkId}: ${text.substring(0, 50)}...`);
        io.to(room).emit("message", message);
      });

      /* Code Change Handler */
      socket.on("code_change", (data) => {
        const { code, language } = data;
        console.log(`⌨️  Code change in ${room} from ${clerkId}`);
        io.to(room).emit("code_change", { clerkId, code, language });
      });

      /* Typing Indicator Handler */
      socket.on("typing", (data) => {
        const { isTyping } = data;
        socket.to(room).emit("typing", { clerkId, isTyping });
      });

      /* Disconnect Handler */
      socket.on("disconnect", () => {
        console.log(`🔌 User ${clerkId} disconnected from room ${room}`);
        removeAllowed(room, clerkId);
        io.to(room).emit("user_left", { clerkId, timestamp: Date.now() });
      });

      /* Error Handler */
      socket.on("error", (err) => {
        console.error(`❌ Socket error for ${clerkId} in ${room}:`, err);
      });
    });

    http.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
      console.log(`📍 API URL: ${ENV.CLIENT_URL || "http://localhost:" + ENV.PORT}`);
      console.log(`🔗 WebSocket ready for connections\n`);
    });
  } catch (e) {
    console.error("❌ Server start error:", e.message);
    process.exit(1);
  }
};

start();
