"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";

const cls =
  "tap-target block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left";

/** Footer estimate action goes to the short project form, not the multi-step intake. */
export function FooterCTAs() {
  const pathname = usePathname();
  const href = pathname === "/" ? "/#project-request" : "/estimate#estimate-request";
  return (
    <Link
      prefetch={false}
      href={href}
      className={cls}
      onClick={() => track("primary_cta_clicked", { intent: "estimate", placement: "footer" })}
    >
      {CTA_ESTIMATE}
    </Link>
  );
}
