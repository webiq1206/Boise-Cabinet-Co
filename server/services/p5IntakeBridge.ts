/**
 * Bridge from an accepted Cabinet consultation to the multi-brand intake on
 * p5homeco.com. Never awaited on the visitor's path.
 *
 * That route already creates the HubSpot contact, the mapped deal, and the
 * "New lead" team email. This repo must not take a HubSpot dependency or a
 * portal token. A bridge failure is logged and never thrown, so the visitor
 * response, the local save, the customer's confirmation, and the BRC
 * dashboard forward stay independent of it.
 *
 * One team email per request (owner decision, 17 November 2026): the bridge
 * asks p5 to confirm its team email (`team_alert: "confirm"`) and returns
 * what p5 answered. This site's own team email is the fallback, decided from
 * that answer in server/services/teamEmail.ts. `team_notes` carries what only
 * this site knows, and p5 prints it in its email under "From the website".
 * That email reaches HubSpot, so team_notes never carry a cost or a margin.
 *
 * Project strings are rewritten only when p5 already accepts them: either as
 * a HUBSPOT_PROJECT_TYPES value or as a PROJECT_TYPE_ALIASES key. Unknown
 * short labels are forwarded unchanged so p5 can omit p5_project_type
 * instead of rejecting the deal. The visitor's own words (a page context
 * followed by what they need, or a long free-text answer) are never sent as
 * the project type: p5 builds the HubSpot deal name from it, and the words
 * already arrive as the summary.
 */

export const P5_INTAKE_URL = "https://p5homeco.com/api/leads/intake";

/** Exact BRANDS entry on the p5 intake, and SITE_CONFIG.name. */
export const P5_CABINET_BRAND = "Boise Cabinet Co";

export const P5_CONSULTATION_FORM = "Cabinet consultation";

/**
 * p5 can take about 25 seconds in confirm mode: it waits for HubSpot so the
 * email carries the links, then for the mail server.
 */
export const P5_INTAKE_TIMEOUT_MS = 30_000;

/** The team_notes limits of the p5 intake contract. */
export const MAX_TEAM_NOTES = 40;
export const MAX_TEAM_NOTE_LENGTH = 300;

/**
 * What p5 said about its own team email. "sent": its mail server accepted it.
 * "failed": it did not, or it was still sending. "none": this post produced
 * no p5 email. "unknown": no usable answer (an older p5, an HTTP error, a
 * timeout, a thrown fetch). Only "sent" is a confirmation.
 */
export type P5TeamAlert = "sent" | "failed" | "none" | "unknown";

export type P5BridgeResult = { forwarded: boolean; alert: P5TeamAlert };

/**
 * Our own numbers never go in team_notes: cost, margin, markup, profit,
 * contingency, overhead. p5's "New lead" email is copied into HubSpot with
 * its full body by p5's inbox sync, and costs and margins stay out of HubSpot
 * (owner rule). The notes builders only read customer-facing fields, so this
 * is the backstop for free text: a line that names one is left out, here and
 * again on p5. What may go: the planning range the customer was shown,
 * customer-facing prices per room, their selections, property lookup facts,
 * the dashboard link.
 */
const INTERNAL_FIGURE = /\b(?:costs?|costing|margins?|mark[- ]?ups?|profits?|contingenc(?:y|ies)|overheads?)\b/i;

export function namesInternalFigure(line: string): boolean {
  return INTERNAL_FIGURE.test(line);
}

/**
 * team_notes as the contract wants them: plain single lines, no control
 * characters, at most MAX_TEAM_NOTE_LENGTH characters and MAX_TEAM_NOTES
 * lines, and never a line that names a cost, margin or other internal figure.
 */
export function cleanTeamNotes(raw: readonly unknown[] | null | undefined): string[] {
  const notes: string[] = [];
  for (const item of raw ?? []) {
    if (typeof item !== "string") continue;
    const line = item.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
    if (!line || namesInternalFigure(line)) continue;
    notes.push(line.length > MAX_TEAM_NOTE_LENGTH ? `${line.slice(0, MAX_TEAM_NOTE_LENGTH - 3).trimEnd()}...` : line);
    if (notes.length >= MAX_TEAM_NOTES) break;
  }
  return notes;
}

