export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Pool, neonConfig } = await import("@neondatabase/serverless");
    const ws = (await import("ws")).default;
    neonConfig.webSocketConstructor = ws;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    const LEAD_ID = "d934a12c-2d73-470c-a7f2-481b991a9b69";
    const GARY_USER_ID = "55074230";
    const PURCHASE_PRICE = "30.00";

    const pool = new Pool({ connectionString: dbUrl });
    try {
      const client = await pool.connect();
      try {
        const leadResult = await client.query(
          "SELECT id, status, purchased_by FROM leads WHERE id = $1",
          [LEAD_ID]
        );
        if (leadResult.rows.length === 0) {
          return;
        }
        if (leadResult.rows[0].status === "purchased") {
          return;
        }

        const existingResult = await client.query(
          "SELECT id FROM lead_purchases WHERE lead_id = $1",
          [LEAD_ID]
        );
        if (existingResult.rows.length > 0) {
          return;
        }

        await client.query(
          `INSERT INTO lead_purchases (lead_id, user_id, purchase_price, stripe_payment_intent_id, created_at)
           VALUES ($1, $2, $3, 'pi_admin_resolved_gary', NOW())`,
          [LEAD_ID, GARY_USER_ID, PURCHASE_PRICE]
        );

        await client.query(
          `UPDATE leads SET 
            status = 'purchased', 
            purchased_by = $1, 
            purchased_at = NOW(), 
            purchase_price = $2
          WHERE id = $3`,
          [GARY_USER_ID, PURCHASE_PRICE, LEAD_ID]
        );

        console.log("[startup] Resolved Gary's lead purchase: " + LEAD_ID);
      } finally {
        client.release();
      }
    } catch (e) {
      console.error("[startup] Failed to resolve Gary's lead:", e);
    } finally {
      await pool.end();
    }
  }
}
