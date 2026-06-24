import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outreachProspects } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { buildOutreachCopy } from "@/lib/outreach/template";
import { buildUnsubscribeUrl } from "@/lib/outreach/sender";
import { getOutreachConfig, getOutreachFromEmail, getOutreachSenderName } from "@/lib/outreach/config";
import { getOutreachTemplateContent } from "@/lib/outreach/templateContent";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Optional override so the admin can preview a template before saving it. When
  // absent, the effective template is the prospect override else the batch
  // default, matching exactly what a real send would build.
  const templateParam = request.nextUrl.searchParams.get("template");

  const rows = await db
    .select()
    .from(outreachProspects)
    .where(eq(outreachProspects.id, id))
    .limit(1);
  const prospect = rows[0];
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const config = await getOutreachConfig();
  const content = await getOutreachTemplateContent();
  const templateKey = templateParam ?? prospect.templateKey ?? config.defaultTemplate;

  const copy = buildOutreachCopy({
    businessName: prospect.businessName,
    city: prospect.city,
    personalizationNote: prospect.personalizationNote,
    unsubscribeUrl: buildUnsubscribeUrl(prospect.unsubscribeToken),
    seed: prospect.id,
    content,
    templateKey,
  });

  // Show the address the email will actually be sent FROM (the configured
  // outreach sender), not the recipient's address. Falls back to a clear
  // placeholder until the sender is configured.
  const fromEmail = getOutreachFromEmail();
  const from = fromEmail ? `${getOutreachSenderName()} <${fromEmail}>` : null;

  return NextResponse.json({
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
    from,
    to: prospect.email,
    businessName: prospect.businessName,
    status: prospect.status,
  });
}
