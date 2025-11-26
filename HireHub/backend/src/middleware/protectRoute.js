import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  // ⭐ 1) Skip auth on OPTIONS (CORS preflight)
  (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    next();
  },

  // ⭐ 2) Now apply Clerk authentication
  requireAuth(),

  // ⭐ 3) Our middleware
  async (req, res, next) => {
    try {
      const auth = typeof req.auth === "function" ? req.auth() : req.auth;
      const clerkId = auth?.userId;

      if (!clerkId) {
        console.error("❌ protectRoute: clerkId is missing from auth", auth);
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      console.log(`🔐 protectRoute: Processing request for clerkId: ${clerkId}`);

      // Find the user in MongoDB
      let user = await User.findOne({ clerkId });

      // Create placeholder if not found
      if (!user) {
        console.warn(`⚠️ User with clerkId=${clerkId} not found in DB — creating placeholder.`);

        const placeholderEmail = `${clerkId}@no-email.local`;
        const nameFromAuth = auth?.first_name || auth?.name || clerkId;
        const profileImage = auth?.image_url || "";

        user = await User.create({
          clerkId,
          email: placeholderEmail,
          name: nameFromAuth,
          profileImage,
          isAdmin: false,
        });

        console.log(`✅ Created placeholder user: ${user._id} (${user.name})`);
      }

      // attach user to req
      req.user = user;

      console.log(`✅ User attached to request: ${user.clerkId} (${user.name})`);

      // ⭐ 4) Upsert Stream user (for video + chat)
      try {
        await upsertStreamUser({
          id: user.clerkId,
          name: user.name,
          image: user.profileImage || "",
        });
        console.log(`✅ Stream user upsert completed for: ${user.clerkId}`);
      } catch (streamError) {
        console.error(`⚠️ Stream user upsert failed: ${streamError.message}`);
        // Don't fail the request - Stream issues shouldn't block API access
        // But the token endpoint will fail if Stream user is not available
      }

      next();
    } catch (error) {
      console.error("❌ Error in protectRoute middleware:", error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
