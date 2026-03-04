import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, users } from "@/shared/schema";
import { eq } from "drizzle-orm";
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

function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
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

    const [allLeads, allSubs] = await Promise.all([
      db.select().from(leads),
      db.select().from(users).where(eq(users.role, "subcontractor")),
    ]);

    const allTime = {
      totalLeads: allLeads.length,
      pendingAdmin: allLeads.filter((l) => l.status === "pending_admin").length,
      accepted: allLeads.filter((l) => l.status === "accepted").length,
      available: allLeads.filter((l) => l.status === "available").length,
      purchased: allLeads.filter((l) => l.status === "purchased").length,
      totalRevenue: allLeads.reduce((sum, l) => sum + safeNumber(l.purchasePrice), 0),
    };

    const createdInRange = allLeads.filter((l) => isInRange(toDate(l.createdAt), startMs, endMs));
    const reviewedInRange = allLeads.filter((l) => isInRange(toDate(l.adminReviewedAt), startMs, endMs));
    const purchasedInRange = allLeads.filter((l) => isInRange(toDate(l.purchasedAt), startMs, endMs));

    const revenueInRange = purchasedInRange.reduce((sum, l) => sum + safeNumber(l.purchasePrice), 0);
    const avgPurchasePrice = purchasedInRange.length > 0 ? revenueInRange / purchasedInRange.length : 0;
    const purchaseConversion = createdInRange.length > 0 ? purchasedInRange.length / createdInRange.length : 0;

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

    const purchaseLagHours = purchasedInRange
      .map((l) => {
        const created = toDate(l.createdAt);
        const purchased = toDate(l.purchasedAt);
        if (!created || !purchased) return null;
        return Math.max(0, (purchased.getTime() - created.getTime()) / (1000 * 60 * 60));
      })
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

    const avgTimeToPurchaseHours =
      purchaseLagHours.length > 0
        ? purchaseLagHours.reduce((a, b) => a + b, 0) / purchaseLagHours.length
        : 0;

    const activeSubs = allSubs.length;
    const subsAgreementAccepted = allSubs.filter((s) => !!s.agreementAccepted).length;

    const availableLeadsNow = allLeads.filter((l) => l.status === "available");
    const availableAvgAgeHours =
      availableLeadsNow.length > 0
        ? availableLeadsNow
            .map((l) => {
              const created = toDate(l.createdAt);
              if (!created) return 0;
              return Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60));
            })
            .reduce((a, b) => a + b, 0) / availableLeadsNow.length
        : 0;

    const seriesMap = new Map<
      string,
      { date: string; leadsCreated: number; leadsReviewed: number; leadsPurchased: number; revenue: number }
    >();
    for (
      let d = startOfDay(startDate);
      d.getTime() <= endOfDay(endDate).getTime();
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const key = dayKey(d);
      seriesMap.set(key, { date: key, leadsCreated: 0, leadsReviewed: 0, leadsPurchased: 0, revenue: 0 });
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
      const purchased = toDate(l.purchasedAt);
      if (purchased && isInRange(purchased, startMs, endMs)) {
        const key = dayKey(purchased);
        const row = seriesMap.get(key);
        if (row) {
          row.leadsPurchased += 1;
          row.revenue += safeNumber(l.purchasePrice);
        }
      }
    }

    const daily = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const byService = new Map<string, { serviceType: string; leadsCreated: number; purchases: number; revenue: number }>();
    const byCity = new Map<string, { city: string; leadsCreated: number; purchases: number; revenue: number }>();

    for (const l of createdInRange) {
      const svc = l.serviceType || "unknown";
      const city = l.city || "unknown";
      byService.set(svc, { serviceType: svc, leadsCreated: (byService.get(svc)?.leadsCreated ?? 0) + 1, purchases: byService.get(svc)?.purchases ?? 0, revenue: byService.get(svc)?.revenue ?? 0 });
      byCity.set(city, { city, leadsCreated: (byCity.get(city)?.leadsCreated ?? 0) + 1, purchases: byCity.get(city)?.purchases ?? 0, revenue: byCity.get(city)?.revenue ?? 0 });
    }

    for (const l of purchasedInRange) {
      const svc = l.serviceType || "unknown";
      const city = l.city || "unknown";
      const rev = safeNumber(l.purchasePrice);
      byService.set(svc, { serviceType: svc, leadsCreated: byService.get(svc)?.leadsCreated ?? 0, purchases: (byService.get(svc)?.purchases ?? 0) + 1, revenue: (byService.get(svc)?.revenue ?? 0) + rev });
      byCity.set(city, { city, leadsCreated: byCity.get(city)?.leadsCreated ?? 0, purchases: (byCity.get(city)?.purchases ?? 0) + 1, revenue: (byCity.get(city)?.revenue ?? 0) + rev });
    }

    const byServiceArr = Array.from(byService.values())
      .map((r) => ({
        ...r,
        conversion: r.leadsCreated > 0 ? r.purchases / r.leadsCreated : 0,
        avgPurchasePrice: r.purchases > 0 ? r.revenue / r.purchases : 0,
      }))
      .sort((a, b) => b.leadsCreated - a.leadsCreated);

    const byCityArr = Array.from(byCity.values())
      .map((r) => ({
        ...r,
        conversion: r.leadsCreated > 0 ? r.purchases / r.leadsCreated : 0,
        avgPurchasePrice: r.purchases > 0 ? r.revenue / r.purchases : 0,
      }))
      .sort((a, b) => b.leadsCreated - a.leadsCreated);

    const buyerAgg = new Map<string, { userId: string; purchases: number; revenue: number }>();
    for (const l of purchasedInRange) {
      const buyer = l.purchasedBy;
      if (!buyer) continue;
      const rev = safeNumber(l.purchasePrice);
      buyerAgg.set(buyer, {
        userId: buyer,
        purchases: (buyerAgg.get(buyer)?.purchases ?? 0) + 1,
        revenue: (buyerAgg.get(buyer)?.revenue ?? 0) + rev,
      });
    }

    const buyerRows = Array.from(buyerAgg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const topBuyers = await Promise.all(
      buyerRows.map(async (row) => {
        const userResults = await db!.select().from(users).where(eq(users.id, row.userId));
        const user = userResults[0];
        const displayName =
          user?.company ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.email ||
          row.userId;
        return { ...row, displayName };
      })
    );

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
        leadsPurchased: purchasedInRange.length,
        revenue: revenueInRange,
        avgPurchasePrice,
        purchaseConversion,
        avgTimeToReviewHours,
        avgTimeToPurchaseHours,
        availableNow: availableLeadsNow.length,
        availableAvgAgeHours,
        activeSubcontractors: activeSubs,
        subcontractorsAgreementAccepted: subsAgreementAccepted,
      },
      charts: {
        daily,
        byService: byServiceArr,
        byCity: byCityArr,
        topBuyers,
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