/**
 * Visitor project text that does not match a p5 alias or HubSpot option at
 * tip 8a33b28c. hubspotProjectType omits these, so the deal can be created
 * with a blank p5_project_type. Prove should watch for that omission.
 */
export const UNMAPPED_P5_PROJECT_TYPES = [
  "other",
  "Other / Not sure yet",
  "Other / Whole-home",
  "something-else",
  "Something else",
  "Something else, or I am not sure",
  "General inquiry",
  "General inquiry (assistant chat)",
  "Not sure",
  "Not sure yet",
  "cabinet-project",
  "builder-contractor",
] as const;

/**
 * Consultation values (form slugs, on-screen labels, and estimator room
 * labels that still post to /api/consultation) to a string p5 will keep.
 */
export const P5_PROJECT_TYPE_BY_VISITOR_LABEL: Readonly<Record<string, string>> = {
  kitchen: "Kitchen cabinets",
  Kitchen: "Kitchen cabinets",
  "Kitchen Cabinets": "Kitchen cabinets",
  "Kitchen cabinets": "Kitchen cabinets",

  bathroom: "Bathroom vanity",
  Bathroom: "Bathroom vanity",
  "Bathroom Vanities": "Bathroom vanity",
  "Bathroom Vanity": "Bathroom vanity",
  "Bathroom vanity": "Bathroom vanity",

  laundry: "Built-ins or storage",
  Laundry: "Built-ins or storage",
  mudroom: "Built-ins or storage",
  Mudroom: "Built-ins or storage",
  "Laundry / Mudroom": "Built-ins or storage",
  closet: "Built-ins or storage",
  Closet: "Built-ins or storage",
  "Closet & Storage": "Built-ins or storage",
  pantry: "Built-ins or storage",
  Pantry: "Built-ins or storage",
  "home-office": "Built-ins or storage",
  "Home Office": "Built-ins or storage",
  entertainment: "Built-ins or storage",
  Entertainment: "Built-ins or storage",
  "built-ins": "Built-ins or storage",
  "Built-Ins": "Built-ins or storage",
  "Built-ins": "Built-ins or storage",
  storage: "Built-ins or storage",
  Storage: "Built-ins or storage",
  "Custom cabinets or built-ins": "Built-ins or storage",
  "Built-ins or storage": "Built-ins or storage",

  "cabinet-product": "cabinet-product",
  "Cabinets, supply only": "cabinet-product",
  "cabinet-install": "cabinet-install",
  "Cabinet installation": "cabinet-install",
  "Cabinet Installation": "cabinet-install",

  "whole-home": "Whole-home cabinetry",
  "Whole-home": "Whole-home cabinetry",
  "Whole-Home": "Whole-home cabinetry",
  "Whole-home cabinetry": "Whole-home cabinetry",
};

/**
 * The planning range as p5 reads it to create the QuickBooks customer and an
 * UNSENT estimate (owner decision, 13 and 17 November 2026; the contract is
 * p5's docs/lead-intake-contract.md). CUSTOMER amounts only: never a cost,
 * margin, markup, profit, contingency or overhead in any field of it.
 *
 * There is no `verified` here on purpose. p5 takes `verified: true` to mean
 * this site's server recomputed the figures, and it did not: the planning
 * wizard's range comes from the visitor's browser.
 */
export type P5SiteEstimateLine = { title: string; description?: string; amount: number };

export type P5SiteEstimate = {
  kind: "planning-range";
  /** The range the customer was shown. */
  low: number;
  high: number;
  label?: string;
  /** One per room, at the middle of that room's range. With lines, p5 totals their sum. */
  lines?: P5SiteEstimateLine[];
};

/** One attached file as the p5 intake contract carries it: a signed, unguessable link. */
export type P5IntakeFile = { name: string; url: string; contentType: string; size: number };

