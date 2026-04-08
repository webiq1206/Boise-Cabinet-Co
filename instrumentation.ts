export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    const LEAD_ID = "d934a12c-2d73-470c-a7f2-481b991a9b69";
    const GARY_USER_ID = "55074230";
    const PURCHASE_PRICE = "30.00";

    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);

      const leadRows = await sql`SELECT id, status, purchased_by FROM leads WHERE id = ${LEAD_ID}`;
      if (leadRows.length > 0 && leadRows[0].status !== "purchased") {
        const existingRows = await sql`SELECT id FROM lead_purchases WHERE lead_id = ${LEAD_ID}`;
        if (existingRows.length === 0) {
          await sql`
            INSERT INTO lead_purchases (lead_id, user_id, purchase_price, stripe_payment_intent_id, created_at)
            VALUES (${LEAD_ID}, ${GARY_USER_ID}, ${PURCHASE_PRICE}, 'pi_admin_resolved_gary', NOW())
          `;
          await sql`
            UPDATE leads SET
              status = 'purchased',
              purchased_by = ${GARY_USER_ID},
              purchased_at = NOW(),
              purchase_price = ${PURCHASE_PRICE}
            WHERE id = ${LEAD_ID}
          `;
          console.log("[startup] Resolved Gary's lead purchase: " + LEAD_ID);
        }
      }

      await sql`
        UPDATE leads SET status = 'archived', updated_at = NOW()
        WHERE status = 'available' AND created_at < NOW() - INTERVAL '7 days'
      `;
      console.log("[startup] Auto-archived stale leads (7+ days old)");
    } catch (e) {
      console.error("[startup] Error during startup tasks:", e);
    }
  }
}
