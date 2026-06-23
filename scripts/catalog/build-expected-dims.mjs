#!/usr/bin/env node
/**
 * Build data/catalog-expected-cabinet-dims.json — the golden dimension manifest
 * extracted directly from the supplier PDF specification appendix. This locks
 * each cabinet's [minW,maxW,minH,maxH,minD,maxD] to the supplier's tabulated
 * values so catalog:verify can prove exact dimension parity, not just code
 * membership.
 *
 *   node scripts/catalog/build-expected-dims.mjs
 *
 * Only codes that appear in BOTH the PDF spec table AND data/catalog.json are
 * recorded. Some catalog variants (e.g. partition variants) share a box with a
 * tabulated sibling and are not separately tabulated; those are intentionally
 * not asserted here.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PDF = path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");
const OUT = path.join(ROOT, "data/catalog-expected-cabinet-dims.json");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");

const txt = execSync(`pdftotext -layout ${JSON.stringify(PDF)} -`, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
}).split("\n");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const catalogCodes = new Set(catalog.cabinets.map((c) => c.code));

// A spec row ends with exactly six integers; the token before them is the code.
const codeRe = /^[A-Z][A-Z0-9-]*[A-Z0-9]$/;
const dims = {};
for (const line of txt) {
  const toks = line.trim().split(/\s+/).filter(Boolean);
  if (toks.length < 7) continue;
  const last6 = toks.slice(-6);
  if (!last6.every((t) => /^\d+$/.test(t))) continue;
  const code = toks[toks.length - 7];
  if (!codeRe.test(code) || code.length < 2) continue;
  if (!catalogCodes.has(code)) continue; // skip PDF parse artifacts / non-catalog tokens
  const tuple = last6.map(Number);
  const prior = dims[code];
  if (prior && prior.join(",") !== tuple.join(",")) {
    console.error(
      `build-expected-dims FAIL — conflicting dimensions parsed for ${code}: ` +
        `[${prior.join(",")}] vs [${tuple.join(",")}]. Resolve the ambiguous PDF row before regenerating.`,
    );
    process.exit(1);
  }
  dims[code] = tuple;
}

const sorted = Object.fromEntries(Object.keys(dims).sort().map((k) => [k, dims[k]]));
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`Wrote ${Object.keys(sorted).length} golden cabinet dimensions to ${path.relative(ROOT, OUT)}`);
