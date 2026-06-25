import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { getSession, getUserFromDb } from "@/lib/auth";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isInRange(d: Date | null, startMs: number, endMs: number): boolean {
  if (!d) return false;
  const t = d.getTime();
  return t >= startMs && t <= endMs;
}

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await getUserFromDb(session.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const daysParam = parseInt(url.searchParams.get("days") || "30", 10);
    const days = Math.max(1, Math.min(365, isNaN(daysParam) ? 30 : daysParam));

    const now = new Date();
    const endDate = endOfDay(now);
    const startDate = startOfDay(new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    const allLeads = await db.select().from(leads);

    const allTime = {
      totalLeads: allLeads.length,
      pendingAdmin: allLeads.filter((l) => l.status === "pending_admin").length,
      accepted: allLeads.filter((l) => l.status === "accepted").length,
      archived: allLeads.filter((l) => l.status === "archived").length,
    };

    const createdInRange = allLeads.filter((l) => isInRange(toDate(l.createdAt), startMs, endMs));
    const reviewedInRange = allLeads.filter((l) => isInRange(toDate(l.adminReviewedAt), startMs, endMs));

    const reviewLagHours = createdInRange
      .map((l) => {
        const created = toDate(l.createdAt);
        const reviewed = toDate(l.adminReviewedAt);
        if (!created || !reviewed) return null;
        return Math.max(0, (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60));
      })
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

    const avgTimeToReviewHours =
      reviewLagHours.length > 0
        ? reviewLagHours.reduce((a, b) => a + b, 0) / reviewLagHours.length
        : 0;

    const seriesMap = new Map<
      string,
      { date: string; leadsCreated: number; leadsReviewed: number }
    >();
    for (
      let d = startOfDay(startDate);
      d.getTime() <= endOfDay(endDate).getTime();
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const key = dayKey(d);
      seriesMap.set(key, { date: key, leadsCreated: 0, leadsReviewed: 0 });
    }

    for (const l of allLeads) {
      const created = toDate(l.createdAt);
      if (created && isInRange(created, startMs, endMs)) {
        const key = dayKey(created);
        const row = seriesMap.get(key);
        if (row) row.leadsCreated += 1;
      }
      const reviewed = toDate(l.adminReviewedAt);
      if (reviewed && isInRange(reviewed, startMs, endMs)) {
        const key = dayKey(reviewed);
        const row = seriesMap.get(key);
        if (row) row.leadsReviewed += 1;
      }
    }

    const daily = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const byService = new Map<string, { serviceType: string; leadsCreated: number }>();
    const byCity = new Map<string, { city: string; leadsCreated: number }>();

    for (const l of createdInRange) {
      const svc = l.serviceType || "unknown";
      const city = l.city || "unknown";
      byService.set(svc, { serviceType: svc, leadsCreated: (byService.get(svc)?.leadsCreated ?? 0) + 1 });
      byCity.set(city, { city, leadsCreated: (byCity.get(city)?.leadsCreated ?? 0) + 1 });
    }

    const byServiceArr = Array.from(byService.values()).sort((a, b) => b.leadsCreated - a.leadsCreated);
    const byCityArr = Array.from(byCity.values()).sort((a, b) => b.leadsCreated - a.leadsCreated);

    return NextResponse.json({
      success: true,
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1),
      },
      allTime,
      kpis: {
        leadsCreated: createdInRange.length,
        leadsReviewed: reviewedInRange.length,
        avgTimeToReviewHours,
      },
      charts: {
        daily,
        byService: byServiceArr,
        byCity: byCityArr,
      },
    });
  } catch (error) {
    console.error("Error generating admin analytics:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
