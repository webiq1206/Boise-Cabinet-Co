export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const dbUrl =
      process.env.DATABASE_URL ??
      process.env.PGDATABASE_URL ??
      process.env.REPLIT_DB_URL;
    if (!dbUrl) return;

    // Run startup maintenance in the background. This MUST NOT block `register()`
    // from returning: Next.js awaits `register()` during boot, and the deployment
    // startup probe expects the server to become ready quickly. Blocking here on
    // DB work (which scales with the size of the production leads table) can push
    // readiness past the health-check timeout and fail the deploy. Keeping the
    // dynamic `pg` import inside this nodejs guard also keeps it out of the edge
    // bundle.
    void (async () => {
      const GARY_USER_ID = "55074230";

      const UNRESOLVED_PURCHASES = [
        { leadId: "d934a12c-2d73-470c-a7f2-481b991a9b69", price: "30.00", label: "Jeff L Johnson bathroom-remodel Boise $30" },
        { leadId: "2c924537-de65-47a1-bb5c-d5f8bb748111", price: "5.00", label: "Hannah kitchen-remodel Boise $5" },
        { leadId: "2a8eb4b6-dfb5-4f3f-a8f2-09962889a897", price: "10.00", label: "Hannah Turner kitchen-remodel Boise $10" },
      ];

      const pool = new (await import("pg")).Pool({ connectionString: dbUrl });

      try {
        for (const entry of UNRESOLVED_PURCHASES) {
          const leadRows = await pool.query(
            "SELECT id, status FROM leads WHERE id = $1",
            [entry.leadId],
          );
          if (leadRows.rows.length > 0 && leadRows.rows[0].status !== "purchased") {
            const existingRows = await pool.query(
              "SELECT id FROM lead_purchases WHERE lead_id = $1",
              [entry.leadId],
            );
            if (existingRows.rows.length === 0) {
              await pool.query(
                `INSERT INTO lead_purchases (lead_id, user_id, purchase_price, stripe_payment_intent_id, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [entry.leadId, GARY_USER_ID, entry.price, `pi_admin_resolved_${Date.now()}`],
              );
              await pool.query(
                `UPDATE leads SET
                  status = 'purchased',
                  purchased_by = $1,
                  purchased_at = NOW(),
                  purchase_price = $2
                 WHERE id = $3`,
                [GARY_USER_ID, entry.price, entry.leadId],
              );
              console.log("[startup] Resolved purchase: " + entry.label);
            }
          }
        }

        await pool.query(`
          UPDATE leads SET status = 'archived', updated_at = NOW()
          WHERE status = 'available' AND created_at < NOW() - INTERVAL '7 days'
        `);
        console.log("[startup] Auto-archived stale leads (7+ days old)");

        try {
          const { normalizeStoredAddress, hasLeadingHouseNumber } = await import(
            "./shared/addressValidation"
          );
          const rows = await pool.query(`
            SELECT id, address, city, address_missing_house_number
            FROM leads
            WHERE address IS NOT NULL AND address <> '***'
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
      } catch (e) {
        console.error("[startup] Error during startup tasks:", e);
      } finally {
        await pool.end();
      }
    })();

    // Submit sitemap to IndexNow on production startup.
    // The key file is already live (deployed via public/), so the
    // verification should pass immediately after server boots.
    void (async () => {
      try {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        const { stdout, stderr } = await execAsync("node scripts/submit-indexnow.mjs");
        if (stdout) console.log("[startup] IndexNow output:", stdout.trim());
        if (stderr) console.error("[startup] IndexNow stderr:", stderr.trim());
      } catch (e) {
        console.error("[startup] IndexNow submission failed:", e);
      }
    })();
  }
}
