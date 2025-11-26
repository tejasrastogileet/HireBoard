import { chatClient, videoServerClient } from "../lib/stream.js";
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

    // Stream video call
    try {
      await videoServerClient.video.call("default", callId).getOrCreate({
        data: {
          created_by_id: clerkId,
          custom: { problem, difficulty, sessionId: session._id.toString() },
        },
      });
    } catch (err) {
      console.error("Warning: failed to create Stream video call", err);
    }

    // Chat channel
    try {
      const channel = chatClient.channel("messaging", callId, {
        name: `${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId],
      });

      await channel.create();
    } catch (err) {
      console.error("Warning: failed to create Stream chat channel", err);
    }

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
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSessions controller:", error);
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
      await session.populate("participant", "clerkId");
      const existingClerkId = session.participant?.clerkId;

      try {
        const call = videoServerClient.video.call("default", session.callId);
        const callState = await call.get();

        const activeParticipantIds =
          callState?.participants?.map((p) => p.user_id) || callState?.participant_ids || [];

        const exists = activeParticipantIds.includes(existingClerkId);

        if (!exists) {
          session.participant = null;
          await session.save();
        } else {
          return res.status(409).json({ message: "Session is full" });
        }
      } catch (err) {
        console.warn("Stream check failed → clearing participant");
        session.participant = null;
        await session.save();
      }
    }

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

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

    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.removeMembers([clerkId]);
    } catch (err) {
      console.error("Failed to remove member:", err);
    }

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

    const call = videoServerClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

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
        try {
          const call = videoServerClient.video.call("default", session.callId);
          await call.delete({ hard: true });
        } catch {}

        try {
          const channel = chatClient.channel("messaging", session.callId);
          await channel.delete();
        } catch {}

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
