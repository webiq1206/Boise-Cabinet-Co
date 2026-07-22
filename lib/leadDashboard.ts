const LEAD_DASHBOARD_URL = "https://leads.boiseremodeling.co/api/external/leads";

export interface LeadDashboardPayload {
  fullName: string;
  email: string;
  phone?: string;
  propertyAddress?: string;
  zip?: string;
  projectTypes?: string[];
  projectScope?: string;
}

/**
 * Forward a validated lead to the external Boise Remodeling lead dashboard.
 * Fire-and-forget: never throws and never blocks the caller's response.
 * No-ops (with a warning) if LEAD_DASHBOARD_KEY is not configured.
 */
export function forwardLeadToDashboard(payload: LeadDashboardPayload): void {
  const key = process.env.LEAD_DASHBOARD_KEY;
  if (!key) {
    console.warn("[Lead Dashboard] LEAD_DASHBOARD_KEY not set; skipping forward");
    return;
  }

  fetch(LEAD_DASHBOARD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ ...payload, source: "boisecabinet.co" }),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[Lead Dashboard] Forward failed: HTTP ${res.status}`);
      }
    })
    .catch((err) => console.error("[Lead Dashboard]", err));
}
