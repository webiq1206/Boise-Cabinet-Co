import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

// Bulk actions over selected prospects. This is how the owner chooses who gets
// automatic sending: approving puts a contractor in the send queue, skipping
// takes them out. Nothing here ever touches website (warm) leads, which live in
// a completely separate system and are never cold-emailed.

const bodySchema = z.object({
  action: z.enum(["approve", "skip", "delete"]),
  ids: z.array(z.string()).min(1).max(1000),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, ids } = parsed.data;

  if (action === "delete") {
    const deleted = await db
      .delete(outreachProspects)
      .where(inArray(outreachProspects.id, ids))
      .returning({ id: outreachProspects.id });
    return NextResponse.json({ action, affected: deleted.length });
  }

  if (action === "skip") {
    const updated = await db
      .update(outreachProspects)
      .set({ status: "skipped", updatedAt: new Date() })
      .where(inArray(outreachProspects.id, ids))
      .returning({ id: outreachProspects.id });
    return NextResponse.json({ action, affected: updated.length });
  }

  // approve: only contractors that have an email AND are in a pre-send state can
  // be queued. This avoids re-queuing anyone already sent/opened/replied or who
  // unsubscribed, which would risk a duplicate cold email.
  const APPROVABLE_STATUSES = ["discovered", "needs_email", "ready", "skipped", "error"];
  const updated = await db
    .update(outreachProspects)
    .set({ status: "approved", approvedAt: new Date(), lastError: null, updatedAt: new Date() })
    .where(
      and(
        inArray(outreachProspects.id, ids),
        isNotNull(outreachProspects.email),
        inArray(outreachProspects.status, APPROVABLE_STATUSES),
      ),
    )
    .returning({ id: outreachProspects.id });

  return NextResponse.json({
    action,
    affected: updated.length,
    skippedNoEmail: ids.length - updated.length,
  });
}
