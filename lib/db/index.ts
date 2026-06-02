import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/shared/schema";

const connectionString =
  process.env.DATABASE_URL ??
  process.env.PGDATABASE_URL ??
  process.env.REPLIT_DB_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

export function isDbAvailable(): boolean {
  return db !== null;
}

export function getDbPool(): Pool | null {
  return pool;
}
