import type { EstimateRecord } from "@/shared/estimateRecord";
import { formatEstimateRecordText } from "@/shared/estimateRecord";

const LEAD_DASHBOARD_URL =
  process.env.LEAD_DASHBOARD_API_URL || "https://leads.boiseremodeling.co/api/external/leads";

export interface LeadDashboardPayload {
  fullName: string;
  email: string;
  phone?: string;
  propertyAddress?: string;
  zip?: string;
  city?: string;
  state?: string;
  projectTypes?: string[];
  projectScope?: string;
  /** When the homeowner wants to start. */
  timeline?: string;
  /** The homeowner's own description of what they want. */
  projectGoals?: string;
  /**
   * Homeowner's stated budget band. Named to match the dashboard's own
   * `budgetRange` field - it validates with zod and strips unknown keys, so a
   * mismatched name is silently discarded rather than rejected.
   */
  budgetRange?: string;
  /** Planning range the homeowner was shown, in dollars. */
  estimateLow?: number;
  estimateHigh?: number;
  /** The range as displayed, e.g. "$28k to $41k". */
  estimateRange?: string;
  /** Full structured record of every selection and disclosure. */
  estimate?: EstimateRecord | null;
  /** Readable rendering of the same record, for CRMs with only a notes field. */
  estimateSummary?: string;
}

export interface ForwardLeadInput extends Omit<LeadDashboardPayload, "estimateSummary"> {
  /** Free-text notes the homeowner typed. */
  notes?: string;
}

/**
 * Compose the outbound body.
 *
 * Two representations of the same data go out together on purpose. The
 * structured `estimate` object is what the dashboard should map into real
 * fields, but we cannot assume it stores every key we send - so the same record
 * is also flattened into `projectScope`, a plain-text field the dashboard is
 * known to have. Whichever end of that contract changes, the sales team still
 * ends up with the complete picture rather than a bare price range.
 */
/**
 * The dashboard caps projectScope at 2000 characters and rejects the whole
 * request with a 400 if it is exceeded - which would drop the lead entirely.
 * A three-room estimate can render past that, so the text field is always
 * clamped here. The untruncated copy still travels in `estimateSummary`, and
 * the machine-readable original in `estimate`.
 */
const PROJECT_SCOPE_MAX = 2000;
const TRUNCATION_NOTE = "\n\n[Truncated - full estimate on the lead record.]";

function clampScope(text: string): string {
  if (text.length <= PROJECT_SCOPE_MAX) return text;
  return text.slice(0, PROJECT_SCOPE_MAX - TRUNCATION_NOTE.length) + TRUNCATION_NOTE;
}

export function buildLeadDashboardBody(input: ForwardLeadInput): Record<string, unknown> {
  const { notes, estimate, ...rest } = input;

  const summary = estimate ? formatEstimateRecordText(estimate) : "";
  // Notes first so a human reading the field sees the homeowner's own words
  // before the generated block.
  const scope = [notes?.trim(), summary].filter(Boolean).join("\n\n");

  return {
    ...rest,
    estimate: estimate ?? undefined,
    estimateSummary: summary || undefined,
    projectScope: scope ? clampScope(scope) : rest.projectScope || undefined,
    source: "boisecabinet.co",
  };
}

/**
 * Forward a validated lead to the external Boise Remodeling lead dashboard.
 * Fire-and-forget: never throws and never blocks the caller's response.
 * No-ops (with a warning) if LEAD_DASHBOARD_KEY is not configured.
 */
export function forwardLeadToDashboard(input: ForwardLeadInput): void {
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
    body: JSON.stringify(buildLeadDashboardBody(input)),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[Lead Dashboard] Forward failed: HTTP ${res.status}`);
      }
    })
    .catch((err) => console.error("[Lead Dashboard]", err));
}
