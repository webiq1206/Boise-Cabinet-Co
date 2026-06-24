import { db } from "@/lib/db";
import { leadActivities, type Lead, type LeadActivity, type User } from "@/shared/schema";
import { and, asc, eq } from "drizzle-orm";

export type LeadActivityType =
  | "created"
  | "note"
  | "contact_attempt"
  | "status_change"
  | "accepted"
  | "converted"
  | "price_change"
  | "email_sent"
  | "purchased";

export interface RecordLeadActivityInput {
  leadId: string;
  type: LeadActivityType;
  message: string;
  detail?: Record<string, unknown> | null;
  actorId?: string | null;
  actorName?: string | null;
}

// Build a friendly display name for whoever performed an action.
export function actorNameFromUser(
  user: Pick<User, "firstName" | "lastName" | "email" | "id"> | null | undefined,
): string {
  if (!user) return "System";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.email || user.id || "Admin";
}

// Insert a single timeline event. Never throws into the caller's main flow so
// activity logging cannot break a lead action; failures are logged instead.
export async function recordLeadActivity(
  input: RecordLeadActivityInput,
): Promise<LeadActivity | null> {
  if (!db) return null;
  try {
    const [row] = await db
      .insert(leadActivities)
      .values({
        leadId: input.leadId,
        type: input.type,
        message: input.message,
        detail: input.detail ?? null,
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
      })
      .returning();
    return row ?? null;
  } catch (err) {
    console.error("[leadActivity] Failed to record activity:", err);
    return null;
  }
}

export interface TimelineEntry {
  id: string;
  type: LeadActivityType;
  message: string;
  detail: Record<string, unknown> | null;
  actorName: string | null;
  createdAt: string;
}

// Returns the full chronological timeline for a lead, newest first. Combines a
// synthetic "created" event (derived from the lead row) with the stored
// activity rows. The "created" event is never stored, so there is no risk of
// duplicating it during backfill.
export async function buildLeadTimeline(lead: Lead): Promise<TimelineEntry[]> {
  const stored: TimelineEntry[] = [];
  if (db) {
    const rows = await db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, lead.id))
      .orderBy(asc(leadActivities.createdAt));
    for (const r of rows) {
      stored.push({
        id: r.id,
        type: r.type as LeadActivityType,
        message: r.message,
        detail: (r.detail as Record<string, unknown> | null) ?? null,
        actorName: r.actorName,
        createdAt: (r.createdAt as Date).toISOString(),
      });
    }
  }

  const createdRaw = lead.createdAt as unknown;
  const createdDate = createdRaw instanceof Date ? createdRaw : new Date(createdRaw as string);
  const createdEntry: TimelineEntry = {
    id: `created-${lead.id}`,
    type: "created",
    message: "Lead created",
    detail: { source: lead.source ?? "consultation" },
    actorName: null,
    createdAt: createdDate.toISOString(),
  };

  const all = [createdEntry, ...stored];
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all;
}

// True when a lead already has any stored activity rows. Used by the backfill
// script to stay idempotent.
export async function leadHasActivities(leadId: string): Promise<boolean> {
  if (!db) return false;
  const rows = await db
    .select({ id: leadActivities.id })
    .from(leadActivities)
    .where(and(eq(leadActivities.leadId, leadId)))
    .limit(1);
  return rows.length > 0;
}
