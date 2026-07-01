import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { renderOutreachEmail, tokensForLead } from "@/server/services/outreachRender";
import { buildUnsubscribeUrl } from "@/lib/crm/urls";

// A realistic sample recipient. Tokens are built through tokensForLead so the
// preview greeting stays identical to the real send path: business audiences
// greet generically ("Hello,") while homeowner/any audiences greet by name.
const SAMPLE_LEAD = {
  name: "Jordan Miles",
  companyName: "Valley Builders",
  city: "Meridian",
  serviceArea: "Meridian",
  serviceType: "kitchen remodel",
  phone: "(208) 555-0142",
};
const SAMPLE_EXTRA = { planningRange: "$18k to $26k", projectType: "kitchen remodel" };

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Allow previewing with no name to verify the greeting fallback.
  const lead = body.dropFirstName ? { ...SAMPLE_LEAD, name: null } : SAMPLE_LEAD;
  const tokens = tokensForLead(lead, SAMPLE_EXTRA, body.audience ?? null);

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
