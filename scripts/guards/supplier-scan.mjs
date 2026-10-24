/**
 * Shared supplier-name matcher for the postbuild guard, the e2e spec, and the
 * live smoke script. Terms are case-insensitive. Allowlist phrases are exact.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "../..");

const ALLOWLIST = Object.freeze([
  "one source paragraph",
  "one sourceReview",
  "at least one source file",
]);

export function loadTerms() {
  const config = JSON.parse(fs.readFileSync(path.join(HERE, "supplier-terms.json"), "utf8"));
  const terms = config.terms;
  const allowlist = config.allowlist;
  if (!Array.isArray(terms) || terms.length === 0) {
    throw new Error("scripts/guards/supplier-terms.json needs a terms array");
  }
  if (JSON.stringify(allowlist) !== JSON.stringify(ALLOWLIST)) {
    throw new Error("supplier allowlist must stay limited to the three exact phrases");
  }
  return {
    terms: terms.map((term) => new RegExp(term, "gi")),
    termSources: terms,
    allowlist,
    // Seed review names are guarded on the reviews follow-up. This scan is supplier terms.
    seedNames: [],
  };
}

/** Reuse the #81 follow-up name list. Do not copy the literals into this file. */
export function loadSeedNames() {
  const source = fs.readFileSync(path.join(ROOT, "tests/hide-seed-testimonials.test.ts"), "utf8");
  const match = source.match(/const NAMES = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("tests/hide-seed-testimonials.test.ts is missing const NAMES");
  const names = JSON.parse(match[1]);
  if (!Array.isArray(names) || names.length !== 4 || names.some((name) => typeof name !== "string" || !name.includes(" "))) {
    throw new Error("seed name list in tests/hide-seed-testimonials.test.ts is not the four expected names");
  }
  return names;
}

export function scrubAllowlist(text, allowlist) {
  let out = text;
  for (const phrase of allowlist) out = out.split(phrase).join(" ".repeat(phrase.length));
  return out;
}

export function findHits(text, rules) {
  const scrubbed = scrubAllowlist(String(text), rules.allowlist);
  const hits = [];
  for (let i = 0; i < rules.terms.length; i++) {
    const re = new RegExp(rules.terms[i].source, "gi");
    let match;
    while ((match = re.exec(scrubbed))) {
      hits.push({ kind: rules.termSources[i], index: match.index, match: match[0] });
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }
  for (const name of rules.seedNames) {
    let from = 0;
    while (from <= scrubbed.length) {
      const index = scrubbed.indexOf(name, from);
      if (index < 0) break;
      hits.push({ kind: "seed-name", index, match: name });
      from = index + name.length;
    }
  }
  return hits;
}

export function snippet(text, index, match) {
  const start = Math.max(0, index - 48);
  const end = Math.min(text.length, index + String(match).length + 48);
  return text.slice(start, end).replace(/\s+/g, " ");
}

export function printableRuns(buffer) {
  const text = Buffer.isBuffer(buffer) ? buffer.toString("latin1") : String(buffer);
  return (text.match(/[\x20-\x7E]{4,}/g) || []).join("\n");
}
