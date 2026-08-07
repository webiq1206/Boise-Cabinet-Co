"use client";

import { useModals } from "./ModalProvider";
import { useEstimateInline } from "./useEstimateHref";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";
import { track } from "@/lib/analytics/track";

const cls =
  "block text-sm text-inverse-muted hover:text-inverse-foreground transition-colors text-left";

/** Renders a single CTA link/button - not a list item, so callers should not place it inside a <ul>. */
export function FooterCTAs() {
  const { openEstimate } = useModals();
  const inline = useEstimateInline();
  const trackClick = () =>
    track("primary_cta_clicked", { intent: "estimate", placement: "footer" });

  if (inline) {
    return (
      <a href="/#calculator" className={cls} onClick={trackClick}>
        {CTA_ESTIMATE}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        trackClick();
        openEstimate();
      }}
      className={cls}
    >
      {CTA_ESTIMATE}
    </button>
  );
}
