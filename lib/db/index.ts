import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ??
  process.env.PGDATABASE_URL ??
  process.env.REPLIT_DB_URL;

const pool = connectionString ? new Pool({ connectionString }) : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export function isDbAvailable(): boolean {
  return db !== null;
}
