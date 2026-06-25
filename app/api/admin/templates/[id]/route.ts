import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplates } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

const EDITABLE = [
  "name",
  "audience",
  "subject",
  "openingLine",
  "mainMessage",
  "closingLine",
  "body",
  "signerName",
  "ctaLabel",
  "ctaUrl",
  "secondaryCtaLabel",
  "secondaryCtaUrl",
] as const;

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const [row] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, params.id)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of EDITABLE) {
    if (field in body) updates[field] = body[field];
  }
  // First manual edit takes a template out of seed management so future boots
  // never clobber the operator's copy.
  updates.seedManaged = false;

  const [updated] = await db
    .update(emailTemplates)
    .set(updates)
    .where(eq(emailTemplates.id, params.id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  await db.delete(emailTemplates).where(eq(emailTemplates.id, params.id));
  return NextResponse.json({ success: true });
}
