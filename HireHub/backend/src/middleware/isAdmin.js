import { ENV } from "../lib/env.js";

export const isAdmin = (req, res, next) => {
  try {
    const adminCsv = ENV.ADMIN_CLERK_IDS || process.env.ADMIN_CLERK_IDS || "";
    const admins = adminCsv.split(",").map((s) => s.trim()).filter(Boolean);
    const clerkId = req.user?.clerkId;
    if (!clerkId) return res.status(401).json({ message: "Unauthorized" });
    if (!admins.includes(clerkId)) return res.status(403).json({ message: "Forbidden - admin only" });
    next();
  } catch (e) {
    console.error("isAdmin error", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
