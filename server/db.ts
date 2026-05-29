import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const isNextProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

if (
  !process.env.DATABASE_URL &&
  process.env.NODE_ENV === "production" &&
  !isNextProductionBuild
) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// In development, allow running without a database by falling back to in-memory storage.
const dbUrl = process.env.DATABASE_URL;
export const pool = dbUrl ? new Pool({ connectionString: dbUrl }) : (null as any);

type DbType = ReturnType<typeof drizzle<typeof schema>>;
export const db = (dbUrl ? drizzle(pool, { schema }) : null) as unknown as DbType;
