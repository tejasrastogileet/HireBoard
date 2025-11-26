import dotenv from "dotenv";

// Load environment variables from .env in development
dotenv.config({ silent: true });

// Provide sensible defaults for local development while still
// allowing production environment variables to take precedence.
export const ENV = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL || process.env.MONGODB_URI || process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  ADMIN_CLERK_IDS: process.env.ADMIN_CLERK_IDS,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
};
