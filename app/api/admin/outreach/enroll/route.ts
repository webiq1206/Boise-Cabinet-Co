import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { buildLeadConditions, combineConditions, type LeadAudienceFilter } from "@/lib/crm/leadFilter";
import { enrollLeadInSequence } from "@/server/services/sendingEngine";

// Bulk-enroll all emailable leads matching a filter into a sequence.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as
    | { sequenceId?: string; filter?: LeadAudienceFilter }
    | null;
  if (!body?.sequenceId) return NextResponse.json({ error: "sequenceId required" }, { status: 400 });

  // Only enroll emailable leads.
  const conditions = buildLeadConditions(body.filter ?? {});
  conditions.push(eq(leads.emailable, true));
  const whereClause = combineConditions(conditions);

  const rows = await db.select({ id: leads.id }).from(leads).where(whereClause);

  let enrolled = 0;
  let skipped = 0;
  for (const row of rows) {
    const result = await enrollLeadInSequence(body.sequenceId, row.id);
    if (result.enrolled) enrolled++;
    else skipped++;
  }

  return NextResponse.json({ enrolled, skipped, matched: rows.length });
}
