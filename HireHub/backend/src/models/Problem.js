import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "easy", "medium", "hard"], required: true },
    category: { type: String, default: "" },
    description: {
      text: { type: String, default: "" },
      notes: { type: [String], default: [] },
    },
    examples: { type: Array, default: [] },
    constraints: { type: [String], default: [] },
    starterCode: { type: Object, default: {} },
    expectedOutput: { type: Object, default: {} },
    createdBy: { type: String, default: null }, // clerkId of admin who created
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