export type ConsultationBridgeInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  projectType?: string | null;
  message?: string | null;
  inquiryId?: string | null;
  /**
   * The quote form contract shared with p5 intake (the family "two-step" form).
   * p5 ignores keys it does not read yet, so these are safe to send before it
   * merges details; with the same brand and external_id it dedupes today.
   */
  requestKind?: "request" | "callback" | null;
  contactPreference?: "call" | "text" | "email" | null;
  bestTime?: string | null;
  files?: P5IntakeFile[] | null;
  submissionKind?: "initial" | "details";
  /** Step 2 timing ("Soon", "1 to 3 months", ...). */
  timeline?: string | null;
  /**
   * `Label: value` lines p5 prints in its team email under "From the website".
   * They are not stored on the lead, but p5's inbox sync copies that email
   * into HubSpot, so they carry customer-facing figures only: never a cost,
   * margin, markup, profit, contingency or overhead number. Only what this
   * site's own team email carries and the fields above do not.
   */
  teamNotes?: readonly string[] | null;
  /**
   * The planning range, structured, for p5 to put in QuickBooks. Built by
   * consultationSiteEstimate() in teamEmail.ts, which returns nothing when
   * the numbers do not hold up. Sent with a Step 1 request only: never with
   * a callback, never with Step 2.
   */
  estimate?: P5SiteEstimate | null;
};

/** The id p5 keys this request on, stable across Step 1 and Step 2. */
export function p5ExternalId(inquiryId: string | null | undefined): string | null {
  const id = inquiryId?.trim();
  return id ? `boisecabinet-consultation:${id}` : null;
}

