#!/usr/bin/env node
/**
 * Independent dimension parity audit: re-parses the supplier PDF specification
 * appendix (pages ~124-145) and diffs every tabulated [minW,maxW,minH,maxH,
 * minD,maxD] row against data/catalog.json. Unlike build-expected-dims.mjs
 * (which only emits the golden manifest), this writes a human-readable report
 * so any deviation is visible at a glance.
 *
 *   node scripts/catalog/audit-pdf-dims.mjs [path-to-pdf]
 *
 * Output: docs/catalog-audit/dim-diff.md (+ a non-zero exit if any tabulated
 * code's dimensions disagree with the catalog).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULT_PDF = path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const OUT_DIR = path.join(ROOT, "docs/catalog-audit");
const OUT = path.join(OUT_DIR, "dim-diff.md");

const pdfPath = process.argv[2] || DEFAULT_PDF;
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const txt = execSync(`pdftotext -layout ${JSON.stringify(pdfPath)} -`, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
}).split("\n");

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const cabByCode = new Map(catalog.cabinets.map((c) => [c.code, c]));

// A spec row ends with exactly six integers; the token before them is the code.
const codeRe = /^[A-Z][A-Z0-9-]*[A-Z0-9]$/;
const pdfDims = {};
const conflicts = [];
for (const line of txt) {
  const toks = line.trim().split(/\s+/).filter(Boolean);
  if (toks.length < 7) continue;
  const last6 = toks.slice(-6);
  if (!last6.every((t) => /^\d+$/.test(t))) continue;
  const code = toks[toks.length - 7];
  if (!codeRe.test(code) || code.length < 2) continue;
  if (!cabByCode.has(code)) continue; // skip parse artifacts / non-catalog tokens
  const tuple = last6.map(Number);
  const prior = pdfDims[code];
  if (prior && prior.join(",") !== tuple.join(",")) {
    conflicts.push(`${code}: [${prior.join(",")}] vs [${tuple.join(",")}]`);
  }
  pdfDims[code] = tuple;
}

const dimKeys = ["minW", "maxW", "minH", "maxH", "minD", "maxD"];
const matches = [];
const mismatches = [];
for (const [code, want] of Object.entries(pdfDims)) {
  const c = cabByCode.get(code);
  const have = dimKeys.map((k) => c[k]);
  if (have.join(",") === want.join(",")) matches.push(code);
  else mismatches.push({ code, have, want });
}

const tabulated = new Set(Object.keys(pdfDims));
const untabulated = catalog.cabinets
  .map((c) => c.code)
  .filter((c) => !tabulated.has(c))
  .sort();

fs.mkdirSync(OUT_DIR, { recursive: true });
const md = `# Dimension parity: OSC PDF spec tables vs data/catalog.json

Generated: ${new Date().toISOString()}
Source PDF: ${path.relative(ROOT, pdfPath)}

| Metric | Count |
|--------|------:|
| Catalog cabinets | ${catalog.cabinets.length} |
| PDF-tabulated codes matched to catalog | ${tabulated.size} |
| Dimensions MATCH | ${matches.length} |
| Dimensions MISMATCH | ${mismatches.length} |
| Catalog codes not separately tabulated in PDF | ${untabulated.length} |
| Parse conflicts (same code, two dim rows) | ${conflicts.length} |

## Mismatches (${mismatches.length})

${
  mismatches.length
    ? "| Code | Catalog [W,H,D min/max] | PDF |\n|------|------|------|\n" +
      mismatches
        .map((m) => `| \`${m.code}\` | ${m.have.join(",")} | ${m.want.join(",")} |`)
        .join("\n")
    : "_None — every PDF-tabulated cabinet dimension matches the catalog exactly._"
}

## Parse conflicts (${conflicts.length})

${conflicts.length ? conflicts.map((c) => `- ${c}`).join("\n") : "_None_"}

## Catalog codes not separately tabulated in the PDF (${untabulated.length})

These are box-sharing fronts / panels / fillers / partition variants the PDF
appendix does not list with their own six-dimension row. Expected; not a deviation.

${untabulated.length ? untabulated.map((c) => `- \`${c}\``).join("\n") : "_None_"}
`;
fs.writeFileSync(OUT, md);

console.log(
  `dim audit: tabulated=${tabulated.size} match=${matches.length} mismatch=${mismatches.length} untabulated=${untabulated.length} conflicts=${conflicts.length}`,
);
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
if (mismatches.length || conflicts.length) process.exit(2);
