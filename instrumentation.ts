export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "production") {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    const GARY_USER_ID = "55074230";

    const UNRESOLVED_PURCHASES = [
      { leadId: "d934a12c-2d73-470c-a7f2-481b991a9b69", price: "30.00", label: "Jeff L Johnson spring cleanup" },
      { leadId: "2c924537-de65-47a1-bb5c-d5f8bb748111", price: "5.00", label: "Hannah lawn-mowing Kuna $5" },
      { leadId: "2a8eb4b6-dfb5-4f3f-a8f2-09962889a897", price: "10.00", label: "Hannah Turner lawn-mowing Kuna $10" },
    ];

    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);

      for (const entry of UNRESOLVED_PURCHASES) {
        const leadRows = await sql`SELECT id, status FROM leads WHERE id = ${entry.leadId}`;
        if (leadRows.length > 0 && leadRows[0].status !== "purchased") {
          const existingRows = await sql`SELECT id FROM lead_purchases WHERE lead_id = ${entry.leadId}`;
          if (existingRows.length === 0) {
            await sql`
              INSERT INTO lead_purchases (lead_id, user_id, purchase_price, stripe_payment_intent_id, created_at)
              VALUES (${entry.leadId}, ${GARY_USER_ID}, ${entry.price}, ${'pi_admin_resolved_' + Date.now()}, NOW())
            `;
            await sql`
              UPDATE leads SET
                status = 'purchased',
                purchased_by = ${GARY_USER_ID},
                purchased_at = NOW(),
                purchase_price = ${entry.price}
              WHERE id = ${entry.leadId}
            `;
            console.log("[startup] Resolved purchase: " + entry.label);
          }
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
