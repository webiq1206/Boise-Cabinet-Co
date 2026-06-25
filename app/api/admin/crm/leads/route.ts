import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, leadQuotes } from "@/shared/schema";
import { and, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const url = new URL(request.url);
  const p = url.searchParams;
  const page = Math.max(1, parseInt(p.get("page") || "1", 10) || 1);
  const pageSize = Math.min(200, parseInt(p.get("pageSize") || String(PAGE_SIZE), 10) || PAGE_SIZE);
  const search = (p.get("search") || "").trim();

  const conditions: SQL[] = [];
  const leadType = p.get("leadType");
  const emailStatus = p.get("emailStatus");
  const pipelineStage = p.get("pipelineStage");
  const source = p.get("source");
  const serviceArea = p.get("serviceArea");
  const leadGroup = p.get("leadGroup");
  const emailable = p.get("emailable");

  if (leadType) conditions.push(eq(leads.leadType, leadType));
  if (emailStatus) conditions.push(eq(leads.emailStatus, emailStatus));
  if (pipelineStage) conditions.push(eq(leads.pipelineStage, pipelineStage));
  if (source) conditions.push(eq(leads.source, source));
  if (serviceArea) conditions.push(eq(leads.serviceArea, serviceArea));
  if (leadGroup) conditions.push(eq(leads.leadGroup, leadGroup));
  if (emailable === "true") conditions.push(eq(leads.emailable, true));
  if (emailable === "false") conditions.push(eq(leads.emailable, false));

  if (search) {
    const like = `%${search}%`;
    const searchClause = or(
      ilike(leads.name, like),
      ilike(leads.email, like),
      ilike(leads.phone, like),
      ilike(leads.companyName, like),
      ilike(leads.city, like),
    );
    if (searchClause) conditions.push(searchClause);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(leads).where(whereClause),
  ]);

  const total = countRows[0]?.count ?? 0;

  // Stats bar tiles (computed over the full table, not the filtered page).
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [emailableRows, quotesTodayRows, openDealsRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(leads).where(eq(leads.emailable, true)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(leadQuotes)
      .where(gte(leadQuotes.createdAt, startOfToday)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(
        or(
          eq(leads.pipelineStage, "consultation_booked"),
          eq(leads.pipelineStage, "quoted"),
          eq(leads.pipelineStage, "on_hold"),
        ),
      ),
  ]);

  return NextResponse.json({
    leads: rows,
    total,
    page,
    pageSize,
    stats: {
      emailable: emailableRows[0]?.count ?? 0,
      newQuoteRequestsToday: quotesTodayRows[0]?.count ?? 0,
      openDeals: openDealsRows[0]?.count ?? 0,
    },
  });
}

// Create a lead manually (used by "Add business lead" and manual entry).
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const leadType = body.leadType === "business" ? "business" : "homeowner";
  const email = (body.email as string | undefined)?.trim() || null;
  const emailStatus = "new";

  const [created] = await db
    .insert(leads)
    .values({
      leadType,
      emailable: deriveEmailable(email, emailStatus),
      name: body.name ?? body.companyName ?? null,
      companyName: body.companyName ?? null,
      email,
      phone: body.phone ?? null,
      website: body.website ?? null,
      city: body.city ?? null,
      serviceArea: matchServiceArea(body.city),
      state: body.state ?? null,
      zip: body.zip ?? null,
      fullAddress: body.fullAddress ?? body.address ?? null,
      address: body.address ?? null,
      businessCategory: body.businessCategory ?? null,
      leadGroup: body.leadGroup ?? null,
      message: body.message ?? null,
      source: body.source ?? "manual",
      sourceDetail: body.sourceDetail ?? null,
      emailStatus,
      pipelineStage: "new",
      status: leadType === "business" ? "accepted" : "pending_admin",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
