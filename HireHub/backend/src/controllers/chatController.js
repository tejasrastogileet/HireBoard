import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Get user from req (set by protectRoute middleware)
    if (!req.user) {
      console.error("❌ getStreamToken: req.user is not set");
      return res.status(401).json({ 
        message: "Unauthorized - user not found in request" 
      });
    }

    const clerkId = req.user.clerkId;
    const userName = req.user.name;
    const userImage = req.user.profileImage || req.user.image || null;

    if (!clerkId) {
      console.error("❌ getStreamToken: clerkId missing from user", req.user);
      return res.status(401).json({ 
        message: "Unauthorized - invalid user data" 
      });
    }

    console.log(`📝 Generating Stream token for user: ${clerkId} (${userName})`);
    
    // Use clerkId as the user ID for Stream (must match what was used in upsertStreamUser)
    const token = chatClient.createToken(clerkId);

    if (!token) {
      console.error(`❌ Failed to generate token for ${clerkId}`);
      return res.status(500).json({ 
        message: "Failed to generate Stream token" 
      });
    }

    console.log(`✅ Stream token generated successfully for: ${clerkId}`);

    res.status(200).json({
      token,
      userId: clerkId,
      userName,
      userImage,
    });
  } catch (error) {
    console.error("❌ Error in getStreamToken controller:", error.message);
    const payload = { message: "Failed to generate Stream token" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = error.message || error;
    }
    res.status(500).json(payload);
  }
}
