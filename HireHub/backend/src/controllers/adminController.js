import User from "../models/User.js";

export async function listUsers(req, res) {
  try {
    const users = await User.find().select("name email profileImage clerkId isAdmin createdAt").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function updateUserAdmin(req, res) {
  try {
    const { id } = req.params; // mongodb _id
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(id, { isAdmin: !!isAdmin }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in updateUserAdmin:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
