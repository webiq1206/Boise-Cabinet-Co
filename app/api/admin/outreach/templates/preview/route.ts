import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { buildOutreachCopy, resolveTemplateKey } from "@/lib/outreach/template";
import { mergeTemplateContent } from "@/lib/outreach/templateContent";

// Render a live preview of draft template wording against a sample contractor,
// before the admin saves. Never touches the database.

const bodySchema = z.object({
  templateKey: z.string(),
  content: z.unknown(),
  businessName: z.string().optional(),
  city: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const content = mergeTemplateContent(parsed.data.content);
  const businessName = parsed.data.businessName?.trim() || "Sample Contractor LLC";
  const city = parsed.data.city?.trim() || "Boise";

  const copy = buildOutreachCopy({
    businessName,
    city,
    personalizationNote: null,
    unsubscribeUrl: "https://example.com/unsubscribe?token=sample",
    seed: "preview",
    content,
    templateKey: resolveTemplateKey(parsed.data.templateKey),
  });

  return NextResponse.json({
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
    businessName,
    city,
  });
}
