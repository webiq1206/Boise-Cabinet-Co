"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { CTA_QUOTE_HREF } from "@/shared/ctaCopy";

interface CtaButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /**
   * Kept for analytics only. Every primary quote CTA now has one destination,
   * /estimate, so "estimate" and "visit" both navigate there; the intent still
   * tells primary and secondary placements apart in GA4.
   */
  intent?: "estimate" | "visit";
  onExtraClick?: () => void;
}

export function CtaButton({ intent = "estimate", onExtraClick, children, ...props }: CtaButtonProps) {
  return (
    <Button {...props} asChild>
      <Link
        prefetch={false}
        href={CTA_QUOTE_HREF}
        onClick={() => {
          track(intent === "visit" ? "secondary_cta_clicked" : "primary_cta_clicked", { intent });
          onExtraClick?.();
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
