import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { listUsers, updateUserAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protectRoute, isAdmin, listUsers);
router.put("/users/:id", protectRoute, isAdmin, updateUserAdmin);

export default router;
