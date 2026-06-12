import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { buildOutreachCopy } from "@/lib/outreach/template";
import { buildUnsubscribeUrl } from "@/lib/outreach/sender";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const rows = await db
    .select()
    .from(outreachProspects)
    .where(eq(outreachProspects.id, id))
    .limit(1);
  const prospect = rows[0];
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy = buildOutreachCopy({
    businessName: prospect.businessName,
    city: prospect.city,
    personalizationNote: prospect.personalizationNote,
    unsubscribeUrl: buildUnsubscribeUrl(prospect.unsubscribeToken),
    seed: prospect.id,
  });

  return NextResponse.json({
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
    from: prospect.email,
    businessName: prospect.businessName,
    status: prospect.status,
  });
}
