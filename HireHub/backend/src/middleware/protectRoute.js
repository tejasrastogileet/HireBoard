import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = async (req, res, next) => {
  try {
    // ⭐ DEBUG: Log auth state
    console.log("\n🔍 protectRoute AUTH DEBUG:");
    console.log("   req.auth exists:", !!req.auth);
    if (req.auth) {
      console.log("   req.auth.userId:", req.auth.userId);
      console.log("   req.auth.sessionId:", req.auth.sessionId);
      console.log("   req.auth keys:", Object.keys(req.auth));
    }

    // Get clerkId from req.auth (set by clerkMiddleware)
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      console.error("❌ protectRoute: clerkId is missing! req.auth:", req.auth);
      return res.status(401).json({ 
        message: "Unauthorized - missing or invalid token",
        hasAuth: !!req.auth,
        authKeys: req.auth ? Object.keys(req.auth) : []
      });
    }

    console.log(`✅ protectRoute: Found clerkId: ${clerkId}`);

    // Find the user in MongoDB
    let user = await User.findOne({ clerkId });

    // Create placeholder if not found
    if (!user) {
      console.warn(`⚠️ User with clerkId=${clerkId} not found in DB — creating placeholder.`);

      const placeholderEmail = `${clerkId}@no-email.local`;
      const nameFromAuth = clerkId;
      const profileImage = "";

      user = await User.create({
        clerkId,
        email: placeholderEmail,
        name: nameFromAuth,
        profileImage,
        isAdmin: false,
      });

      console.log(`✅ Created placeholder user: ${user._id} (${user.name})`);
    }

    // Attach user to req
    req.user = user;
    console.log(`✅ req.user attached: ${user._id} (${user.clerkId})`);

    // ⭐ Upsert Stream user (for video + chat)
    try {
      await upsertStreamUser({
        id: user.clerkId,
        name: user.name,
        image: user.profileImage || "",
      });
      console.log(`✅ Stream user upserted: ${user.clerkId}`);
    } catch (streamError) {
      console.error(`⚠️ Stream user upsert failed: ${streamError.message}`);
      // Don't fail the request - Stream issues shouldn't block API access
    }

    next();
  } catch (error) {
    console.error("❌ Error in protectRoute middleware:", error.message);
    console.error("   Stack:", error.stack);
    return res.status(500).json({ 
      message: "Internal Server Error in protectRoute",
      error: process.env.NODE_ENV !== "production" ? error.message : undefined
    });
  }
};
