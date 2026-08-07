"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

/**
 * The design-studio and estimator flows already dispatch
 * "brc-design-analytics" / "brc-estimator-analytics" CustomEvents throughout
 * their code (trackDesignEvent/trackEstimatorEvent in lib/design/designAnalytics.ts)
 * but until now nothing listened for them, so every one of those calls was a
 * silent no-op outside dev console logs. This forwards them to GA4 without
 * touching the many call sites that already fire them.
 */
export function AnalyticsBridge() {
  useEffect(() => {
    function forward(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { event: string; [key: string]: unknown }
        | undefined;
      if (!detail?.event) return;
      const { event, ...rest } = detail;
      track(event, rest as Record<string, string | number | boolean>);
    }

    window.addEventListener("brc-design-analytics", forward);
    window.addEventListener("brc-estimator-analytics", forward);
    return () => {
      window.removeEventListener("brc-design-analytics", forward);
      window.removeEventListener("brc-estimator-analytics", forward);
    };
  }, []);

  // Delegated click tracking for every tel:/sms:/mailto: link sitewide - one
  // listener instruments Call/Text/Email everywhere (nav, footer, hero,
  // location and room pages, etc.) instead of instrumenting each call site.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith("tel:")) track("phone_clicked");
      else if (href.startsWith("sms:")) track("text_clicked");
      else if (href.startsWith("mailto:")) track("email_clicked");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
