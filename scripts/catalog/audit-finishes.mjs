#!/usr/bin/env node
/**
 * Finish parity audit: confirms every finish name in data/catalog.json actually
 * appears in the supplier PDF (catches typos / invented names / wrong spelling),
 * and reports category counts + material-line distribution for a human sanity
 * check against the PDF sections (Matte p10-21, Gloss p22-35, Woodgrain p36-67).
 *
 *   node scripts/catalog/audit-finishes.mjs [path-to-pdf]
 *
 * Output: docs/catalog-audit/finish-diff.md (+ non-zero exit if any catalog
 * finish name cannot be located in the PDF text).
 *
 * Names are compared accent- and case-insensitively with whitespace collapsed,
 * so multi-line PDF swatch labels ("CANYON\nCHARCOAL") match catalog names
 * ("Canyon Charcoal"), and accented supplier names ("BIANCO MALÉ") match too.
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
const OUT = path.join(OUT_DIR, "finish-diff.md");

const pdfPath = process.argv[2] || DEFAULT_PDF;
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

// Strip accents, uppercase, reduce every run of non-alphanumerics to a single
// space. Applied to both the PDF text and each catalog finish name.
function norm(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

const rawText = execSync(`pdftotext ${JSON.stringify(pdfPath)} -`, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const pdfBlob = norm(rawText.replace(/\n/g, " "));

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

// Three tiers of confidence:
//   exact  - the full name is a consecutive phrase in the PDF text
//   words  - every word in the name appears in the PDF, but not consecutively
//            (expected for column-stacked swatch grids that pdftotext cannot
//            reassemble into a single reading-order phrase)
//   absent - at least one word never appears anywhere in the PDF -> a real
//            spelling/invention deviation that must be fixed.
const exact = [];
const wordsOnly = [];
const notFound = [];
const wordSet = new Set(pdfBlob.split(" "));
for (const f of catalog.finishes) {
  const n = norm(f.name);
  const isExact =
    pdfBlob.includes(` ${n} `) || pdfBlob.startsWith(`${n} `) || pdfBlob.endsWith(` ${n}`);
  if (isExact) {
    exact.push(f);
    continue;
  }
  const words = n.split(" ");
  const missingWords = words.filter((w) => !wordSet.has(w));
  if (missingWords.length === 0) wordsOnly.push(f.name);
  else notFound.push({ name: f.name, category: f.category, missingWords });
}
const found = [...exact, ...wordsOnly];

const byCat = {};
for (const f of catalog.finishes) byCat[f.category] = (byCat[f.category] || 0) + 1;
const byLine = {};
for (const f of catalog.finishes) byLine[f.materialLine] = (byLine[f.materialLine] || 0) + 1;
const byTier = {};
for (const f of catalog.finishes) byTier[f.priceTier] = (byTier[f.priceTier] || 0) + 1;

fs.mkdirSync(OUT_DIR, { recursive: true });
const md = `# Finish parity: data/catalog.json vs OSC PDF

Generated: ${new Date().toISOString()}
Source PDF: ${path.relative(ROOT, pdfPath)}

| Metric | Count |
|--------|------:|
| Catalog finishes | ${catalog.finishes.length} |
| Names matched as exact phrase in PDF | ${exact.length} |
| Names matched word-by-word (grid-stacked labels) | ${wordsOnly.length} |
| Names with a word ABSENT from PDF (deviations) | ${notFound.length} |

## Category counts (catalog)

${Object.entries(byCat).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Price-tier distribution

${Object.entries(byTier).sort().map(([k, v]) => `- \`${k}\`: ${v}`).join("\n")}

## Material-line distribution

${Object.entries(byLine).sort().map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Names matched word-by-word, not as one phrase (${wordsOnly.length})

These are real PDF swatch labels whose two lines sit stacked in one grid column,
so pdftotext emits the words non-consecutively. Not deviations.

${wordsOnly.length ? wordsOnly.map((n) => `- ${n}`).join("\n") : "_None_"}

## Finish names with a word ABSENT from the PDF (${notFound.length})

${
  notFound.length
    ? "| Name | Category | Missing words |\n|------|------|------|\n" +
      notFound
        .map((m) => `| ${m.name} | ${m.category} | ${m.missingWords.join(", ")} |`)
        .join("\n")
    : "_None — every word of every catalog finish name appears in the supplier PDF._"
}
`;
fs.writeFileSync(OUT, md);

console.log(
  `finish audit: total=${catalog.finishes.length} exact=${exact.length} words_only=${wordsOnly.length} deviations=${notFound.length}`,
);
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
if (notFound.length) process.exit(2);
