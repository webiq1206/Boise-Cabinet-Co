import { db } from "@/lib/db";
import { siteSettings } from "@/shared/schema";
import { inArray } from "drizzle-orm";
import { SITE_CONFIG } from "@/shared/siteConfig";

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
} as const;

export interface OutreachRuntimeConfig {
  enabled: boolean;
  dryRun: boolean;
  dailyCap: number;
  minGapMinutes: number;
}

const DEFAULTS: OutreachRuntimeConfig = {
  enabled: false,
  dryRun: true,
  dailyCap: 12,
  minGapMinutes: 25,
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
  if (!outreachDomain) return null;

  // ...and refuse to send from the bare primary domain. Cold outreach MUST go
  // out on a separate, isolated subdomain (e.g. jordan@outreach.boisecabinet.co)
  // so its reputation never affects transactional mail on the root domain.
  if (primaryDomain && outreachDomain === primaryDomain) return null;

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
 * city/region NAP if the dedicated env is unset (set OUTREACH_MAILING_ADDRESS
 * before enabling real sends).
 */
export function getOutreachPostalAddress(): string {
  const explicit = process.env.OUTREACH_MAILING_ADDRESS?.trim();
  if (explicit) return explicit;
  return `${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.state}, ${SITE_CONFIG.address.country}`;
}

/** True when real sends are fully configured (verified sender present). */
export function isOutreachSendable(): boolean {
  return getOutreachFromEmail() !== null;
}
