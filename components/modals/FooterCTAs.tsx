"use client";

import Link from "next/link";
import { CTA_ESTIMATE, CTA_QUOTE_HREF } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";

/**
 * A footer call-to-action link. Renders a single link, styled by the family
 * footer's contact list (components/family/SiteFooter), so callers place it
 * inside an li. The defaults are the quote request link; the footer also
 * renders one for the instant estimate.
 */
export function FooterCTAs({
  label = CTA_ESTIMATE,
  href = CTA_QUOTE_HREF,
  testId = "link-footer-quote",
}: { label?: string; href?: string; testId?: string }) {
  return (
    <Link
      prefetch={false}
      href={href}
      onClick={() => track("primary_cta_clicked", { intent: "estimate", placement: "footer", destination: href === CTA_QUOTE_HREF ? "quote" : "instant_estimate" })}
      data-testid={testId}
    >
      {label}
    </Link>
  );
}
