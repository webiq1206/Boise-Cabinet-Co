/**
 * One team email per request (owner decision, 17 November 2026).
 *
 * Every consultation request is forwarded to p5homeco.com, which sends the
 * team its "New lead" (or "Details added") email in the layout the owner
 * approved. This site's own team email used to go out as well, so the shared
 * inbox got two emails for one request. It is now the FALLBACK:
 *
 * - p5 confirmed its email went (`alert === "sent"`): the shared family inbox
 *   gets nothing more from this site. Any other admin recipient still gets
 *   this site's email, as before.
 * - anything else (`failed`, `none`, `unknown`, an HTTP error, a thrown fetch,
 *   a timeout, no bridge at all): this site's email goes to every recipient,
 *   exactly as before.
 *
 * A lead must never end with zero team emails, so every doubt sends.
 *
 * The decision runs inside after(): the visitor's response and the customer's
 * confirmation never wait on p5.
 */
import { leadDashboardHref, type EstimateForEmail } from "./emailLayout";
import {
  MAX_TEAM_NOTES,
  P5_INTAKE_TIMEOUT_MS,
  namesInternalFigure,
  type P5BridgeResult,
  type P5TeamAlert,
} from "./p5IntakeBridge";

/** `hello@` at any of these is one mailbox: the inbox p5 sends its team email to. */
export const SHARED_FAMILY_INBOX_DOMAINS = [
  "p5homeco.com",
  "boisecabinet.co",
  "boiseconstruction.co",
  "boiseremodeling.co",
  "boisehandyman.co",
  "boiseadu.co",
] as const;

/** True for the shared family inbox, bare or as `Name <address>`, in any letter case. */
export function isSharedFamilyInbox(recipient: string | null | undefined): boolean {
  const raw = (recipient ?? "").trim();
  const named = /<([^<>]+)>\s*$/.exec(raw);
  const address = (named ? named[1] : raw).trim().toLowerCase();
  const at = address.lastIndexOf("@");
  if (at <= 0) return false;
  const domain = address.slice(at + 1);
  return address.slice(0, at) === "hello" && (SHARED_FAMILY_INBOX_DOMAINS as readonly string[]).includes(domain);
}

/** Who gets this site's team email, given what p5 said about its own. */
export function teamEmailRecipients(recipients: readonly string[], alert: P5TeamAlert): string[] {
  return alert === "sent" ? recipients.filter((to) => !isSharedFamilyInbox(to)) : [...recipients];
}

/**
 * Longest wait for the bridge before the site's own email goes anyway. The
 * bridge gives up by itself at P5_INTAKE_TIMEOUT_MS; this is the backstop for
 * a bridge promise that somehow never settles.
 */
export const TEAM_EMAIL_MAX_WAIT_MS = P5_INTAKE_TIMEOUT_MS + 10_000;

export type TeamEmailOutcome = {
  alert: P5TeamAlert;
  /** Recipients this site emailed. */
  sent: string[];
  /** Shared-inbox recipients left to p5's email. */
  skipped: string[];
  /** Recipients whose send threw. */
  failed: string[];
};

