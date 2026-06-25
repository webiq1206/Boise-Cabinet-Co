import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects, outreachSuppressions, leads } from "@/shared/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

// Lists every address on the permanent do-not-email list, newest first, so an
// admin can understand why outreach is shrinking and undo mistaken entries.
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const rows = await db
    .select()
    .from(outreachSuppressions)
    .orderBy(desc(outreachSuppressions.createdAt))
    .limit(5000);

  return NextResponse.json({ suppressions: rows });
}

const postSchema = z.object({
  email: z.string().email(),
});

// Manually add an address to the do-not-email list (reason "manual"). Also marks
// any matching prospect/lead so the address leaves the send queue immediately.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  await db
    .insert(outreachSuppressions)
    .values({ email, reason: "manual" })
    .onConflictDoNothing();

  const now = new Date();
  await db
    .update(outreachProspects)
    .set({ status: "unsubscribed", unsubscribedAt: now, updatedAt: now })
    .where(eq(outreachProspects.email, email));
  await db
    .update(leads)
    .set({ emailStatus: "unsubscribed", emailable: false, updatedAt: now })
    .where(eq(leads.email, email));

  const [row] = await db
    .select()
    .from(outreachSuppressions)
    .where(eq(outreachSuppressions.email, email))
    .limit(1);

  return NextResponse.json({ suppression: row });
}

const deleteSchema = z.object({
  email: z.string().email(),
});

// Remove an address that was suppressed by mistake so outreach can reach it again.
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  await db.delete(outreachSuppressions).where(eq(outreachSuppressions.email, email));

  return NextResponse.json({ success: true });
}
