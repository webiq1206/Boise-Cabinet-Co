"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { CTA_QUOTE_HREF } from "@/shared/ctaCopy";
import { instantEstimateHref } from "@/shared/instantEstimate";

interface CtaButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /**
   * Kept for analytics only. "estimate" and "visit" navigate to the same place;
   * the intent still tells primary and secondary placements apart in GA4.
   */
  intent?: "estimate" | "visit";
  /**
   * Where the button goes. "quote" (the default) is the quote request form at
   * /estimate, so every existing use keeps its destination. "instant-estimate"
   * is the family estimator at /instant-estimate; use it only where the
   * estimator can price the page's project, and label the button
   * CTA_INSTANT_ESTIMATE.
   */
  destination?: "quote" | "instant-estimate";
  /** With destination "instant-estimate": the estimator project to open on. */
  estimatorProject?: string | null;
  onExtraClick?: () => void;
}

export function CtaButton({ intent = "estimate", destination = "quote", estimatorProject, onExtraClick, children, ...props }: CtaButtonProps) {
  const toEstimator = destination === "instant-estimate";
  return (
    <Button {...props} asChild>
      <Link
        prefetch={false}
        href={toEstimator ? instantEstimateHref(estimatorProject) : CTA_QUOTE_HREF}
        onClick={() => {
          track(intent === "visit" ? "secondary_cta_clicked" : "primary_cta_clicked", toEstimator ? { intent, destination: "instant_estimate" } : { intent });
          onExtraClick?.();
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
