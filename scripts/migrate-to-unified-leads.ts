// One-time, idempotent migration to the unified leads model.
//
// 1. Copies every outreach_prospects row into leads as leadType="business"
//    (matched by googlePlaceId stored in sourceDetail so re-runs dedupe).
// 2. Backfills emailStatus / pipelineStage / unsubscribeToken / emailable on
//    existing homeowner leads.
//
// Safe to run multiple times. Run with: npx tsx scripts/migrate-to-unified-leads.ts

import { db } from "../lib/db";
import { leads, outreachProspects } from "../shared/schema";
import { eq } from "drizzle-orm";
import { deriveEmailable, matchServiceArea } from "../lib/crm/leads";

function statusFromProspect(prospectStatus: string): {
  emailStatus: string;
  source: string;
} {
  // outreach_prospects status -> emailStatus mapping
  switch (prospectStatus) {
    case "sent":
    case "replied":
      return { emailStatus: "contacted", source: "manual" };
    case "bounced":
      return { emailStatus: "failed", source: "manual" };
    case "unsubscribed":
      return { emailStatus: "unsubscribed", source: "manual" };
    default:
      return { emailStatus: "new", source: "manual" };
  }
}

async function main() {
  if (!db) {
    console.error("[MIGRATE] Database not available. Set DATABASE_URL.");
    process.exit(1);
  }

  // --- Part 1: import prospects as business leads ---
  const prospects = await db.select().from(outreachProspects);
  // Map of already-imported prospect place ids (stored in sourceDetail).
  const existingBusiness = await db
    .select({ sourceDetail: leads.sourceDetail })
    .from(leads)
    .where(eq(leads.leadType, "business"));
  const importedPlaceIds = new Set(
    existingBusiness
      .map((r) => r.sourceDetail)
      .filter((s): s is string => Boolean(s && s.startsWith("place:")))
      .map((s) => s.replace("place:", "")),
  );

  let imported = 0;
  let skippedExisting = 0;

  for (const p of prospects) {
    if (importedPlaceIds.has(p.googlePlaceId)) {
      skippedExisting++;
      continue;
    }
    const { emailStatus } = statusFromProspect(p.status);
    const emailable = deriveEmailable(p.email, emailStatus);

    await db.insert(leads).values({
      leadType: "business",
      emailable,
      companyName: p.businessName,
      name: p.businessName,
      email: p.email ?? null,
      phone: p.phone ?? null,
      website: p.website ?? null,
      city: p.city,
      serviceArea: matchServiceArea(p.city),
      fullAddress: p.formattedAddress ?? null,
      address: p.formattedAddress ?? null,
      message: p.personalizationNote ?? null,
      source: "manual",
      sourceDetail: `place:${p.googlePlaceId}`,
      emailStatus,
      pipelineStage: "new",
      unsubscribeToken: p.unsubscribeToken,
      lastContactedAt: p.sentAt ?? null,
      status: "accepted", // business leads are not part of the homeowner review queue
    });
    imported++;
  }

  // --- Part 2: backfill homeowner leads ---
  const homeowners = await db.select().from(leads).where(eq(leads.leadType, "homeowner"));
  let backfilled = 0;

  for (const lead of homeowners) {
    const updates: Record<string, unknown> = {};

    // emailStatus / pipelineStage default to "new" via schema, but older rows
    // created before this column may be empty; normalize anyway.
    const emailStatus = lead.emailStatus || "new";
    const emailable = deriveEmailable(lead.email, emailStatus);
    if (lead.emailable !== emailable) updates.emailable = emailable;
    if (!lead.emailStatus) updates.emailStatus = "new";
    if (!lead.pipelineStage) updates.pipelineStage = "new";
    if (!lead.serviceArea) {
      const sa = matchServiceArea(lead.city);
      if (sa) updates.serviceArea = sa;
    }

    if (Object.keys(updates).length === 0) continue;
    await db.update(leads).set(updates).where(eq(leads.id, lead.id));
    backfilled++;
  }

  console.log("[MIGRATE] Done.");
  console.log(`  prospects scanned: ${prospects.length}`);
  console.log(`  business leads imported: ${imported}`);
  console.log(`  prospects skipped (already imported): ${skippedExisting}`);
  console.log(`  homeowner leads backfilled: ${backfilled}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[MIGRATE] Failed:", err);
    process.exit(1);
  });
