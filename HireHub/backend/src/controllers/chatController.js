import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎥 getStreamToken endpoint called");
    console.log(`📍 Path: ${req.path}`);
    console.log(`📍 URL: ${req.originalUrl}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get user from req (set by protectRoute middleware)
    if (!req.user) {
      console.error("❌ getStreamToken: req.user is not set");
      console.error("   req.auth:", req.auth);
      console.error("   This means protectRoute middleware did not run or failed");
      return res.status(401).json({ 
        message: "Unauthorized - user not found in request" 
      });
    }

    const clerkId = req.user.clerkId;
    const userName = req.user.name;
    const userImage = req.user.profileImage || req.user.image || null;

    console.log(`📝 User data from protectRoute:`);
    console.log(`   clerkId: ${clerkId}`);
    console.log(`   userName: ${userName}`);
    console.log(`   userImage: ${userImage ? "present" : "none"}`);

    if (!clerkId) {
      console.error("❌ getStreamToken: clerkId missing from user", req.user);
      return res.status(401).json({ 
        message: "Unauthorized - invalid user data" 
      });
    }

    console.log(`📝 Generating Stream token for user: ${clerkId} (${userName})`);
    
    // Use clerkId as the user ID for Stream (must match what was used in upsertStreamUser)
    let token;
    try {
      token = chatClient.createToken(clerkId);
    } catch (tokenError) {
      console.error(`❌ Stream token creation failed: ${tokenError.message}`);
      console.error("   Stack:", tokenError.stack);
      return res.status(500).json({ 
        message: "Failed to generate Stream token - Stream API error",
        error: process.env.NODE_ENV !== "production" ? tokenError.message : undefined
      });
    }

    if (!token) {
      console.error(`❌ Failed to generate token for ${clerkId} - token is null/undefined`);
      return res.status(500).json({ 
        message: "Failed to generate Stream token - token is empty" 
      });
    }

    console.log(`✅ Stream token generated successfully for: ${clerkId}`);
    console.log(`   Token length: ${token.length} characters\n`);

    const response = {
      token,
      userId: clerkId,
      userName,
      userImage,
    };

    console.log("✅ Sending response to frontend:");
    console.log(`   userId: ${response.userId}`);
    console.log(`   token: ${response.token.substring(0, 20)}...`);
    console.log(`   userName: ${response.userName}\n`);

    res.status(200).json(response);

  } catch (error) {
    console.error("\n❌ UNEXPECTED ERROR in getStreamToken controller:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
    
    const payload = { message: "Failed to generate Stream token" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = error.message || error;
      payload.stack = error.stack;
    }
    res.status(500).json(payload);
  }
}
