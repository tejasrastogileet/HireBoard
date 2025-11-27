import { addAllowed, removeAllowed } from "../lib/socketStore.js";
import Session from "../models/Session.js";
import AuditLog from "../models/AuditLog.js";

export async function createSession(req, res) {
  try {
    console.log("createSession called - body:", JSON.stringify(req.body));
    console.log("createSession user:", req.user ? { id: req.user._id, clerkId: req.user.clerkId, email: req.user.email } : null);

    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const session = await Session.create({ problem, difficulty, host: userId, callId });

    // Stream chat channel creation removed; chat features disabled
    console.log("ℹ️ Stream chat removed: skipping chat channel creation for session", callId);

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in createSession controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getActiveSessions controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    // Defensive checks + debugging logs to avoid crashes in production
    console.log('\n🔎 getMyRecentSessions DEBUG:');
    console.log('   req.auth exists:', !!req.auth);
    try { console.log('   req.auth:', req.auth); } catch (e) { console.log('   req.auth logging failed'); }
    try { console.log('   req.user:', req.user ? { id: req.user._id, clerkId: req.user.clerkId } : null); } catch (e) { console.log('   req.user logging failed'); }

    if (!req.user || !req.user._id) {
      console.error('❌ getMyRecentSessions: req.user or req.user._id is missing');
      return res.status(401).json({
        message: 'Unauthorized - missing user',
        debug: {
          hasAuth: !!req.auth,
          authKeys: req.auth ? Object.keys(req.auth) : [],
        },
      });
    }

    const userId = req.user._id;
    console.log(`📝 Getting recent sessions for user: ${userId}`);

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`✅ Found ${sessions.length} recent sessions for user: ${userId}`);
    res.status(200).json({ sessions });
  } catch (error) {
    console.error("❌ Error in getMyRecentSessions controller:", error.message);
    console.error("   Stack:", error.stack);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session" });
    }

    if (session.participant) {
      // Without video participant checks, consider session full if a participant exists
      return res.status(409).json({ message: "Session is full" });
    }

    session.participant = userId;
    await session.save();

    // Add participant to Socket.IO allowed list
    addAllowed(session.callId, clerkId);

    // Stream chat removed: skipping adding members to chat channel
    console.log("ℹ️ Stream chat removed: skipping addMembers for", session.callId);

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in joinSession controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function leaveSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (!session.participant) {
      return res.status(400).json({ message: "No participant to remove" });
    }

    if (session.participant.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the participant can leave" });
    }

    // Remove from Socket.IO allowed list
    removeAllowed(session.callId, clerkId);

    // Stream chat removed: skipping removal of members from chat channel
    console.log("ℹ️ Stream chat removed: skipping removeMembers for", session.callId);

    session.participant = null;
    await session.save();

    res.status(200).json({ session, message: "Left session" });
  } catch (error) {
    console.error("Error in leaveSession controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only host can end session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Already completed" });
    }

    // Remove video call deletion (video removed). Keep chat channel cleanup.
    // Stream chat removed: skipping deletion of chat channel
    console.log("ℹ️ Stream chat removed: skipping delete for", session.callId);

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended" });
  } catch (error) {
    console.error("Error in endSession controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}

export async function endAllSessions(req, res) {
  try {
    const clerkId = req.user.clerkId;
    const adminList = (process.env.ADMIN_CLERK_IDS || "").split(",").map((s) => s.trim());

    if (!req.user.isAdmin && !adminList.includes(clerkId)) {
      return res.status(403).json({ message: "Admin only" });
    }

    const sessions = await Session.find({ status: "active" });
    const results = [];

    for (const session of sessions) {
      try {
        // Stream chat removed: skip chat channel deletion and mark session completed
        session.status = "completed";
        await session.save();

        results.push({ sessionId: session._id.toString(), ok: true });
      } catch (err) {
        results.push({ sessionId: session._id.toString(), ok: false, error: err.message });
      }
    }

    try {
      await AuditLog.create({
        action: "end_all_sessions",
        performedBy: clerkId,
        details: { count: results.length, results },
      });
    } catch {}

    res.status(200).json({ message: `Processed ${results.length} sessions`, results });
  } catch (error) {
    console.error("Error in endAllSessions controller:", error);
    const payload = { message: "Internal Server Error" };
    if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
    res.status(500).json(payload);
  }
}
