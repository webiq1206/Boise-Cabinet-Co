export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    void import('./lib/p5/backgroundJobs').then(m=>m.bootEstimatorWorker()).catch(()=>console.error('[p5-worker] Startup deferred; estimator requests can resume saved work.'));
    const dbUrl =
      process.env.DATABASE_URL ??
      process.env.PGDATABASE_URL ??
      process.env.REPLIT_DB_URL;
    if (!dbUrl) return;

    // Everything below is best-effort background maintenance. None of it is
    // required for the server to serve a request, so none of it may be allowed
    // to take the process down - but some of it can, and did.
    //
    // Observed in deploy b9efe211: a Neon WebSocket connection error during
    // startup surfaced as `TypeError: Cannot set property message of
    // #<ErrorEvent> which has only a getter`, thrown inside ws's own
    // callListener. ws exposes ErrorEvent.message as a getter with no setter
    // (verified on both 8.18.3 and 8.19.0, so this is not a version
    // regression), and @neondatabase/serverless assigns to it from an .mjs
    // module, i.e. strict mode, so the assignment throws. Because that throw
    // happens inside a WebSocket event listener on a later tick, no try/catch
    // around our own await can see it: it lands as an uncaught exception and
    // Node exits. The container then fails its health check and the deploy
    // never promotes, which is exactly the "built successfully but failed to
    // start" signature.
    //
    // These handlers are deliberately narrow in intent: log loudly, keep
    // serving. They are not a licence to ignore request-handling bugs - route
    // handlers have their own error boundaries and still return 500s.
    process.on("uncaughtException", (err) => {
      console.error("[startup] uncaught exception (server kept alive):", err);
    });
    process.on("unhandledRejection", (reason) => {
      console.error("[startup] unhandled rejection (server kept alive):", reason);
    });

    // Run startup maintenance in the background. This MUST NOT block `register()`
    // from returning: Next.js awaits `register()` during boot, and the deployment
    // startup probe expects the server to become ready quickly. Blocking here on
    // DB work (which scales with the size of the production leads table) can push
    // readiness past the health-check timeout and fail the deploy. Keeping the
    // dynamic `pg` import inside this nodejs guard also keeps it out of the edge
    // bundle.
    void (async () => {
      // A boot task must never be able to hold readiness open. Live 2026-09-23, Boise Cabinet Co:
      // five deploys in a row built and then failed to promote, logging
      // "[startup] Error during startup tasks: error: Authentication timed out" (Postgres 08P01)
      // against a cold Neon connection. One connection, and hard limits on how long it may wait or
      // run, so a slow database costs this maintenance and nothing else.
      const pool = new (await import("pg")).Pool({
        connectionString: dbUrl,
        max: 1,
        connectionTimeoutMillis: 10_000,
        idleTimeoutMillis: 5_000,
        statement_timeout: 15_000,
        query_timeout: 15_000,
      });

      try {
        await pool.query(`
          UPDATE leads SET status = 'archived', updated_at = NOW()
          WHERE status = 'available' AND created_at < NOW() - INTERVAL '7 days'
        `);
        console.log("[startup] Auto-archived stale leads (7+ days old)");

        try {
          const { normalizeStoredAddress, hasLeadingHouseNumber } = await import(
            "./shared/addressValidation"
          );
          // Bounded on purpose. This is a backfill, and it read and rewrote the whole leads table on
          // every boot - the exact "DB work that scales with the leads table" this file's own header
          // warns can push readiness past the health-check timeout. A slice per boot converges just
          // as surely, and cannot grow into a failed deploy.
          const rows = await pool.query(`
            SELECT id, address, city, address_missing_house_number
            FROM leads
            WHERE address IS NOT NULL AND address <> '***'
            ORDER BY updated_at DESC NULLS LAST
            LIMIT 500
          `);
          let cleaned = 0;
          let flagged = 0;
          for (const row of rows.rows) {
            const normalized = normalizeStoredAddress(row.address, row.city);
            const missing = !hasLeadingHouseNumber(normalized);
            const addressChanged = normalized && normalized !== row.address;
            const flagChanged = missing !== Boolean(row.address_missing_house_number);
            if (!addressChanged && !flagChanged) continue;
            if (addressChanged && flagChanged) {
              await pool.query(
                `UPDATE leads SET address = $1, address_missing_house_number = $2 WHERE id = $3`,
                [normalized, missing, row.id],
              );
            } else if (addressChanged) {
              await pool.query(
                "UPDATE leads SET address = $1 WHERE id = $2",
                [normalized, row.id],
              );
            } else {
              await pool.query(
                "UPDATE leads SET address_missing_house_number = $1 WHERE id = $2",
                [missing, row.id],
              );
            }
            if (addressChanged) cleaned++;
            if (missing) flagged++;
          }
          if (cleaned > 0 || flagged > 0) {
            console.log(
              `[startup] Address backfill: rewrote ${cleaned} address(es), flagged ${flagged} missing-house-number row(s)`,
            );
          }
        } catch (addrErr) {
          console.error("[startup] Address backfill failed:", addrErr);
        }

        // Ensure the designated admin accounts exist in production. Publishing
        // migrates schema only, not data, so the admin account created in the
        // workspace does not exist in the production database. This is gated by
        // the ADMIN_BOOTSTRAP_PASSWORD secret, which only the Repl owner can
        // set — proving ownership and serving as the sanctioned "manual
        // promotion" path now that the verified OIDC login flow is gone.
        // Idempotent: creates the account if missing, sets a password only when
        // one is absent, and always ensures the admin role. It never overwrites
        // a password the admin later changes.
        try {
          const { ADMIN_EMAILS } = await import("./shared/adminEmails");
          const bootstrapPw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
          if (bootstrapPw && bootstrapPw.length >= 8) {
            const { randomBytes, scrypt: scryptCb } = await import("crypto");
            const { promisify } = await import("util");
            const scrypt = promisify(scryptCb) as (
              pw: string,
              salt: string,
              keylen: number,
            ) => Promise<Buffer>;
            const makeHash = async (pw: string) => {
              const salt = randomBytes(16).toString("hex");
              const derived = await scrypt(pw, salt, 64);
              return `${salt}:${derived.toString("hex")}`;
            };
            for (const rawEmail of ADMIN_EMAILS) {
              const adminEmail = rawEmail.trim().toLowerCase();
              if (!adminEmail) continue;
              const existing = await pool.query(
                "SELECT id, role, password_hash FROM users WHERE lower(email) = $1",
                [adminEmail],
              );
              if (existing.rows.length === 0) {
                await pool.query(
                  "INSERT INTO users (email, role, password_hash) VALUES ($1, 'admin', $2)",
                  [adminEmail, await makeHash(bootstrapPw)],
                );
                console.log("[startup] Created admin account " + adminEmail);
              } else {
                const row = existing.rows[0];
                if (!row.password_hash) {
                  await pool.query(
                    "UPDATE users SET password_hash = $1, role = 'admin' WHERE id = $2",
                    [await makeHash(bootstrapPw), row.id],
                  );
                  console.log(
                    "[startup] Set admin password + role for " + adminEmail,
                  );
                } else if (row.role !== "admin") {
                  await pool.query(
                    "UPDATE users SET role = 'admin' WHERE id = $1",
                    [row.id],
                  );
                  console.log("[startup] Promoted " + adminEmail + " to admin");
                }
              }
            }
          }
        } catch (adminErr) {
          console.error("[startup] Admin bootstrap failed:", adminErr);
        }
      } catch (e) {
        console.error("[startup] Error during startup tasks:", e);
      } finally {
        await pool.end();
      }
    })();

    // Contractor outreach background runner. Trickles approved cold emails out
    // on a fixed interval, but only ever attempts ONE at a time and defers all
    // gating (master on/off switch, dry-run, rolling daily cap, minimum gap,
    // suppression list) to processOutreachBatch. Kept inside the nodejs +
    // production guard so it never runs in dev or the edge bundle.
    void (async () => {
      try {
        const { processOutreachBatch } = await import("./lib/outreach/sender");
        const TICK_MS = 10 * 60 * 1000; // check every 10 minutes
        const tick = async () => {
          try {
            await processOutreachBatch({ limit: 1, source: "auto" });
          } catch (e) {
            console.error("[outreach] background tick failed:", e);
          }
        };
        setInterval(() => void tick(), TICK_MS);
      } catch (e) {
        console.error("[outreach] background runner failed to start:", e);
      }
    })();

    // Unified CRM sending engine. Advances due sequence enrollments and active
    // one-off runs, one send per tick. All global gating (master switch,
    // dry-run, rolling daily cap, min gap, suppression, emailable) lives inside
    // processSendingTick. Kept in the nodejs + production guard.
    void (async () => {
      try {
        const { processSendingTick } = await import("./server/services/sendingEngine");
        const TICK_MS = 5 * 60 * 1000; // check every 5 minutes
        const tick = async () => {
          try {
            await processSendingTick();
          } catch (e) {
            console.error("[crm] sending tick failed:", e);
          }
        };
        setInterval(() => void tick(), TICK_MS);
      } catch (e) {
        console.error("[crm] sending engine failed to start:", e);
      }
    })();

    // Seed managed email templates and sequences on boot (idempotent; skips any
    // template/sequence an operator has edited via seedManaged=false).
    void (async () => {
      try {
        const { seedOutreachContent } = await import("./server/services/outreachSeed");
        await seedOutreachContent();
      } catch (e) {
        console.error("[crm] outreach content seed failed:", e);
      }
    })();

    // Submit sitemap to IndexNow on production startup.
    // The key file is already live (deployed via public/), so the
    // verification should pass immediately after server boots.
    void (async () => {
      try {
        // `scripts/` is not traced into the standalone bundle, so in a deployed
        // build this spawned `node scripts/submit-indexnow.mjs` and died with
        // MODULE_NOT_FOUND on every cold start (confirmed by running the
        // standalone artifact locally). Skip cleanly when the file is absent
        // instead of spawning a process that is guaranteed to fail.
        const { existsSync } = await import("fs");
        const script = "scripts/submit-indexnow.mjs";
        if (!existsSync(script)) {
          console.log("[startup] IndexNow skipped - " + script + " not present in this build");
          return;
        }
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        const { stdout, stderr } = await execAsync(`node ${script}`);
        if (stdout) console.log("[startup] IndexNow output:", stdout.trim());
        if (stderr) console.error("[startup] IndexNow stderr:", stderr.trim());
      } catch (e) {
        console.error("[startup] IndexNow submission failed:", e);
      }
    })();
  }
}
