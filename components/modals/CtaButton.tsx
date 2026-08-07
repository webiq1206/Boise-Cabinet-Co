"use client";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { useModals } from "./ModalProvider";
import { useEstimateInline } from "./useEstimateHref";
import { track } from "@/lib/analytics/track";

interface CtaButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /**
   * "estimate" opens the quote flow from the start, resuming any saved
   * progress. "visit" deep-links straight to the booking/contact step for a
   * visitor who just wants to talk, not build a range first.
   */
  intent?: "estimate" | "visit";
  onExtraClick?: () => void;
}

export function CtaButton({ intent = "estimate", onExtraClick, children, ...props }: CtaButtonProps) {
  const { openEstimate, openConsult } = useModals();
  const inline = useEstimateInline();
  const open = intent === "visit" ? openConsult : openEstimate;
  const trackClick = () =>
    track(intent === "visit" ? "secondary_cta_clicked" : "primary_cta_clicked", { intent });

  if (inline) {
    return (
      <Button {...props} asChild>
        <a
          href="/#calculator"
          onClick={() => {
            trackClick();
            onExtraClick?.();
          }}
        >
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button
      {...props}
      onClick={() => {
        trackClick();
        open();
        onExtraClick?.();
      }}
    >
      {children}
    </Button>
  );
}
