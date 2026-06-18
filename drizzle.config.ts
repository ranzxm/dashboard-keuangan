import { defineConfig } from "drizzle-kit";
import { getServerEnv } from "./src/lib/env";

const env = getServerEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
