import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["sent", "replied", "bounced", "unsubscribed"]).optional(),
  note: z.string().max(500).optional(),
  lastError: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id, status, note, lastError } = parsed.data;
  const rows = await db.select().from(outreachProspects).where(eq(outreachProspects.id, id)).limit(1);
  const prospect = rows[0];
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const now = new Date();

  if (status === "replied") {
    updates.status = "replied";
    updates.repliedAt = now;
  } else if (status === "bounced") {
    updates.status = "bounced";
    updates.bouncedAt = now;
  } else if (status === "unsubscribed") {
    updates.status = "unsubscribed";
    updates.unsubscribedAt = now;
  } else if (status === "sent") {
    updates.status = "sent";
    updates.sentAt = now;
  }

  if (lastError !== undefined) updates.lastError = lastError || null;
  if (note !== undefined) updates.personalizationNote = note || null;

  const [updated] = await db
    .update(outreachProspects)
    .set(updates)
    .where(eq(outreachProspects.id, id))
    .returning();

  return NextResponse.json(updated);
}
