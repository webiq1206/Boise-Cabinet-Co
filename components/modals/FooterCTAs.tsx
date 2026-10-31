"use client";

import Link from "next/link";
import { CTA_ESTIMATE, CTA_QUOTE_HREF } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";

const cls =
  "tap-target block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left";

/** Renders a single CTA link - not a list item, so callers should not place it inside a <ul>. */
export function FooterCTAs() {
  return (
    <Link
      prefetch={false}
      href={CTA_QUOTE_HREF}
      className={cls}
      onClick={() => track("primary_cta_clicked", { intent: "estimate", placement: "footer" })}
    >
      {CTA_ESTIMATE}
    </Link>
  );
}
