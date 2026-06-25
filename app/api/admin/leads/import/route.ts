import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { and, eq, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { deriveEmailable, matchServiceArea } from "@/lib/crm/leads";

// Target lead fields an import can map to.
const TARGET_FIELDS = [
  "companyName",
  "name",
  "email",
  "phone",
  "website",
  "city",
  "street",
  "state",
  "zip",
  "county",
  "fullAddress",
  "businessCategory",
  "leadGroup",
  "rating",
  "reviewCount",
  "googleMapsUrl",
] as const;

type TargetField = (typeof TARGET_FIELDS)[number];

interface ImportBody {
  mapping: Partial<Record<TargetField, string>>;
  rows: Record<string, string>[];
  leadType?: "business" | "homeowner";
  sourceDetail?: string;
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as ImportBody | null;
  if (!body?.rows || !Array.isArray(body.rows) || !body.mapping) {
    return NextResponse.json({ error: "rows and mapping required" }, { status: 400 });
  }

  const leadType = body.leadType === "homeowner" ? "homeowner" : "business";
  const sourceDetail = body.sourceDetail || "import";

  let created = 0;
  let merged = 0;
  let skipped = 0;
  let emailableCount = 0;
  let phoneOnlyCount = 0;

  for (const row of body.rows) {
    const mapped: Record<string, string | null> = {};
    for (const field of TARGET_FIELDS) {
      const sourceHeader = body.mapping[field];
      mapped[field] = sourceHeader ? clean(row[sourceHeader]) : null;
    }

    const email = mapped.email;
    const companyName = mapped.companyName || mapped.name;
    const phone = mapped.phone;
    const fullAddress = mapped.fullAddress;

    // Skip empty rows (no identifying info at all).
    if (!email && !companyName && !phone) {
      skipped++;
      continue;
    }

    // Dedupe: email, else companyName+phone, else companyName+fullAddress.
    const dedupeConditions = [];
    if (email) dedupeConditions.push(eq(leads.email, email));
    if (companyName && phone) dedupeConditions.push(and(eq(leads.companyName, companyName), eq(leads.phone, phone)));
    if (companyName && fullAddress) dedupeConditions.push(and(eq(leads.companyName, companyName), eq(leads.fullAddress, fullAddress)));

    let existing: typeof leads.$inferSelect | undefined;
    if (dedupeConditions.length > 0) {
      const found = await db
        .select()
        .from(leads)
        .where(or(...dedupeConditions))
        .limit(1);
      existing = found[0];
    }

    const emailable = deriveEmailable(email, "new");

    if (existing) {
      // Merge: only fill blanks; never overwrite existing data.
      const updates: Record<string, unknown> = {};
      for (const field of TARGET_FIELDS) {
        const current = (existing as Record<string, unknown>)[field];
        if ((current === null || current === undefined || current === "") && mapped[field]) {
          updates[field] = mapped[field];
        }
      }
      if (!existing.email && email) {
        updates.emailable = emailable;
        updates.email = email;
      }
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db.update(leads).set(updates).where(eq(leads.id, existing.id));
      }
      merged++;
    } else {
      await db.insert(leads).values({
        leadType,
        emailable,
        companyName: companyName ?? null,
        name: mapped.name ?? companyName ?? null,
        email: email ?? null,
        phone: phone ?? null,
        website: mapped.website ?? null,
        city: mapped.city ?? null,
        serviceArea: matchServiceArea(mapped.city),
        street: mapped.street ?? null,
        state: mapped.state ?? null,
        zip: mapped.zip ?? null,
        county: mapped.county ?? null,
        fullAddress: fullAddress ?? null,
        businessCategory: mapped.businessCategory ?? null,
        leadGroup: mapped.leadGroup ?? null,
        rating: mapped.rating ?? null,
        reviewCount: mapped.reviewCount ? parseInt(mapped.reviewCount, 10) || null : null,
        googleMapsUrl: mapped.googleMapsUrl ?? null,
        source: "csv",
        sourceDetail,
        emailStatus: "new",
        pipelineStage: "new",
        status: leadType === "business" ? "accepted" : "pending_admin",
      });
      created++;
    }

    if (emailable) emailableCount++;
    else if (phone) phoneOnlyCount++;
  }

  return NextResponse.json({
    created,
    merged,
    skipped,
    emailable: emailableCount,
    phoneOnly: phoneOnlyCount,
    total: body.rows.length,
  });
}
