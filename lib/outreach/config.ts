import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { inArray } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { resolveTemplateKey } from "@/lib/outreach/template";

/**
 * Outreach configuration. Safety-first defaults: the system is OFF and in
 * dry-run mode until an admin explicitly enables it, and sends are tightly
 * throttled so we never blast. Admin-editable values live in `site_settings`;
 * the sending identity and postal address come from env (set once verified).
 */

export const OUTREACH_SETTING_KEYS = {
  enabled: "outreach_enabled",
  dryRun: "outreach_dry_run",
  dailyCap: "outreach_daily_cap",
  minGapMinutes: "outreach_min_gap_minutes",
  batchSize: "outreach_batch_size",
  defaultTemplate: "outreach_default_template",
} as const;

// Hard ceiling on how many emails a single manual run may attempt. Mirrors the
// clamp inside processOutreachBatch so the UI, config, and sender all agree.
export const OUTREACH_MAX_BATCH_SIZE = 10;

export interface OutreachRuntimeConfig {
  enabled: boolean;
  dryRun: boolean;
  dailyCap: number;
  minGapMinutes: number;
  batchSize: number;
  defaultTemplate: string;
}

const DEFAULTS: OutreachRuntimeConfig = {
  enabled: false,
  dryRun: true,
  dailyCap: 12,
  minGapMinutes: 25,
  batchSize: 1,
  // Kept as a literal (not imported) so config module init never depends on the
  // template module, which imports back from here. Validated at runtime below.
  defaultTemplate: "personal",
};

function clampInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function getOutreachConfig(): Promise<OutreachRuntimeConfig> {
  if (!db) return { ...DEFAULTS };
  try {
    const keys = Object.values(OUTREACH_SETTING_KEYS);
    const rows = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, keys));
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return {
      enabled: map[OUTREACH_SETTING_KEYS.enabled] === "true",
      // Dry-run defaults ON: only an explicit "false" turns real sending on.
      dryRun: map[OUTREACH_SETTING_KEYS.dryRun] !== "false",
      dailyCap: clampInt(map[OUTREACH_SETTING_KEYS.dailyCap], DEFAULTS.dailyCap, 1, 50),
      minGapMinutes: clampInt(
        map[OUTREACH_SETTING_KEYS.minGapMinutes],
        DEFAULTS.minGapMinutes,
        5,
        240,
      ),
      batchSize: clampInt(
        map[OUTREACH_SETTING_KEYS.batchSize],
        DEFAULTS.batchSize,
        1,
        OUTREACH_MAX_BATCH_SIZE,
      ),
      // Unknown/legacy keys fall back to the default template so nothing breaks.
      defaultTemplate: resolveTemplateKey(map[OUTREACH_SETTING_KEYS.defaultTemplate]),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Sending identity. MUST be an address on a separate, Resend-verified
 * subdomain (e.g. jordan@outreach.boisecabinet.co), never hello@boisecabinet.co,
 * so transactional deliverability for the main domain is never put at risk by
 * cold outreach.
 */
export function getOutreachFromEmail(): string | null {
  const email = process.env.OUTREACH_FROM_EMAIL?.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  // Refuse to send outreach from the primary transactional address...
  if (email === SITE_CONFIG.email.toLowerCase()) return null;

  const outreachDomain = email.split("@")[1] ?? "";
  const primaryDomain = (SITE_CONFIG.email.split("@")[1] ?? "").toLowerCase();
  if (!outreachDomain || !primaryDomain) return null;

  // Cold outreach MUST go out on a dedicated subdomain OF the business domain
  // (e.g. jordan@outreach.boisecabinet.co) so its sending reputation is isolated
  // from, and can never harm, transactional mail on the root domain. We reject:
  //   - the bare root domain itself (no isolation), and
  //   - any unrelated external domain (gmail.com, a random vendor, etc.), which
  //     would not be the business's domain at all and breaks the policy.
  if (outreachDomain === primaryDomain) return null;
  if (!outreachDomain.endsWith(`.${primaryDomain}`)) return null;

  return process.env.OUTREACH_FROM_EMAIL?.trim() ?? null;
}

export function getOutreachSenderName(): string {
  return process.env.OUTREACH_SENDER_NAME?.trim() || SITE_CONFIG.name;
}

export function getOutreachReplyTo(): string {
  return process.env.OUTREACH_REPLY_TO?.trim() || SITE_CONFIG.email;
}

/**
 * Valid physical postal address for the CAN-SPAM footer. A real street or PO
 * box address is legally required on commercial email. Falls back to the
 * city/region NAP ONLY for previews; real sends are hard-gated on a valid
 * OUTREACH_MAILING_ADDRESS (see isOutreachMailingAddressValid / isOutreachSendable).
 */
export function getOutreachPostalAddress(): string {
  const explicit = process.env.OUTREACH_MAILING_ADDRESS?.trim();
  if (explicit) return explicit;
  return `${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state}, ${SITE_CONFIG.address.country}`;
}

/**
 * CAN-SPAM requires a real physical postal address (street or registered PO
 * box) on every commercial email. The city/state NAP fallback is NOT a valid
 * postal address, so we require an explicit OUTREACH_MAILING_ADDRESS that looks
 * like a real address before any real send is permitted: it must contain a
 * street/box number, a comma separating address lines, and have real length.
 */
export function isOutreachMailingAddressValid(): boolean {
  const explicit = process.env.OUTREACH_MAILING_ADDRESS?.trim();
  if (!explicit) return false;
  if (explicit.length < 10) return false;
  if (!/\d/.test(explicit)) return false;
  if (!explicit.includes(",")) return false;
  return true;
}

/**
 * True when real sends are fully configured: a verified outreach sender on an
 * isolated subdomain AND a valid physical mailing address for the legally
 * required CAN-SPAM footer.
 */
export function isOutreachSendable(): boolean {
  return getOutreachFromEmail() !== null && isOutreachMailingAddressValid();
}
