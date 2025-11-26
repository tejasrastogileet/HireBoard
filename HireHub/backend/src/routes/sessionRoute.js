import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  leaveSession,
  endAllSessions,
} from "../controllers/sessionController.js";

const router = express.Router();

/* ---------------------------------------
   PUBLIC ROUTES (NO CLERK)
----------------------------------------*/
router.get("/active", getActiveSessions);

/* ---------------------------------------
   PROTECTED ROUTES (MUST come AFTER public routes)
----------------------------------------*/
router.get("/my-recent", protectRoute, getMyRecentSessions);
router.post("/", protectRoute, createSession);
router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/leave", protectRoute, leaveSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/end-all", protectRoute, endAllSessions);

router.get("/preview/end-all", protectRoute, async (req, res) => {
  try {
    const clerkId =
      typeof req.auth === "function" ? req.auth().userId : req.auth?.userId;

    const adminList = (process.env.ADMIN_CLERK_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!req.user.isAdmin && !adminList.includes(clerkId)) {
      return res.status(403).json({ message: "Forbidden - admin only" });
    }

    const count = await (
      await import("../models/Session.js")
    ).default.countDocuments({ status: "active" });

    res.status(200).json({ count });
  } catch (err) {
    console.error("Error in preview end-all route:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
