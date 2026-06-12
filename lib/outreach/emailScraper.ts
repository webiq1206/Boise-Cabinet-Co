/**
 * Public-email discovery. We ONLY collect an email address that the contractor
 * has themselves published on their own website. We never guess patterns
 * (info@domain), generate, or fabricate addresses. If no email is publicly
 * listed, the prospect is left without one and is not contacted.
 */

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Addresses that are almost never a real inbox or are tracking/asset noise.
const BLOCK_SUBSTRINGS = [
  "example.com",
  "sentry.io",
  "wixpress.com",
  "godaddy",
  "squarespace",
  "@2x",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  "your-email",
  "email@",
  "domain.com",
];

const CONTACT_PATHS = ["", "/contact", "/contact-us", "/about", "/about-us"];

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT =
  "BoiseCabinetCo-Outreach/1.0 (+https://boisecabinet.co; contact: hello@boisecabinet.co)";

/**
 * SSRF guard. Contractor website URLs come from a third party (Google Places),
 * so a malicious or misconfigured listing could point at internal infra. Reject
 * any host that is not a public, http(s), DNS hostname: no IP literals, no
 * localhost, no private/link-local/cloud-metadata ranges.
 */
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;

  // IPv6 literal (URL host wraps these in brackets) or any colon: block.
  if (h.includes(":") || h.startsWith("[")) return true;

  // IPv4 literal: block entirely (we only allow real DNS hostnames).
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const o = ipv4.slice(1).map(Number);
    if (o.some((n) => n > 255)) return true;
    if (o[0] === 10) return true; // 10.0.0.0/8
    if (o[0] === 127) return true; // loopback
    if (o[0] === 0) return true; // 0.0.0.0/8
    if (o[0] === 169 && o[1] === 254) return true; // link-local / metadata
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true; // 172.16/12
    if (o[0] === 192 && o[1] === 168) return true; // 192.168/16
    if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return true; // CGNAT
    if (o[0] >= 224) return true; // multicast / reserved
    return true; // any other bare IPv4: block (require a hostname)
  }

  // Require a normal dotted hostname (has a TLD label).
  if (!h.includes(".")) return true;
  return false;
}

function normalizeBase(website: string): string | null {
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function isPlausibleEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (lower.length > 100) return false;
  if (BLOCK_SUBSTRINGS.some((b) => lower.includes(b))) return false;
  // Reject obvious image/file artifacts that slipped past (e.g. a@b.png caught
  // above, but also things like ...@...-150x150).
  if (/\.(png|jpe?g|gif|webp|svg|css|js)$/i.test(lower)) return false;
  return true;
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("text/")) return null;
    const text = await res.text();
    return text.slice(0, 500_000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractEmails(html: string): string[] {
  const found = new Set<string>();

  // Prefer explicit mailto: links (strongest signal it is a real contact).
  const mailtoRegex = /mailto:([^"'?\s>]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = mailtoRegex.exec(html)) !== null) {
    const email = decodeURIComponent(m[1]).trim().toLowerCase();
    if (EMAIL_REGEX.test(email) && isPlausibleEmail(email)) found.add(email);
    EMAIL_REGEX.lastIndex = 0;
  }

  // Fall back to plain-text email mentions in the page body.
  const matches = html.match(EMAIL_REGEX) ?? [];
  for (const raw of matches) {
    const email = raw.trim().toLowerCase();
    if (isPlausibleEmail(email)) found.add(email);
  }

  return Array.from(found);
}

/** Rank candidates so a human/role inbox is preferred over generic noise. */
function pickBestEmail(emails: string[], domainHost: string | null): string | null {
  if (emails.length === 0) return null;
  const host = domainHost?.replace(/^www\./, "").toLowerCase() ?? "";

  const sameDomain = emails.filter((e) => (host ? e.endsWith(`@${host}`) || e.includes(host) : true));
  const pool = sameDomain.length > 0 ? sameDomain : emails;

  const preferredPrefixes = ["info", "office", "contact", "hello", "sales", "estimating", "estimates"];
  for (const prefix of preferredPrefixes) {
    const hit = pool.find((e) => e.startsWith(`${prefix}@`));
    if (hit) return hit;
  }
  return pool[0];
}

export interface ScrapeResult {
  email: string | null;
  sourceUrl: string | null;
}

/**
 * Visit a contractor's homepage and a few likely contact pages, returning the
 * single best publicly-listed email (or null when none is published).
 */
export async function scrapePublicEmail(website: string): Promise<ScrapeResult> {
  const base = normalizeBase(website);
  if (!base) return { email: null, sourceUrl: null };
  const host = (() => {
    try {
      return new URL(base).host;
    } catch {
      return null;
    }
  })();

  for (const path of CONTACT_PATHS) {
    const url = `${base}${path}`;
    const html = await fetchHtml(url);
    if (!html) continue;
    const emails = extractEmails(html);
    const best = pickBestEmail(emails, host);
    if (best) {
      return { email: best, sourceUrl: url };
    }
  }

  return { email: null, sourceUrl: null };
}