async function bridgeAlert(
  bridge: PromiseLike<P5BridgeResult> | P5BridgeResult | null | undefined,
  maxWaitMs: number,
): Promise<P5TeamAlert> {
  if (!bridge) return "unknown";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      Promise.resolve(bridge),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), maxWaitMs);
      }),
    ]);
    const alert = result?.alert;
    return alert === "sent" || alert === "failed" || alert === "none" ? alert : "unknown";
  } catch {
    return "unknown";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Wait for the bridge, then send this site's team email to whoever still
 * needs it. Never throws. One recipient failing does not stop the next.
 * Call it inside after().
 */
export async function sendTeamEmailAfterBridge(options: {
  /** The pending bridge call, or null when nothing was forwarded. */
  bridge: PromiseLike<P5BridgeResult> | P5BridgeResult | null | undefined;
  recipients: () => Promise<string[]> | string[];
  send: (to: string) => Promise<unknown>;
  /** Log prefix, e.g. "consultation". */
  label: string;
  maxWaitMs?: number;
}): Promise<TeamEmailOutcome> {
  const alert = await bridgeAlert(options.bridge, options.maxWaitMs ?? TEAM_EMAIL_MAX_WAIT_MS);
  const outcome: TeamEmailOutcome = { alert, sent: [], skipped: [], failed: [] };
  let everyone: string[];
  try {
    everyone = await options.recipients();
  } catch (err) {
    console.error(`[${options.label}] Team email recipients unavailable:`, err);
    return outcome;
  }
  const to = teamEmailRecipients(everyone, alert);
  outcome.skipped = everyone.filter((address) => !to.includes(address));
  for (const address of to) {
    try {
      await options.send(address);
      outcome.sent.push(address);
    } catch (err) {
      outcome.failed.push(address);
      console.error(`[${options.label}] Team email send failed:`, err);
    }
  }
  console.info(
    `[${options.label}] Team email: p5 said "${alert}"; site email sent to ${outcome.sent.length}, left to p5 for ${outcome.skipped.length}, failed for ${outcome.failed.length}.`,
  );
  return outcome;
}

function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function range(low: number, high: number): string {
  return `${dollars(low)} to ${dollars(high)}`;
}

/** The property lookup result as the form posts it: parcelId, squareFootage, lotSizeSqFt, permittingAuthority. */
type PropertyFacts = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function positive(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * What this site's "New consultation request" email carries that the bridge
 * fields do not, as `Label: value` lines for p5's team email: the planning
 * wizard's range with its per-room amounts (team only; the customer sees one
 * total), the property lookup facts, the visitor's budget and timeline, and
 * the link to the lead dashboard. Never name, phone, email, address, project
 * type or message: the bridge already sends those.
 *
 * Customer-facing figures only. p5's email is copied into HubSpot, so a cost,
 * margin, markup, profit, contingency or overhead number never goes in: this
 * function reads none (only the fields named below), and a line whose free
 * text names one is left out.
 */
export function consultationTeamNotes(input: {
  estimate?: EstimateForEmail | null;
  propertyProfile?: PropertyFacts | null;
  budget?: string | null;
  timeline?: string | null;
  /** "assistant" when the estimating assistant chat sent the request. */
  source?: string | null;
  leadId?: string | null;
}): string[] {
  const head: string[] = [];
  const rooms: string[] = [];
  const tail: string[] = [];

  const est = input.estimate;
  if (est) {
    head.push(`Planning range: ${range(est.priceLow, est.priceHigh)}`);
    if (est.rooms?.length) {
      est.rooms.forEach((room, index) => {
        // The amount leads so a long selections line can never push it past the limit.
        const parts = [text(room.project), range(room.priceLow, room.priceHigh), text(room.sizeLabel), text(room.finish)];
        rooms.push(`Room ${index + 1}: ${parts.filter(Boolean).join("; ")}`);
      });
    } else {
      if (text(est.project)) head.push(`Planning project: ${text(est.project)}`);
      if (text(est.sizeLabel)) head.push(`Planning size: ${text(est.sizeLabel)}`);
      if (text(est.finish)) head.push(`Planning selections: ${text(est.finish)}`);
      if (positive(est.roi)) head.push(`Est. resale ROI: ${Math.round(est.roi as number)}%`);
    }
    if (text(est.confidenceLabel)) head.push(`Planning confidence: ${text(est.confidenceLabel)}`);
  }
  if (text(input.budget)) head.push(`Budget: ${text(input.budget)}`);
  if (text(input.timeline)) head.push(`Timeline: ${text(input.timeline)}`);

  const profile = input.propertyProfile;
  if (profile) {
    if (text(profile.parcelId)) tail.push(`Parcel: ${text(profile.parcelId)}`);
    const home = positive(profile.squareFootage);
    if (home) tail.push(`Home size: about ${home.toLocaleString("en-US")} sq ft`);
    const lot = positive(profile.lotSizeSqFt);
    if (lot) tail.push(`Lot: ${lot.toLocaleString("en-US")} sq ft`);
    if (text(profile.permittingAuthority)) tail.push(`Permits: ${text(profile.permittingAuthority)}`);
  }
  if (input.source === "assistant") tail.push("Came in through: the estimating assistant chat");
  tail.push(`Lead dashboard: ${leadDashboardHref(input.leadId)}`);

  // The dashboard link and the property facts always fit; a very long room
  // list is cut and says so.
  const roomBudget = Math.max(0, MAX_TEAM_NOTES - head.length - tail.length);
  const shownRooms =
    rooms.length > roomBudget
      ? [
          ...rooms.slice(0, Math.max(0, roomBudget - 1)),
          `More rooms: ${rooms.length - Math.max(0, roomBudget - 1)} more in the lead dashboard`,
        ].slice(0, roomBudget)
      : rooms;
  return [...head, ...shownRooms, ...tail].filter((line) => !namesInternalFigure(line));
}

/**
 * Step 2 ("Details added"): the added answers and files already travel in the
 * bridge body, so the only thing left for the team is the lead dashboard link.
 */
export function detailsTeamNotes(input: { leadId?: string | null }): string[] {
  return [`Lead dashboard: ${leadDashboardHref(input.leadId)}`];
}
