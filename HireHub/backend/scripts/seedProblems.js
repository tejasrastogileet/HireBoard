import mongoose from "mongoose";
import { ENV } from "../src/lib/env.js";
import Problem from "../src/models/Problem.js";

async function run() {
  if (!ENV.DB_URL) {
    console.error("DB_URL missing in env");
    process.exit(1);
  }

  await mongoose.connect(ENV.DB_URL);
  console.log("Connected to DB for seeding");

  // import problems from frontend data file
  const dataPath = new URL("../../frontend/src/data/problems.js", import.meta.url).pathname;
  const problemsModule = await import(`file://${dataPath}`);
  const PROBLEMS = problemsModule.PROBLEMS || problemsModule.default || {};

  const entries = Object.values(PROBLEMS);
  for (const p of entries) {
    const exists = await Problem.findOne({ slug: p.id });
    if (exists) {
      console.log(`Skipping existing: ${p.title}`);
      continue;
    }

    await Problem.create({
      slug: p.id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      description: p.description,
      examples: p.examples,
      constraints: p.constraints,
      starterCode: p.starterCode,
      expectedOutput: p.expectedOutput,
    });
    console.log(`Imported: ${p.title}`);
  }

  console.log("Done seeding");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
