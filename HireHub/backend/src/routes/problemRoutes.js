import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from "../controllers/problemController.js";

const router = express.Router();

router.get("/", protectRoute, getProblems);
router.post("/", protectRoute, isAdmin, createProblem);

router.get("/:id", protectRoute, getProblemById);
router.put("/:id", protectRoute, isAdmin, updateProblem);
router.delete("/:id", protectRoute, isAdmin, deleteProblem);

export default router;
