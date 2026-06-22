/**
 * Public-email discovery. We ONLY collect an email address that the contractor
 * has themselves published on their own website. We never guess patterns
 * (info@domain), generate, or fabricate addresses. If no email is publicly
 * listed, the prospect is left without one and is not contacted.
 *
 * SSRF safety: all URLs are validated before fetch, and every redirect hop is
 * re-validated. Robots.txt is respected: we skip paths the site disallows for
 * our crawler.
 */

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

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
const MAX_REDIRECTS = 3;

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  if (h.includes(":") || h.startsWith("[")) return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const o = ipv4.slice(1).map(Number);
    if (o.some((n) => n > 255)) return true;
    if (o[0] === 10) return true;
    if (o[0] === 127) return true;
    if (o[0] === 0) return true;
    if (o[0] === 169 && o[1] === 254) return true;
    if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return true;
    if (o[0] === 192 && o[1] === 168) return true;
    if (o[0] === 100 && o[1] >= 64 && o[1] <= 127) return true;
    if (o[0] >= 224) return true;
    return true;
  }
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
  if (/\.(png|jpe?g|gif|webp|svg|css|js)$/i.test(lower)) return false;
  return true;
}

/**
 * Fetch HTML with manual redirect handling so every hop is validated. This
 * closes the redirect-based SSRF bypass where a hostile site redirects to an
 * internal endpoint after the initial URL passes our host guard.
 */
async function fetchHtmlWithRedirects(url: string): Promise<string | null> {
  let currentUrl = url;
  for (let i = 0; i < MAX_REDIRECTS; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(currentUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
        signal: controller.signal,
        redirect: "manual",
      });
      clearTimeout(timer);

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) return null;
        const next = new URL(location, currentUrl);
        if (isBlockedHost(next.hostname)) return null;
        currentUrl = next.toString();
        continue;
      }

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
  return null;
}

function extractEmails(html: string): string[] {
  const found = new Set<string>();
  const mailtoRegex = /mailto:([^"'?\s>]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = mailtoRegex.exec(html)) !== null) {
    const email = decodeURIComponent(m[1]).trim().toLowerCase();
    if (EMAIL_REGEX.test(email) && isPlausibleEmail(email)) found.add(email);
    EMAIL_REGEX.lastIndex = 0;
  }
  const matches = html.match(EMAIL_REGEX) ?? [];
  for (const raw of matches) {
    const email = raw.trim().toLowerCase();
    if (isPlausibleEmail(email)) found.add(email);
  }
  return Array.from(found);
}

function pickBestEmail(emails: string[], domainHost: string | null): string | null {
  if (emails.length === 0) return null;
  // We ONLY contact an address that lives on the contractor's own domain. If a
  // page lists a third-party/vendor address (a marketing agency, a webmaster, a
  // form provider, etc.), we must NOT use it. Without a host we cannot prove the
  // address belongs to the business, so we skip rather than guess.
  const host = domainHost?.replace(/^www\./, "").toLowerCase() ?? "";
  if (!host) return null;
  // Accept the exact registrable host or any subdomain of it (e.g. an address
  // at mail.theirdomain.com), but nothing on an unrelated domain.
  const onDomain = (e: string) => {
    const at = e.lastIndexOf("@");
    if (at < 0) return false;
    const emailHost = e.slice(at + 1).replace(/^www\./, "");
    return emailHost === host || emailHost.endsWith(`.${host}`);
  };
  const pool = emails.filter(onDomain);
  if (pool.length === 0) return null;
  const preferredPrefixes = ["info", "office", "contact", "hello", "sales", "estimating", "estimates"];
  for (const prefix of preferredPrefixes) {
    const hit = pool.find((e) => e.startsWith(`${prefix}@`));
    if (hit) return hit;
  }
  return pool[0];
}

/** Minimal robots.txt parser: check if our user-agent is allowed for a path. */
function isAllowedByRobotsTxt(robotsTxt: string, userAgent: string, path: string): boolean {
  const lines = robotsTxt.split(/\r?\n/);
  let ourBlock = false;
  let genericBlock = false;
  let matched = false;
  for (const raw of lines) {
    const line = raw.trim().toLowerCase();
    if (line.startsWith("user-agent:")) {
      const ua = line.slice("user-agent:".length).trim();
      if (ua === "*") {
        ourBlock = false;
        genericBlock = true;
        matched = true;
      } else if (userAgent.toLowerCase().includes(ua)) {
        ourBlock = true;
        genericBlock = false;
        matched = true;
      } else {
        ourBlock = false;
        genericBlock = false;
        matched = false;
      }
    }
    if (line.startsWith("disallow:")) {
      const dis = line.slice("disallow:".length).trim();
      if (!dis) continue;
      const blocked = dis.endsWith("/")
        ? path.startsWith(dis) || path === dis.slice(0, -1)
        : path.startsWith(dis);
      if (blocked) {
        if (ourBlock) return false;
        if (genericBlock && !matched) return false;
      }
    }
  }
  return true;
}

async function fetchRobotsTxt(base: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${base}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/plain" },
      signal: controller.signal,
      redirect: "manual",
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 100_000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface ScrapeResult {
  email: string | null;
  sourceUrl: string | null;
}

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

  const robotsTxt = await fetchRobotsTxt(base);

  for (const path of CONTACT_PATHS) {
    const url = `${base}${path}`;
    if (robotsTxt && !isAllowedByRobotsTxt(robotsTxt, USER_AGENT, path || "/")) {
      continue;
    }
    const html = await fetchHtmlWithRedirects(url);
    if (!html) continue;
    const emails = extractEmails(html);
    const best = pickBestEmail(emails, host);
    if (best) {
      return { email: best, sourceUrl: url };
    }
  }

  return { email: null, sourceUrl: null };
}
