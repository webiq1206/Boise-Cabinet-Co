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
  type P5SiteEstimate,
  type P5SiteEstimateLine,
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

/** p5 ignores an estimate above this unless the site's server verified it, and this site's did not. */
export const SITE_ESTIMATE_UNVERIFIED_CEILING = 500_000;
/** p5 refuses an estimate with more lines than this. */
export const MAX_SITE_ESTIMATE_LINES = 60;
/**
 * The wizard's total is the sum of its rooms rounded to the nearest $100. A
 * room split further from the total than this does not belong to it.
 */
const ROOM_SPLIT_TOLERANCE = (figure: number) => Math.max(100, figure * 0.01);

function amount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** One line of the visitor's own words, capped; nothing when it names a cost or a margin. */
function words(value: unknown, max: number): string {
  const line = text(value);
  if (!line || namesInternalFigure(line)) return "";
  return line.length > max ? `${line.slice(0, max - 3).trimEnd()}...` : line;
}

/**
 * The planning range as a structured `estimate`, so p5 can create the
 * QuickBooks customer and an UNSENT estimate for the lead (owner decision,
 * 13 and 17 November 2026). Customer amounts only: the range the visitor was
 * shown, and for several rooms one line per room at the middle of that room's
 * range, with the range said in its description. This site holds no cost or
 * margin for a planning range, and no field here could carry one.
 *
 * The figures come from the visitor's browser and are not recomputed here, so
 * `verified` is never sent. They are checked instead: every number finite and
 * above zero, every low at or under its high, the rooms adding up to the
 * total, and a total p5 would accept from an unverified form. If anything is
 * off, nothing is returned and the request goes without the field. Never
 * throws. Nothing for a callback or a request without a range.
 */
export function consultationSiteEstimate(input: {
  estimate?: unknown;
  requestKind?: string | null;
}): P5SiteEstimate | null {
  try {
    if (input.requestKind === "callback") return null;
    const est = input.estimate;
    if (!est || typeof est !== "object" || Array.isArray(est)) return null;
    const source = est as Record<string, unknown>;
    const low = amount(source.priceLow);
    const high = amount(source.priceHigh);
    if (low === null || high === null || low > high) return null;

    const rawRooms = source.rooms === undefined || source.rooms === null ? [] : source.rooms;
    if (!Array.isArray(rawRooms) || rawRooms.length > MAX_SITE_ESTIMATE_LINES) return null;
    const rooms: Array<{ title: string; low: number; high: number; size: string; finish: string }> = [];
    for (const [index, raw] of rawRooms.entries()) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
      const room = raw as Record<string, unknown>;
      const roomLow = amount(room.priceLow);
      const roomHigh = amount(room.priceHigh);
      if (roomLow === null || roomHigh === null || roomLow > roomHigh) return null;
      rooms.push({
        title: words(room.project, 200) || `Room ${index + 1}`,
        low: roomLow,
        high: roomHigh,
        size: words(room.sizeLabel, 200),
        finish: words(room.finish, 600),
      });
    }

    const estimate: P5SiteEstimate = { kind: "planning-range", low: cents(low), high: cents(high) };
    let total = (low + high) / 2;

    if (rooms.length > 1) {
      // The rooms must be the split of the range the visitor was shown.
      const sumLow = rooms.reduce((sum, room) => sum + room.low, 0);
      const sumHigh = rooms.reduce((sum, room) => sum + room.high, 0);
      if (Math.abs(sumLow - low) > ROOM_SPLIT_TOLERANCE(low)) return null;
      if (Math.abs(sumHigh - high) > ROOM_SPLIT_TOLERANCE(high)) return null;
      const lines: P5SiteEstimateLine[] = rooms.map((room) => {
        const details = [room.size, room.finish].filter(Boolean).join(", ");
        return {
          title: room.title,
          description: `Planning range ${range(room.low, room.high)}.${details ? ` ${details}` : ""}`,
          amount: cents((room.low + room.high) / 2),
        };
      });
      if (lines.some((line) => !(line.amount > 0))) return null;
      total = cents(lines.reduce((sum, line) => sum + line.amount, 0));
      estimate.lines = lines;
      const label = `Cabinets for ${rooms.length} rooms: ${rooms.map((room) => room.title).join(", ")}`;
      estimate.label = label.length > 200 ? `${label.slice(0, 197).trimEnd()}...` : label;
    } else {
      // One room, or no room split: no lines, and p5 uses the middle of the range.
      const only = rooms[0];
      const parts = only
        ? [only.title, only.size, only.finish]
        : [words(source.project, 200), words(source.sizeLabel, 200), words(source.finish, 600)];
      const label = parts.filter(Boolean).join(", ") || "Cabinet planning range";
      estimate.label = label.length > 200 ? `${label.slice(0, 197).trimEnd()}...` : label;
    }

    // What p5 would refuse or ignore is not sent at all.
    if (!(total > 0) || total > SITE_ESTIMATE_UNVERIFIED_CEILING) return null;
    if (total < low / 2 || total > high * 2) return null;
    return estimate;
  } catch (err) {
    console.error("[p5-intake] Could not build the estimate for p5:", err);
    return null;
  }
}
