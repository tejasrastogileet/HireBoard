import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = (req, res, next) => {
  console.log("\n🔐 protectRoute CHECKING AUTH...");
  console.log("   req.auth exists:", !!req.auth);
  console.log("   req.auth type:", typeof req.auth);
  
    // ----- DEV BYPASS: DISABLE_AUTH=true -----
    // If you want a quick way to run the server without Clerk, set
    // the environment variable `DISABLE_AUTH=true` in Railway or locally.
    // The middleware will create/attach a placeholder dev user so the
    // rest of the app can run as if authenticated.
    if (process.env.DISABLE_AUTH === "true") {
      const devClerkId = req.headers["x-dev-clerk"] || "dev_user_local";
      console.log(`⚠️ DISABLE_AUTH mode active — attaching dev user: ${devClerkId}`);

      (async () => {
        try {
          let user = await User.findOne({ clerkId: devClerkId });
          if (!user) {
            user = await User.create({
              clerkId: devClerkId,
              email: `${devClerkId}@no-email.local`,
              name: devClerkId,
              profileImage: "",
              isAdmin: true,
            });
            console.log(`✅ Created dev placeholder user: ${user._id}`);
          }

          req.user = user;
          // Best-effort Stream upsert, do not block on failure
          try {
            await upsertStreamUser({ id: user.clerkId, name: user.name, image: user.profileImage || "" });
            console.log("✅ Stream user upserted for dev user");
          } catch (e) {
            console.warn("⚠️ Stream upsert failed for dev user:", e.message);
          }

          next();
        } catch (err) {
          console.error("❌ DEV protectRoute error:", err.message);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      })();

      return;
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
