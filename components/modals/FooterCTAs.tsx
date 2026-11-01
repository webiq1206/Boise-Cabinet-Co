"use client";

import Link from "next/link";
import { CTA_ESTIMATE, CTA_QUOTE_HREF } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";

/**
 * The footer's quote link. Renders a single link, styled by the family footer's
 * contact list (components/family/SiteFooter), so callers place it inside an li.
 */
export function FooterCTAs({ label = CTA_ESTIMATE, href = CTA_QUOTE_HREF }: { label?: string; href?: string }) {
  return (
    <Link
      prefetch={false}
      href={href}
      onClick={() => track("primary_cta_clicked", { intent: "estimate", placement: "footer" })}
      data-testid="link-footer-quote"
    >
      {label}
    </Link>
  );
}
