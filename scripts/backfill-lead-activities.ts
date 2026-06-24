/**
 * Backfill the lead activity timeline from existing lead audit fields and notes.
 *
 * Idempotent: any lead that already has at least one stored activity row is
 * skipped, so this can be run more than once safely. The synthetic "created"
 * event is derived at read time and is never stored, so it is not backfilled.
 *
 * Run: npx tsx scripts/backfill-lead-activities.ts
 */
import { db } from "@/lib/db";
import { leads, leadActivities, users } from "@/shared/schema";
import { eq } from "drizzle-orm";

interface NoteEntry {
  text: string;
  addedBy?: string;
  addedAt?: string;
}

function parseNotes(val: unknown): NoteEntry[] {
  if (Array.isArray(val)) return val as NoteEntry[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as NoteEntry[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function main() {
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  const userRows = await db.select().from(users);
  const nameById = new Map<string, string>();
  for (const u of userRows) {
    const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    nameById.set(u.id, full || u.email || u.id);
  }

  const allLeads = await db.select().from(leads);
  console.log(`Found ${allLeads.length} leads to evaluate.`);

  let inserted = 0;
  let skipped = 0;

  for (const lead of allLeads) {
    const existing = await db
      .select({ id: leadActivities.id })
      .from(leadActivities)
      .where(eq(leadActivities.leadId, lead.id))
      .limit(1);
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const rows: Array<typeof leadActivities.$inferInsert> = [];

    // Notes -> note activities (preserve original author + timestamp).
    for (const note of parseNotes(lead.notes)) {
      if (!note?.text) continue;
      const created = note.addedAt ? new Date(note.addedAt) : (lead.createdAt as Date);
      rows.push({
        leadId: lead.id,
        type: "note",
        message: note.text,
        actorName: note.addedBy || null,
        createdAt: isNaN(created.getTime()) ? (lead.createdAt as Date) : created,
      });
    }

    // Admin review -> accepted or declined.
    if (lead.adminReviewedAt) {
      const actorName = lead.adminReviewedBy ? nameById.get(lead.adminReviewedBy) || null : null;
      if (lead.adminDeclined) {
        rows.push({
          leadId: lead.id,
          type: "status_change",
          message: "Lead declined",
          detail: { to: "declined" },
          actorId: lead.adminReviewedBy ?? null,
          actorName,
          createdAt: lead.adminReviewedAt as Date,
        });
      } else {
        rows.push({
          leadId: lead.id,
          type: "accepted",
          message: "Lead accepted",
          detail: { to: "accepted" },
          actorId: lead.adminReviewedBy ?? null,
          actorName,
          createdAt: lead.adminReviewedAt as Date,
        });
      }
    }

    // Purchase tracking -> purchased.
    if (lead.purchasedAt) {
      const actorName = lead.purchasedBy ? nameById.get(lead.purchasedBy) || null : null;
      rows.push({
        leadId: lead.id,
        type: "purchased",
        message: "Lead purchased",
        actorId: lead.purchasedBy ?? null,
        actorName,
        createdAt: lead.purchasedAt as Date,
      });
    }

    // Project conversion -> converted.
    if (lead.convertedToProjectAt) {
      rows.push({
        leadId: lead.id,
        type: "converted",
        message: "Converted to project",
        detail: lead.projectId ? { projectId: lead.projectId } : null,
        createdAt: lead.convertedToProjectAt as Date,
      });
    }

    if (rows.length === 0) {
      skipped++;
      continue;
    }

    await db.insert(leadActivities).values(rows);
    inserted += rows.length;
  }

  console.log(`Backfill complete. Inserted ${inserted} activities across leads (skipped ${skipped}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
