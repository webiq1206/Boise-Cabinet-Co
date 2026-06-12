import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { getOutreachConfig, isOutreachSendable } from "@/lib/outreach/config";
import { isDiscoveryConfigured } from "@/lib/outreach/discovery";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const rows = await db
    .select()
    .from(outreachProspects)
    .orderBy(desc(outreachProspects.createdAt))
    .limit(1000);

  const statusRows = await db
    .select({
      status: outreachProspects.status,
      n: sql<number>`count(*)::int`,
    })
    .from(outreachProspects)
    .groupBy(outreachProspects.status);

  const counts: Record<string, number> = {};
  for (const r of statusRows) counts[r.status] = r.n;

  const config = await getOutreachConfig();

  return NextResponse.json({
    prospects: rows,
    counts,
    config,
    readiness: {
      discoveryConfigured: isDiscoveryConfigured(),
      sendable: isOutreachSendable(),
    },
  });
}
