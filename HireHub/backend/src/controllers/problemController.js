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
  starterCode: z.union([z.record(z.string()), z.string()]).optional(),
  expectedOutput: z.record(z.string()).optional(),
});

const problemUpdateSchema = problemSchema.partial();

export async function createProblem(req, res) {
  try {
    console.log('\n🛠 createProblem called');
    console.log('   req.auth exists:', !!req.auth);
    try { console.log('   req.auth:', req.auth); } catch (e) { console.log('   req.auth log failed'); }
    try { console.log('   req.user:', req.user ? { id: req.user._id, clerkId: req.user.clerkId } : null); } catch (e) { console.log('   req.user log failed'); }
    console.log('   body preview:', JSON.stringify(req.body).substring(0, 500));

    // validate payload
    const parsed = problemSchema.parse(req.body);
    const payload = parsed;

    // If starterCode is a string, parse it to an object
    if (typeof payload.starterCode === 'string') {
      try {
        payload.starterCode = JSON.parse(payload.starterCode);
      } catch (parseErr) {
        console.warn('⚠️ Failed to parse starterCode JSON:', parseErr.message);
        payload.starterCode = {};
      }
    }

    // ensure a slug exists (simple fallback)
    if (!payload.slug && payload.title) {
      payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    payload.createdBy = req.user?.clerkId || null;

    try {
      const problem = await Problem.create(payload);
      console.log(`✅ Problem created: ${problem._id} (slug: ${problem.slug})`);
      res.status(201).json({ problem });
    } catch (dbErr) {
      // Handle duplicate key (slug) nicely
      if (dbErr && dbErr.code === 11000) {
        console.warn('⚠️ Duplicate slug detected when creating problem:', dbErr.keyValue || dbErr.message);
        return res.status(409).json({ message: 'Problem with the same slug already exists', detail: dbErr.keyValue || dbErr.message });
      }
      throw dbErr;
    }
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
    console.log('\n🔎 getProblems called');
    console.log('   req.auth exists:', !!req.auth);
    try { console.log('   req.user:', req.user ? { id: req.user._id, clerkId: req.user.clerkId } : null); } catch (e) { console.log('   req.user log failed'); }

    const problems = await Problem.find().sort({ createdAt: -1 });
    console.log(`✅ Returning ${problems.length} problems`);
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
