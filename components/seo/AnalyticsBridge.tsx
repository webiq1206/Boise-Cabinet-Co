"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import { bindDelegatedContactClicks } from "@/lib/callTextClickConversion";

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

  // One delegated listener for every tel:/sms:/mailto: link. GA4 events stay
  // phone_clicked, text_clicked, and email_clicked. The same listener sends
  // the Ads click conversion when the tag bootstrap would allow it.
  useEffect(() => bindDelegatedContactClicks(), []);

  return null;
}
