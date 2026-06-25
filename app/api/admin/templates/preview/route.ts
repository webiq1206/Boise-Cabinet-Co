import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { renderOutreachEmail, type RenderTokens } from "@/server/services/outreachRender";
import { buildUnsubscribeUrl } from "@/lib/crm/urls";

// Sample tokens so the operator sees a realistic preview.
const SAMPLE_TOKENS: RenderTokens = {
  firstName: "Jordan",
  business: "Valley Builders",
  city: "Meridian",
  projectType: "kitchen remodel",
  serviceArea: "Meridian",
  planningRange: "$18k to $26k",
  phone: "(208) 555-0142",
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Allow previewing with no firstName to verify the greeting fallback.
  const tokens: RenderTokens = body.dropFirstName
    ? { ...SAMPLE_TOKENS, firstName: null }
    : SAMPLE_TOKENS;

  const rendered = renderOutreachEmail({
    template: {
      subject: body.subject || "(no subject)",
      openingLine: body.openingLine,
      mainMessage: body.mainMessage,
      closingLine: body.closingLine,
      body: body.body,
      signerName: body.signerName,
      ctaLabel: body.ctaLabel,
      ctaUrl: body.ctaUrl,
      secondaryCtaLabel: body.secondaryCtaLabel,
      secondaryCtaUrl: body.secondaryCtaUrl,
    },
    tokens,
    unsubscribeUrl: buildUnsubscribeUrl("preview-token"),
  });

  return NextResponse.json({ subject: rendered.subject, html: rendered.html });
}
