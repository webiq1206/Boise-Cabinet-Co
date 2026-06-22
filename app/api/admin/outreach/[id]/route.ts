import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { hasEmDash } from "@/lib/outreach/text";
import { isEmailOnDomain } from "@/lib/outreach/emailScraper";

const patchSchema = z.object({
  action: z.enum(["approve", "skip", "reset", "edit"]),
  email: z.string().email().optional(),
  personalizationNote: z.string().max(400).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(outreachProspects)
    .where(eq(outreachProspects.id, id))
    .limit(1);
  const prospect = rows[0];
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (parsed.data.personalizationNote !== undefined) {
    if (hasEmDash(parsed.data.personalizationNote)) {
      return NextResponse.json(
        { error: "Personalization note must not contain em-dashes." },
        { status: 400 },
      );
    }
    updates.personalizationNote = parsed.data.personalizationNote.trim() || null;
  }

  if (parsed.data.email !== undefined) {
    // Provenance guard: an admin may only enter an address that provably lives
    // on the contractor's own website domain. This blocks guessing/fabricating
    // (e.g. info@theircompany.com) or pasting a third-party address. Mirrors the
    // scraper's on-domain rule so manual entry can't bypass it.
    if (!isEmailOnDomain(parsed.data.email, prospect.website)) {
      return NextResponse.json(
        {
          error:
            "Email must be on the contractor's own website domain. We never guess or use third-party addresses.",
        },
        { status: 400 },
      );
    }
    updates.email = parsed.data.email.toLowerCase();
    updates.emailSourceUrl = "manual: entered by admin (on-domain verified)";
  }

  switch (parsed.data.action) {
    case "approve": {
      const email = (updates.email as string) ?? prospect.email;
      if (!email) {
        return NextResponse.json(
          { error: "Cannot approve a prospect without an email." },
          { status: 400 },
        );
      }
      updates.status = "approved";
      updates.approvedAt = new Date();
      updates.lastError = null;
      break;
    }
    case "skip":
      updates.status = "skipped";
      break;
    case "reset":
      updates.status = prospect.email ? "ready" : "needs_email";
      updates.approvedAt = null;
      updates.lastError = null;
      break;
    case "edit":
      // Field updates already applied above; keep current status.
      break;
  }

  const [updated] = await db
    .update(outreachProspects)
    .set(updates)
    .where(eq(outreachProspects.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  await db.delete(outreachProspects).where(eq(outreachProspects.id, id));
  return NextResponse.json({ success: true });
}
