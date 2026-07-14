/**
 * Contact discovery. For outreach opportunities, finds the best recipient email
 * by reading the target's own public contact/about pages (mailto: links + text
 * emails), preferring same-domain, role-based addresses. Falls back to an
 * info@ pattern guess. Modest and polite: a few pages per domain, short
 * timeouts, an identifying User-Agent. Not for auto directory items (those need
 * a claim URL, not an email).
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK = [
  "example.com", "sentry.", "wixpress.com", "googleapis", "schema.org", "w3.org",
  "cloudflare", "@2x", ".png", ".jpg", ".gif", ".webp", "godaddy", "domain.com",
  "email.com", "yourdomain", "sentry.io", "core.js",
];

/** Placeholder / template / no-reply addresses that are never real recipients. */
const PLACEHOLDER =
  /^(test|name|email|you|your|user|username|firstname|lastname|first\.last|john|jane|example|sample|noreply|no-reply|donotreply|do-not-reply|abuse|postmaster|webmaster|privacy|unsubscribe)@|@(test|example|sample|domain|email|yourdomain|test)\./;

const ROLE_PREF = ["info", "contact", "hello", "sales", "office", "admin", "marketing"];
const NEWS_PREF = ["editor", "news", "tips", "press", "newsroom", "story", "assignment"];

export interface ContactResult {
  email?: string;
  contactUrl?: string;
  confidence: "found" | "guessed" | "none";
  source: "scrape" | "pattern";
}

async function fetchText(url: string, ms = 7000): Promise<string | null> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BoiseCabinetCo-OutreachResearch/1.0 (+https://boisecabinet.co)",
        Accept: "text/html",
      },
    });
    if (!r.ok) return null;
    return (await r.text()).slice(0, 400_000);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function discoverContact(
  domain: string,
  opts: { news?: boolean } = {},
): Promise<ContactResult> {
  const paths = ["", "/contact", "/contact-us", "/about", "/about-us"];
  const found = new Set<string>();
  let contactUrl: string | undefined;

  for (const p of paths) {
    const html = await fetchText(`https://${domain}${p}`);
    if (!html) continue;
    if (p.includes("contact") && !contactUrl) contactUrl = `https://${domain}${p}`;
    for (const raw of html.match(EMAIL_RE) ?? []) {
      const e = raw.toLowerCase();
      if (JUNK.some((j) => e.includes(j))) continue;
      if (PLACEHOLDER.test(e)) continue;
      found.add(e);
    }
    if (found.size > 0) break; // stop at the first page that yields addresses
  }

  if (found.size === 0) {
    return { email: `info@${domain}`, contactUrl, confidence: "guessed", source: "pattern" };
  }

  const pref = opts.news ? [...NEWS_PREF, ...ROLE_PREF] : ROLE_PREF;
  const list = [...found];
  const sameDomain = list.filter((e) => (e.split("@")[1] ?? "").endsWith(domain));
  const pool = sameDomain.length ? sameDomain : list;

  const score = (e: string): number => {
    const local = e.split("@")[0] ?? "";
    let s = 0;
    pref.forEach((r, i) => {
      if (local.includes(r)) s = Math.max(s, pref.length - i);
    });
    return s;
  };
  pool.sort((a, b) => score(b) - score(a));

  return { email: pool[0], contactUrl, confidence: "found", source: "scrape" };
}