/** p5 normalizeEmail, kept local so a bad optional phone cannot 422 a good email. */
function reachableEmail(raw: string | null | undefined): string | null {
  const email = raw?.trim() ?? "";
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/** p5 normalizePhone. Returns the visitor's original text when it would be stored. */
function reachablePhone(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (trimmed.startsWith("+") && !trimmed.startsWith("+1")) {
    return digits.length >= 8 && digits.length <= 15 ? trimmed : null;
  }
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return null;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return trimmed;
}

/**
 * Page contexts the quote form puts in front of the visitor's words
 * ("built-ins: walk-in pantry shelving"). A context maps to the p5 project
 * type it implies, or to none when the page does not name a project.
 */
export const P5_PROJECT_TYPE_BY_CONTEXT: Readonly<Record<string, string | null>> = {
  "built-ins": "Built-ins or storage",
  "builder-contractor": null,
  "cabinet-project": null,
};

/** Longest unmapped label still forwarded; anything longer is the visitor's own words. */
export const MAX_FORWARDED_PROJECT_LABEL = 40;

export function p5ProjectType(visitorType: string | null | undefined): string | null {
  const trimmed = visitorType?.trim() ?? "";
  if (!trimmed) return null;
  const mapped = P5_PROJECT_TYPE_BY_VISITOR_LABEL[trimmed];
  if (mapped) return mapped;
  // "context: what they need". The words already reach p5 as the summary, so
  // they never become the project type (p5 puts it in the HubSpot deal name).
  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    const context = trimmed.slice(0, colon).trim();
    if (Object.prototype.hasOwnProperty.call(P5_PROJECT_TYPE_BY_CONTEXT, context)) {
      const rest = trimmed.slice(colon + 1).trim();
      return P5_PROJECT_TYPE_BY_VISITOR_LABEL[rest] ?? P5_PROJECT_TYPE_BY_CONTEXT[context];
    }
  }
  // A free-text answer sent as the project type: same rule, it stays in the summary.
  if (trimmed.length > MAX_FORWARDED_PROJECT_LABEL || /[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

function composeAddress(address?: string | null, zip?: string | null): string | null {
  const street = address?.trim() ?? "";
  const postal = zip?.trim() ?? "";
  if (!street) return postal || null;
  if (!postal || street.includes(postal)) return street;
  return `${street}, ${postal}`;
}

export function buildP5IntakeBody(input: ConsultationBridgeInput): Record<string, unknown> {
  const visitorType = input.projectType?.trim() ?? "";
  const projectType = p5ProjectType(visitorType);
  const note = input.message?.trim() ?? "";
  const summaryParts: string[] = [];
  if (visitorType && projectType && projectType !== visitorType) {
    summaryParts.push(`Visitor project: ${visitorType}`);
  }
  if (note) summaryParts.push(note);

  const email = reachableEmail(input.email);
  const phone = reachablePhone(input.phone);
  const rawEmail = input.email?.trim() ?? "";
  const rawPhone = input.phone?.trim() ?? "";

  const body: Record<string, unknown> = {
    brand: P5_CABINET_BRAND,
    name: input.name.trim(),
    form: P5_CONSULTATION_FORM,
    source: "Organic Website",
    sourceDetail: "boisecabinet.co consultation",
  };

  if (projectType) body.projectType = projectType;
  if (email) body.email = email;
  else if (!phone && rawEmail) body.email = rawEmail;
  if (phone) body.phone = phone;
  else if (!email && rawPhone) body.phone = rawPhone;

  const address = composeAddress(input.address, input.zip);
  if (address) body.address = address;
  const city = input.city?.trim();
  if (city) body.city = city;
  if (summaryParts.length) body.summary = summaryParts.join("\n\n");

  const externalId = p5ExternalId(input.inquiryId);
  if (externalId) {
    body.externalLeadId = externalId;
    body.external_id = externalId;
    body.submission_kind = input.submissionKind ?? "initial";
  }
  if (input.requestKind) body.request_kind = input.requestKind === "callback" ? "callback" : "quote";
  if (input.contactPreference) body.contact_preference = input.contactPreference;
  const bestTime = input.bestTime?.trim();
  if (bestTime) body.best_time = bestTime;
  const timeline = input.timeline?.trim();
  if (timeline) body.timeline = timeline;
  if (input.files?.length) {
    body.files = input.files.map((file) => ({
      name: file.name,
      url: file.url,
      contentType: file.contentType,
      size: file.size,
    }));
  }
  if (input.estimate && (input.submissionKind ?? "initial") === "initial" && input.requestKind !== "callback") {
    body.estimate = input.estimate;
  }
  // Ask p5 to send its team email before it answers and to say how that went.
  body.team_alert = "confirm";
  const teamNotes = cleanTeamNotes(input.teamNotes);
  if (teamNotes.length) body.team_notes = teamNotes;
  return body;
}

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/**
 * The Step 2 post: same brand and external_id as the request, submission_kind
 * "details", only the fields the visitor gave, and a "Details added" summary
 * (with the file links) for a p5 that appends it to the deal and a HubSpot note.
 */
export function buildP5DetailsBody(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  inquiryId: string;
  requestKind?: "request" | "callback" | null;
  contactPreference?: "call" | "text" | "email" | null;
  projectType?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  timeline?: string | null;
  bestTime?: string | null;
  files?: P5IntakeFile[] | null;
  lines: string[];
  teamNotes?: readonly string[] | null;
}): Record<string, unknown> {
  const body = buildP5IntakeBody({
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    zip: input.zip,
    city: input.city,
    projectType: input.projectType,
    message: ["Details added", ...input.lines].join("\n"),
    inquiryId: input.inquiryId,
    requestKind: input.requestKind,
    contactPreference: input.contactPreference,
    bestTime: input.bestTime,
    files: input.files,
    timeline: input.timeline,
    submissionKind: "details",
    teamNotes: input.teamNotes,
  });
  // Lead with "Details added" so the deal note reads as a follow-up, not a new request.
  body.summary = ["Details added", ...input.lines].join("\n");
  return body;
}

/** Anything that is not exactly one of the three contract values is "unknown". */
export function readP5TeamAlert(payload: unknown): P5TeamAlert {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "unknown";
  const alert = (payload as { alert?: unknown }).alert;
  return alert === "sent" || alert === "failed" || alert === "none" ? alert : "unknown";
}

/**
 * POST the consultation to p5 intake and report what p5 said about its team
 * email. Never throws: every failure is `{ forwarded: false, alert: "unknown" }`.
 * Callers must not await this on the visitor's success path.
 */
export async function forwardConsultationToP5Intake(
  input: ConsultationBridgeInput | { body: Record<string, unknown> },
  fetchImpl: FetchLike = fetch,
  timeoutMs: number = P5_INTAKE_TIMEOUT_MS,
): Promise<P5BridgeResult> {
  try {
    const body = "body" in input ? input.body : buildP5IntakeBody(input);
    const res = await fetchImpl(P5_INTAKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(
        `[p5-intake] Bridge rejected: ${res.status} ${text.slice(0, 300)}`,
      );
      return { forwarded: false, alert: "unknown" };
    }
    let payload: unknown = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
    const alert = readP5TeamAlert(payload);
    console.info(
      `[p5-intake] Consultation ${body.submission_kind === "details" ? "details " : ""}forwarded (${res.status}); p5 team email: ${alert}.`,
    );
    return { forwarded: true, alert };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[p5-intake] Bridge failed: ${message}`);
    return { forwarded: false, alert: "unknown" };
  }
}
