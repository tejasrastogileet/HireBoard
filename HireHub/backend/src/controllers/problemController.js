import Problem from "../models/Problem.js";
import { z } from "zod";

const exampleSchema = z.object({
  input: z.string().optional(),
  output: z.string().optional(),
  explanation: z.string().optional(),
});

const problemSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(3),
  difficulty: z.enum(["Easy", "Medium", "Hard", "easy", "medium", "hard"]),
  category: z.string().optional(),
  description: z
    .object({ text: z.string().optional(), notes: z.array(z.string()).optional() })
    .optional(),
  examples: z.array(exampleSchema).optional(),
  constraints: z.array(z.string()).optional(),
  starterCode: z.record(z.string()).optional(),
  expectedOutput: z.record(z.string()).optional(),
});

const problemUpdateSchema = problemSchema.partial();

export async function createProblem(req, res) {
  try {
    // validate payload
    const parsed = problemSchema.parse(req.body);
    const payload = parsed;
    // ensure a slug exists (simple fallback)
    if (!payload.slug && payload.title) {
      payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    payload.createdBy = req.user?.clerkId || null;

    const problem = await Problem.create(payload);
    res.status(201).json({ problem });
  } catch (error) {
    console.error("Error in createProblem:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation Error", issues: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function getProblems(req, res) {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.status(200).json({ problems });
  } catch (error) {
    console.error("Error in getProblems:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function getProblemById(req, res) {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.status(200).json({ problem });
  } catch (error) {
    console.error("Error in getProblemById:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function updateProblem(req, res) {
  try {
    const { id } = req.params;
    // validate partial update
    const parsed = problemUpdateSchema.parse(req.body);
    const updated = await Problem.findByIdAndUpdate(id, parsed, { new: true });
    if (!updated) return res.status(404).json({ message: "Problem not found" });
    res.status(200).json({ problem: updated });
  } catch (error) {
    console.error("Error in updateProblem:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation Error", issues: error.errors });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function deleteProblem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Problem.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Problem not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("Error in deleteProblem:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
