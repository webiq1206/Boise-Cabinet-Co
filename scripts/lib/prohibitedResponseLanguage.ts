/**
 * Owner instruction (November 2026): "Please also make sure that we mention
 * that we answer (do not say within one business day on any site)".
 *
 * General inquiry copy says we answer questions. It never names a response
 * window: no business-day deadline, no minutes, no 24-hour reply, no "fast
 * replies". These patterns run on whitespace-normalized text with JSX tags
 * and {" "} spacers removed, so a phrase split across lines or elements is
 * still caught.
 *
 * Not response promises, and deliberately not matched: rolling 24h send caps,
 * cron age buckets, clock formats, contract day counts ("8 business days"),
 * payment timing and work durations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const PROHIBITED_RESPONSE_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "one/next business day", pattern: /\b(?:one|1|next)[\s-]+business[\s-]+days?\b/i },
  { label: "within a day", pattern: /\bwithin\s+(?:a|one|1)\s+(?:business\s+)?day\b/i },
  { label: "within 24 hours", pattern: /\bwithin\s+24\s*(?:hours?|hrs?|h)\b/i },
  { label: "24-hour reply", pattern: /\b24[\s-]*hours?\s+(?:reply|replies|response|responses|callback|turnaround)\b/i },
  {
    label: "reply/answer in minutes",
    pattern: /\b(?:reply|replies|respond|responds|response|answer|answers|call\s+back|calls\s+back)\b[^.]{0,30}?\bin\s+(?:a\s+)?(?:few\s+)?minutes?\b/i,
  },
  { label: "same-day reply", pattern: /\bsame[\s-]+day\s+(?:reply|replies|response|callback|call\s*back)\b/i },
  { label: "fast/quick reply", pattern: /\b(?:fast|faster|quick|quicker|prompt|rapid|instant)\s+(?:reply|replies|response|responses|callback|callbacks)\b/i },
];

/** Strip markup and JSX spacers, then collapse whitespace. */
export function normalizeForResponseScan(source: string): string {
  return source
    .replace(/\{\s*["'`]\s+["'`]\s*\}/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ");
}

export function findProhibitedResponseLanguage(source: string): { label: string; excerpt: string }[] {
  const text = normalizeForResponseScan(source);
  const hits: { label: string; excerpt: string }[] = [];
  for (const { label, pattern } of PROHIBITED_RESPONSE_PATTERNS) {
    const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    for (const match of text.matchAll(global)) {
      const start = match.index ?? 0;
      hits.push({ label, excerpt: text.slice(Math.max(0, start - 60), start + match[0].length + 40).trim() });
    }
  }
  return hits;
}

/** Customer-facing source roots: pages, components, shared copy, assistant, email templates, public text. */
export const RESPONSE_SCAN_ROOTS = ["app", "components", "shared", "lib", "server", "hooks", "public"];
const EXTENSIONS = /\.(?:ts|tsx|js|jsx|mjs|cjs|html|txt|md|json|xml)$/;

function walk(dir: string, out: string[]): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (EXTENSIONS.test(entry)) out.push(full);
  }
  return out;
}

export function scanSourceForResponsePromises(root: string): { file: string; label: string; excerpt: string }[] {
  const results: { file: string; label: string; excerpt: string }[] = [];
  for (const dir of RESPONSE_SCAN_ROOTS) {
    const base = path.join(root, dir);
    try {
      statSync(base);
    } catch {
      continue;
    }
    for (const file of walk(base, [])) {
      for (const hit of findProhibitedResponseLanguage(readFileSync(file, "utf8"))) {
        results.push({ file: path.relative(root, file), ...hit });
      }
    }
  }
  return results;
}

/**
 * Owner decisions (release 2, November 8 2026). Public source may not:
 * - claim the company is bonded (insured and registration claims stay). Material
 *   descriptions such as "laminate bonded to a substrate" are not claims;
 * - promise an instant estimate, an estimate in minutes, or same-day financing approval;
 * - promise one contract or one invoice for every project;
 * - say the company's workmanship coverage includes subcontractors (they carry
 *   their own warranty, and we hand over a complete subcontractor list);
 * - state the retired builder 50/50 payment split.
 */
export const PROHIBITED_CLAIM_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "bonded claim", pattern: /\bbonded\b(?!\s+(?:to|with|under|onto|together)\b)/i },
  { label: "instant estimate", pattern: /\binstant(?:ly)?\s+(?:online\s+)?(?:estimates?|estimator|quotes?|pric(?:e|es|ing)|ranges?|planning\s+ranges?)\b/i },
  {
    label: "estimate in minutes",
    pattern: /\b(?:estimates?|quotes?|price|pricing|planning\s+range|range)\b[^.]{0,60}?\bin\s+(?:about\s+|under\s+|less\s+than\s+)?(?:a\s+|one\s+|\d+\s+)?(?:few\s+)?(?:minutes?|seconds?)\b/i,
  },
  { label: "same-day approval", pattern: /\bsame[\s-]+day\s+(?:approval|approvals|financing|credit|decision|decisions)\b/i },
  { label: "one contract or invoice", pattern: /\b(?:one|single)\s+(?:contract|invoice|bill)\b/i },
  {
    label: "workmanship covers subcontractors",
    pattern: /\bsubcontractors we hire\b|\bcrews?\s+and\s+(?:the\s+)?subcontractors\b|\bour people and the subcontractors\b/i,
  },
  { label: "builder 50/50 split", pattern: /\b50%\s+deposit\b|\b50%\s+(?:due\s+)?after\s+installation\b|\bfifty percent (?:reserves|is due)\b/i },
];

export function findProhibitedClaims(source: string): { label: string; excerpt: string }[] {
  const text = normalizeForResponseScan(source);
  const hits: { label: string; excerpt: string }[] = [];
  for (const { label, pattern } of PROHIBITED_CLAIM_PATTERNS) {
    const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    for (const match of text.matchAll(global)) {
      const start = match.index ?? 0;
      hits.push({ label, excerpt: text.slice(Math.max(0, start - 60), start + match[0].length + 40).trim() });
    }
  }
  return hits;
}

export function scanSourceForProhibitedClaims(root: string): { file: string; label: string; excerpt: string }[] {
  const results: { file: string; label: string; excerpt: string }[] = [];
  for (const dir of RESPONSE_SCAN_ROOTS) {
    const base = path.join(root, dir);
    try {
      statSync(base);
    } catch {
      continue;
    }
    for (const file of walk(base, [])) {
      for (const hit of findProhibitedClaims(readFileSync(file, "utf8"))) {
        results.push({ file: path.relative(root, file), ...hit });
      }
    }
  }
  return results;
}
