import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { buildLeadConditions, combineConditions, type LeadAudienceFilter } from "@/lib/crm/leadFilter";

// Pre-send audience count: total matching, emailable (will send), and
// phone-only / no-email (skipped). Suppression is applied at send time.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { filter?: LeadAudienceFilter } | null;
  const filter = body?.filter ?? {};

  // Ignore an explicit emailable filter for counting so we can split the buckets.
  const baseFilter: LeadAudienceFilter = { ...filter };
  delete baseFilter.emailable;
  const baseConditions = buildLeadConditions(baseFilter);
  const whereTotal = combineConditions(baseConditions);

  const emailableConditions = [...baseConditions, eq(leads.emailable, true)];
  const phoneOnlyConditions = [...baseConditions, eq(leads.emailable, false), isNotNull(leads.phone)];

  const [totalRows, emailableRows, phoneOnlyRows] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(leads).where(whereTotal),
    db.select({ n: sql<number>`count(*)::int` }).from(leads).where(and(...emailableConditions)),
    db.select({ n: sql<number>`count(*)::int` }).from(leads).where(and(...phoneOnlyConditions)),
  ]);

  return NextResponse.json({
    total: totalRows[0]?.n ?? 0,
    emailable: emailableRows[0]?.n ?? 0,
    phoneOnly: phoneOnlyRows[0]?.n ?? 0,
  });
}
