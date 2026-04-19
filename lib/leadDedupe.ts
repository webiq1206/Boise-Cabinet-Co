import crypto from "crypto";

export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

export function normalizeAddress(address: string | null | undefined): string {
  if (!address) return "";
  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DUPLICATE_WINDOW_DAYS = 7;
const DUPLICATE_BLOCKING_STATUSES = new Set(["pending_admin", "accepted", "available"]);
const DUPLICATE_PURCHASED_STATUS = "purchased";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is required for edit-token signing");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signEditToken(payload: { quoteId: string; leadId: string }): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const body = `${payload.quoteId}|${payload.leadId}|${exp}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest();
  return `${b64url(Buffer.from(body))}.${b64url(sig)}`;
}

export function verifyEditToken(
  token: string
): { quoteId: string; leadId: string } | null {
  try {
    const [bodyPart, sigPart] = token.split(".");
    if (!bodyPart || !sigPart) return null;
    const body = fromB64url(bodyPart).toString("utf-8");
    const expected = crypto.createHmac("sha256", getSecret()).update(body).digest();
    const provided = fromB64url(sigPart);
    if (expected.length !== provided.length) return null;
    if (!crypto.timingSafeEqual(expected, provided)) return null;
    const [quoteId, leadId, expStr] = body.split("|");
    if (!quoteId || !leadId || !expStr) return null;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    return { quoteId, leadId };
  } catch {
    return null;
  }
}

export interface DedupeCandidate {
  id: string;
  quoteId?: string | null;
  email: string;
  address: string | null;
  status: string;
  createdAt: Date | string;
  purchasedBy?: string | null;
}

export interface DuplicateMatch {
  type: "open" | "in_progress";
  lead: DedupeCandidate;
}

export function findActiveDuplicate(
  candidates: DedupeCandidate[],
  email: string,
  address: string | null | undefined
): DuplicateMatch | null {
  const normEmail = normalizeEmail(email);
  const normAddress = normalizeAddress(address);
  // Blocking requires BOTH email AND address to match (when both are present).
  // If only one is provided, fall back to that single field as a last resort.
  if (!normEmail || !normAddress) return null;

  const cutoff = Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let openMatch: DedupeCandidate | null = null;
  let purchasedMatch: DedupeCandidate | null = null;

  for (const c of candidates) {
    const cEmail = normalizeEmail(c.email);
    const cAddr = normalizeAddress(c.address);
    const emailMatch = cEmail === normEmail;
    const addrMatch = !!cAddr && cAddr === normAddress;
    // Strict: BOTH must match for a duplicate-block.
    if (!(emailMatch && addrMatch)) continue;

    const created = new Date(c.createdAt).getTime();
    if (!Number.isFinite(created) || created < cutoff) continue;

    if (DUPLICATE_BLOCKING_STATUSES.has(c.status)) {
      if (!openMatch || new Date(openMatch.createdAt).getTime() < created) {
        openMatch = c;
      }
    } else if (c.status === DUPLICATE_PURCHASED_STATUS) {
      if (!purchasedMatch || new Date(purchasedMatch.createdAt).getTime() < created) {
        purchasedMatch = c;
      }
    }
  }

  if (openMatch) return { type: "open", lead: openMatch };
  if (purchasedMatch) return { type: "in_progress", lead: purchasedMatch };
  return null;
}

export interface OverlapEntry {
  id: string;
  status: string;
  createdAt: string;
  matchedOn: ("email" | "address")[];
}

export type LeadWithOverlaps<T extends { id: string }> = T & {
  possibleDuplicates: OverlapEntry[];
};

export function attachOverlaps<T extends DedupeCandidate>(
  rows: T[],
  candidates: DedupeCandidate[]
): LeadWithOverlaps<T>[] {
  const overlapMap = computeOverlaps(rows, candidates);
  return rows.map((r) => ({
    ...r,
    possibleDuplicates: overlapMap.get(r.id) ?? [],
  }));
}

interface LeadLike {
  id: string;
  quoteId?: string | null;
  email: string;
  address?: string | null;
  status: string;
  createdAt?: Date | string | null;
  purchasedBy?: string | null;
}

function toCandidate(l: LeadLike): DedupeCandidate {
  return {
    id: l.id,
    quoteId: l.quoteId ?? null,
    email: l.email,
    address: l.address ?? null,
    status: l.status,
    createdAt: l.createdAt ?? new Date(),
    purchasedBy: l.purchasedBy ?? null,
  };
}

export async function attachOverlapsToLeads<T extends LeadLike>(
  rows: T[]
): Promise<(T & { possibleDuplicates: OverlapEntry[] })[]> {
  if (rows.length === 0) return [];
  const { db } = await import("@/lib/db");
  const { leads } = await import("@/shared/schema");
  if (!db) {
    return rows.map((r) => ({ ...r, possibleDuplicates: [] }));
  }
  const candidateRows = await db.select().from(leads);
  const candidates = candidateRows.map(toCandidate);
  const targets = rows.map(toCandidate);
  const overlapMap = computeOverlaps(targets, candidates);
  return rows.map((r) => ({
    ...r,
    possibleDuplicates: overlapMap.get(r.id) ?? [],
  }));
}

export function computeOverlaps(
  targetLeads: DedupeCandidate[],
  allCandidates: DedupeCandidate[]
): Map<string, OverlapEntry[]> {
  const result = new Map<string, OverlapEntry[]>();
  for (const target of targetLeads) {
    const tEmail = normalizeEmail(target.email);
    const tAddr = normalizeAddress(target.address);
    const overlaps: OverlapEntry[] = [];
    for (const c of allCandidates) {
      if (c.id === target.id) continue;
      const cEmail = normalizeEmail(c.email);
      const cAddr = normalizeAddress(c.address);
      const emailMatch = !!tEmail && cEmail === tEmail;
      const addrMatch = !!tAddr && !!cAddr && cAddr === tAddr;
      if (!emailMatch && !addrMatch) continue;
      const matched: ("email" | "address")[] = [];
      if (emailMatch) matched.push("email");
      if (addrMatch) matched.push("address");
      overlaps.push({
        id: c.id,
        status: c.status,
        createdAt: new Date(c.createdAt).toISOString(),
        matchedOn: matched,
      });
    }
    if (overlaps.length > 0) {
      overlaps.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      result.set(target.id, overlaps);
    }
  }
  return result;
}
