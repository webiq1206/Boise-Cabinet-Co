"use server";

import { revalidatePath } from "next/cache";
import { setStatus } from "@/lib/backlinks/pipeline";

/**
 * Approve a drafted outreach / submission. This is the one-tap human gate:
 * moving to "actioned" marks it ready for the (separate, credential-gated)
 * sender/submitter to dispatch. Nothing is sent by this action itself.
 */
export async function approveOpportunity(id: string): Promise<void> {
  setStatus(id, "actioned", "Approved by human; queued to send/submit", new Date().toISOString());
  revalidatePath("/admin/backlinks");
}

export async function rejectOpportunity(id: string): Promise<void> {
  setStatus(id, "rejected", "Rejected by human", new Date().toISOString());
  revalidatePath("/admin/backlinks");
}

/** Mark that the link is now live (detected manually or by monitoring). */
export async function markWon(id: string): Promise<void> {
  setStatus(id, "won", "Link confirmed live", new Date().toISOString());
  revalidatePath("/admin/backlinks");
}

/** Send a rejected/actioned item back into the review queue. */
export async function reopenOpportunity(id: string): Promise<void> {
  setStatus(id, "awaiting_approval", "Reopened for review", new Date().toISOString());
  revalidatePath("/admin/backlinks");
}
