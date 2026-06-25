import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailTemplates } from "@/shared/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const rows = await db.select().from(emailTemplates).orderBy(asc(emailTemplates.name));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.subject) {
    return NextResponse.json({ error: "name and subject required" }, { status: 400 });
  }

  const id = body.id || slugify(body.name) || `template-${Date.now()}`;

  const [created] = await db
    .insert(emailTemplates)
    .values({
      id,
      name: body.name,
      audience: body.audience || "homeowner",
      subject: body.subject,
      openingLine: body.openingLine ?? null,
      mainMessage: body.mainMessage ?? null,
      closingLine: body.closingLine ?? null,
      body: body.body ?? null,
      signerName: body.signerName ?? null,
      ctaLabel: body.ctaLabel ?? null,
      ctaUrl: body.ctaUrl ?? null,
      secondaryCtaLabel: body.secondaryCtaLabel ?? null,
      secondaryCtaUrl: body.secondaryCtaUrl ?? null,
      seedManaged: false,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
