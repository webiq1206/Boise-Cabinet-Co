import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, outreachSends, sequenceEnrollments, projects } from "@/shared/schema";
import { sql, eq, and, desc, gte, isNotNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const [leadStats, pipelineRows, recentLeads, outreachStats, projectStats] =
    await Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          emailable: sql<number>`count(*) filter (where ${leads.emailable} = true)::int`,
          homeowner: sql<number>`count(*) filter (where ${leads.leadType} = 'homeowner')::int`,
          business: sql<number>`count(*) filter (where ${leads.leadType} = 'business')::int`,
          newToday: sql<number>`count(*) filter (where ${leads.createdAt} >= current_date)::int`,
        })
        .from(leads),

      db
        .select({
          stage: leads.pipelineStage,
          count: sql<number>`count(*)::int`,
        })
        .from(leads)
        .groupBy(leads.pipelineStage),

      db
        .select({
          id: leads.id,
          name: leads.name,
          companyName: leads.companyName,
          leadType: leads.leadType,
          phone: leads.phone,
          email: leads.email,
          city: leads.city,
          serviceArea: leads.serviceArea,
          source: leads.source,
          pipelineStage: leads.pipelineStage,
          createdAt: leads.createdAt,
        })
        .from(leads)
        .orderBy(desc(leads.createdAt))
        .limit(8),

      db
        .select({
          total: sql<number>`count(*)::int`,
          sent: sql<number>`count(*) filter (where ${outreachSends.status} = 'sent')::int`,
          failed: sql<number>`count(*) filter (where ${outreachSends.status} = 'failed')::int`,
          opened: sql<number>`count(*) filter (where ${outreachSends.openedAt} is not null)::int`,
          clicked: sql<number>`count(*) filter (where ${outreachSends.firstClickedAt} is not null)::int`,
          sentLast24h: sql<number>`count(*) filter (where ${outreachSends.sentAt} >= now() - interval '24 hours')::int`,
        })
        .from(outreachSends),

      db
        .select({
          total: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where ${projects.status} = 'active')::int`,
        })
        .from(projects),
    ]);

  const pipeline: Record<string, number> = {};
  for (const row of pipelineRows) {
    pipeline[row.stage] = row.count;
  }

  return NextResponse.json({
    leads: { ...leadStats[0], pipeline },
    outreach: outreachStats[0] ?? { total: 0, sent: 0, failed: 0, opened: 0, clicked: 0, sentLast24h: 0 },
    projects: projectStats[0] ?? { total: 0, active: 0 },
    recentLeads,
  });
}
