import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/shared/schema";

// For edge runtime compatibility
if (typeof globalThis.WebSocket === "undefined") {
  // Skip WebSocket configuration on server-side if not needed
}

const connectionString = process.env.DATABASE_URL;

// Create pool only if DATABASE_URL is available
export const pool = connectionString 
  ? new Pool({ connectionString }) 
  : null;

// Create drizzle instance
export const db = pool 
  ? drizzle(pool, { schema }) 
  : null;

// Helper to check if DB is available
export function isDbAvailable(): boolean {
  return db !== null;
}
