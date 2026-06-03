export type DesignAnalyticsEvent =
  | "scan_started"
  | "scan_completed"
  | "scan_failed"
  | "scan_method"
  | "ar_unsupported"
  | "layout_blocked_no_scan"
  | "vision_scan_low_confidence"
  | "webgl_error"
  | "step_blocked"
  | "save_failed"
  | "device_class";

export type EstimatorAnalyticsEvent =
  | "estimator_step_view"
  | "estimator_complete"
  | "estimator_book_visit";

function deviceClass(): string {
  if (typeof window === "undefined") return "server";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function trackDesignEvent(
  event: DesignAnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const payload = { event, device: deviceClass(), ...props, ts: Date.now() };
  window.dispatchEvent(
    new CustomEvent("brc-design-analytics", { detail: payload }),
  );
  if (process.env.NODE_ENV === "development") {
    console.debug("[design-analytics]", payload);
  }
}

export function trackEstimatorEvent(
  event: EstimatorAnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const payload = { event, device: deviceClass(), ...props, ts: Date.now() };
  window.dispatchEvent(
    new CustomEvent("brc-estimator-analytics", { detail: payload }),
  );
  if (process.env.NODE_ENV === "development") {
    console.debug("[estimator-analytics]", payload);
  }
}

if (typeof window !== "undefined") {
  trackDesignEvent("device_class", { class: deviceClass() });
}
