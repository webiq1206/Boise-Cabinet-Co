import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl =
  process.env.DATABASE_URL ?? process.env.PGDATABASE_URL ?? process.env.REPLIT_DB_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL not set — configure Replit Postgres or add DATABASE_URL to .env.local",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
