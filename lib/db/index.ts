import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ??
  process.env.PGDATABASE_URL ??
  process.env.REPLIT_DB_URL;

/**
 * Per-instance connection ceiling. The deployment target is autoscale, so the
 * database sees `max` x (number of live instances) connections, not `max`.
 * pg-pool's default of 10 per instance exhausts the database's connection
 * budget once a few instances are up, and a saturated server drops incoming
 * connections - which is what "SERVER unexpectedly disconnected" looks like to
 * anything else trying to connect, including Replit's deploy-time schema diff.
 */
const POOL_MAX = Number(process.env.DATABASE_POOL_MAX ?? 5);

const pool = connectionString
  ? new Pool({
      connectionString,
      max: Number.isFinite(POOL_MAX) && POOL_MAX > 0 ? POOL_MAX : 5,
      // Hand idle connections back quickly. Neon autosuspends an idle database
      // and closes its sockets; holding them open past that point only leaves
      // dead connections in the pool and keeps the instance's share of the
      // connection budget reserved while it sits idle.
      idleTimeoutMillis: 30_000,
      // Fail a request rather than hanging it when the database is suspended or
      // unreachable. A cold Neon endpoint needs a few seconds to wake, so this
      // is generous enough to cover a normal cold start.
      connectionTimeoutMillis: 10_000,
    })
  : null;

// pg-pool emits 'error' on the POOL (not the query) when a connection sitting
// idle in the pool dies - exactly what happens when Neon autosuspends the
// database or a network blip closes the websocket. Node treats an unhandled
// 'error' event as an uncaught exception, so without this listener a routine
// idle-connection drop takes down the entire server process. The pool discards
// the dead client on its own; all this has to do is keep the process alive.
pool?.on("error", (err) => {
  console.error("[db] idle connection error (pool recovers, request retried):", err.message);
});

export const db = pool ? drizzle(pool, { schema }) : null;

export function isDbAvailable(): boolean {
  return db !== null;
}
