import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { hasEmDash } from "@/lib/outreach/text";
import {
  OUTREACH_TEMPLATE_CONTENT_KEY,
  DEFAULT_TEMPLATE_CONTENT,
  OUTREACH_TEMPLATE_FIELDS,
  OUTREACH_TEMPLATE_TOKENS,
  getOutreachTemplateContent,
  mergeTemplateContent,
} from "@/lib/outreach/templateContent";

// View and edit the human wording of the cold-outreach templates. The template
// structure, signature, and CAN-SPAM footer stay code-owned; only the editable
// copy lives here and is stored as one JSON blob in site_settings.

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const content = await getOutreachTemplateContent();
  return NextResponse.json({
    content,
    defaults: DEFAULT_TEMPLATE_CONTENT,
    fields: OUTREACH_TEMPLATE_FIELDS,
    tokens: OUTREACH_TEMPLATE_TOKENS,
  });
}

const personalSchema = z.object({
  subject: z.string().max(200),
  opener: z.string().max(800),
  pitch: z.string().max(3000),
  closing: z.string().max(1200),
});

const brandedSchema = z.object({
  subject: z.string().max(200),
  intro: z.string().max(2000),
  bullets: z.array(z.string().max(400)).max(8),
  closing: z.string().max(1200),
});

const patchSchema = z.object({
  personal: personalSchema,
  branded: brandedSchema,
});

function collectStrings(content: z.infer<typeof patchSchema>): string[] {
  return [
    content.personal.subject,
    content.personal.opener,
    content.personal.pitch,
    content.personal.closing,
    content.branded.subject,
    content.branded.intro,
    ...content.branded.bullets,
    content.branded.closing,
  ];
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Hard rule for this site: no em-dashes anywhere in outreach copy.
  if (collectStrings(parsed.data).some((s) => hasEmDash(s))) {
    return NextResponse.json(
      { error: "Templates must not contain em-dashes or en-dashes." },
      { status: 400 },
    );
  }

  // Normalize (drops blank bullets, trims) and store as one JSON value.
  const merged = mergeTemplateContent(parsed.data);
  const value = JSON.stringify(merged);
  const userId = auth.user!.id;

  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, OUTREACH_TEMPLATE_CONTENT_KEY));
  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date(), updatedBy: userId })
      .where(eq(siteSettings.key, OUTREACH_TEMPLATE_CONTENT_KEY));
  } else {
    await db
      .insert(siteSettings)
      .values({ key: OUTREACH_TEMPLATE_CONTENT_KEY, value, updatedBy: userId });
  }

  return NextResponse.json({ content: merged });
}
