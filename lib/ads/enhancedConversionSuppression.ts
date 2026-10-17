import { createHash } from "node:crypto";
import {
  normalizedEnhancedConversionEmail,
  normalizedEnhancedConversionPhone,
} from "./enhancedConversionContact";

type Query = (statement: string, values?: unknown[]) => Promise<Record<string, unknown>[]>;

export const ENHANCED_CONVERSION_SUPPRESSION_DDL = `CREATE TABLE IF NOT EXISTS ads_enhanced_conversion_suppression (
  kind text NOT NULL CHECK (kind IN ('email', 'phone')),
  hash text NOT NULL CHECK (hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, hash)
)`;

export function enhancedConversionHash(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

let tableReady: Promise<void> | undefined;

async function siteQuery(): Promise<Query> {
  const { query } = await import("@/lib/p5/database");
  return query;
}

async function ensureTable(run: Query) {
  if (!tableReady) {
    tableReady = run(ENHANCED_CONVERSION_SUPPRESSION_DDL)
      .then(() => undefined)
      .catch((error) => {
        tableReady = undefined;
        throw error;
      });
  }
  await tableReady;
}

export type SuppressionContact = { email?: string | null; phone?: string | null };

export type StoredSuppression = { email: boolean; phone: boolean };

/** Hash normalized email and E.164 phone, then store only those hashes. */
export async function addEnhancedConversionSuppression(
  contact: SuppressionContact,
  run?: Query,
): Promise<StoredSuppression> {
  const email = normalizedEnhancedConversionEmail(contact.email);
  const phone = normalizedEnhancedConversionPhone(contact.phone);
  const query = run ?? (await siteQuery());
  await ensureTable(query);
  if (email) {
    await query(
      "INSERT INTO ads_enhanced_conversion_suppression (kind, hash) VALUES ('email', $1) ON CONFLICT DO NOTHING",
      [enhancedConversionHash(email)],
    );
  }
  if (phone) {
    await query(
      "INSERT INTO ads_enhanced_conversion_suppression (kind, hash) VALUES ('phone', $1) ON CONFLICT DO NOTHING",
      [enhancedConversionHash(phone)],
    );
  }
  return { email: Boolean(email), phone: Boolean(phone) };
}

/**
 * True when neither the normalized email nor the E.164 phone is on the
 * suppression list. A check that cannot run allows the conversion user_data
 * path to stay unchanged rather than failing the lead.
 */
export async function allowEnhancedConversions(
  contact: SuppressionContact,
  run?: Query,
): Promise<boolean> {
  const email = normalizedEnhancedConversionEmail(contact.email);
  const phone = normalizedEnhancedConversionPhone(contact.phone);
  if (!email && !phone) return true;
  try {
    const query = run ?? (await siteQuery());
    await ensureTable(query);
    const clauses: string[] = [];
    const values: string[] = [];
    if (email) {
      values.push(enhancedConversionHash(email));
      clauses.push(`(kind = 'email' AND hash = $${values.length})`);
    }
    if (phone) {
      values.push(enhancedConversionHash(phone));
      clauses.push(`(kind = 'phone' AND hash = $${values.length})`);
    }
    const rows = await query(
      `SELECT kind FROM ads_enhanced_conversion_suppression WHERE ${clauses.join(" OR ")} LIMIT 1`,
      values,
    );
    return rows.length === 0;
  } catch (error) {
    console.error("[ads] enhanced conversion suppression check failed:", error);
    return true;
  }
}

export async function withEnhancedConversionAllowance<T extends Record<string, unknown>>(
  body: T,
  contact: SuppressionContact,
  run?: Query,
): Promise<T & { allowEnhancedConversions: boolean }> {
  return { ...body, allowEnhancedConversions: await allowEnhancedConversions(contact, run) };
}
