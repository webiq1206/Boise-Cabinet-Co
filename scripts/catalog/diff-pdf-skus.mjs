#!/usr/bin/env node
/**
 * Diff OSC PDF SKU codes vs data/supplier-catalog/cabinetProducts.json
 * Writes docs/catalog-audit/sku-diff.md and sku-diff.csv
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA = path.join(ROOT, "data/supplier-catalog");
const OUT_DIR = path.join(ROOT, "docs/catalog-audit");
const DEFAULT_PDF = path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");
const TMP = path.join(ROOT, ".tmp-osc-catalog.txt");

import { extractOscSkuCodes } from "./osc-sku-patterns.mjs";

function extractPdfSkus(pdfPath) {
  if (!fs.existsSync(pdfPath)) {
    console.warn(`PDF not found: ${pdfPath} — using cached ${TMP}`);
    if (!fs.existsSync(TMP)) {
      console.error("No PDF and no .tmp-osc-catalog.txt cache");
      process.exit(1);
    }
  } else {
    execSync(`pdftotext "${pdfPath}" "${TMP}"`, { stdio: "pipe" });
  }
  const text = fs.readFileSync(TMP, "utf8");
  return extractOscSkuCodes(text);
}

function main() {
  const pdfPath = process.argv[2] || DEFAULT_PDF;
  const pdfSkus = extractPdfSkus(pdfPath);
  const products = JSON.parse(fs.readFileSync(path.join(DATA, "cabinetProducts.json"), "utf8"));
  const jsonSkus = new Set(products.map((p) => p.oscCode));

  const inPdfOnly = [...pdfSkus].filter((s) => !jsonSkus.has(s)).sort();
  const inJsonOnly = [...jsonSkus].filter((s) => !pdfSkus.has(s)).sort();
  const inBoth = [...pdfSkus].filter((s) => jsonSkus.has(s)).sort();

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const md = `# SKU diff: OSC PDF vs cabinetProducts.json

Generated: ${new Date().toISOString()}

| Metric | Count |
|--------|------:|
| PDF SKUs | ${pdfSkus.size} |
| JSON SKUs | ${jsonSkus.size} |
| In both | ${inBoth.length} |
| PDF only | ${inPdfOnly.length} |
| JSON only | ${inJsonOnly.length} |

## PDF only (${inPdfOnly.length})

${inPdfOnly.length ? inPdfOnly.map((s) => `- \`${s}\``).join("\n") : "_None_"}

## JSON only (${inJsonOnly.length})

${inJsonOnly.length ? inJsonOnly.map((s) => `- \`${s}\``).join("\n") : "_None_"}
`;

  fs.writeFileSync(path.join(OUT_DIR, "sku-diff.md"), md);

  const csvLines = [
    "status,oscCode",
    ...inBoth.map((s) => `both,${s}`),
    ...inPdfOnly.map((s) => `pdf_only,${s}`),
    ...inJsonOnly.map((s) => `json_only,${s}`),
  ];
  fs.writeFileSync(path.join(OUT_DIR, "sku-diff.csv"), csvLines.join("\n") + "\n");

  console.log(
    `SKU diff: PDF=${pdfSkus.size} JSON=${jsonSkus.size} both=${inBoth.length} pdf_only=${inPdfOnly.length} json_only=${inJsonOnly.length}`,
  );
  console.log(`Wrote docs/catalog-audit/sku-diff.md and sku-diff.csv`);
}

main();
