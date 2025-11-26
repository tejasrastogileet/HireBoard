import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = (req, res, next) => {
  console.log("\n🔐 protectRoute CHECKING AUTH...");
  console.log("   req.auth exists:", !!req.auth);
  console.log("   req.auth type:", typeof req.auth);
  
    // Ensure Clerk set req.auth via clerkMiddleware in server.js

  // Development convenience: allow a controlled bypass when DISABLE_AUTH=true
  // This is only allowed when NODE_ENV is not 'production'. Do NOT enable in production.
  if ((!req.auth || !req.auth.userId) && process.env.DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production") {
    const fakeClerk = process.env.DEV_FAKE_CLERK_ID || "dev_user";
    console.warn("⚠️ protectRoute: DISABLE_AUTH active — attaching fake auth user for development:", fakeClerk);
    // Attach a minimal req.auth and continue
    req.auth = { userId: fakeClerk };
  }

  // ❌ If no auth, return 401 immediately
  if (!req.auth || !req.auth.userId) {
    console.error("❌ protectRoute: No authentication found!");
    console.error("   Full req.auth:", JSON.stringify(req.auth, null, 2));
    return res.status(401).json({ 
      message: "Unauthorized - missing authentication token",
      debug: {
        hasAuth: !!req.auth,
        authKeys: req.auth ? Object.keys(req.auth) : []
      }
    });
  }

  const clerkId = req.auth.userId;
  console.log(`✅ protectRoute: Found clerkId: ${clerkId}`);

  // ⭐ Do DB lookup + Stream upsert asynchronously
  (async () => {
    try {
      // Find user in MongoDB
      let user = await User.findOne({ clerkId });

      if (!user) {
        console.warn(`⚠️ User not found, creating placeholder for ${clerkId}`);
        user = await User.create({
          clerkId,
          email: `${clerkId}@no-email.local`,
          name: clerkId,
          profileImage: "",
          isAdmin: false,
        });
        console.log(`✅ Created placeholder user: ${user._id}`);
      }

      // Attach user to request
      req.user = user;
      console.log(`✅ req.user set: ${user._id}`);

      // Upsert Stream user
      try {
        await upsertStreamUser({
          id: user.clerkId,
          name: user.name,
          image: user.profileImage || "",
        });
        console.log(`✅ Stream user upserted`);
      } catch (streamError) {
        console.warn(`⚠️ Stream upsert failed: ${streamError.message}`);
      }

      // Now call the actual route handler
      next();
    } catch (error) {
      console.error("❌ protectRoute async error:", error.message);
      return res.status(500).json({ 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  })();
};
