export type DesignAnalyticsEvent =
  | "scan_started"
  | "scan_completed"
  | "scan_method"
  | "ar_unsupported"
  | "layout_blocked_no_scan"
  | "vision_scan_low_confidence";

export function trackDesignEvent(
  event: DesignAnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const payload = { event, ...props, ts: Date.now() };
  window.dispatchEvent(
    new CustomEvent("brc-design-analytics", { detail: payload }),
  );
  if (process.env.NODE_ENV === "development") {
    console.debug("[design-analytics]", payload);
  }
}
