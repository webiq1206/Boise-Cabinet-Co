#!/usr/bin/env node
/**
 * Build docs/catalog-audit/image-coverage.md: per-finish image source
 * (website | pdf | generated) plus a door/cabinet summary. Run after the PDF
 * extraction + website scrape so the coverage reflects what is on disk.
 *
 *   node scripts/catalog/build-image-coverage.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const FIN_DIR = path.join(ROOT, "public/images/catalog/finishes");
const WEB_REPORT = path.join(ROOT, "docs/catalog-audit/web-image-scrape.md");
const OUT = path.join(ROOT, "docs/catalog-audit/image-coverage.md");

// Match codegen-catalog.mjs slugify EXACTLY (no accent folding).
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

// Which baseSlugs came from the website (preferred source).
const webSet = new Set();
if (fs.existsSync(WEB_REPORT)) {
  for (const m of fs.readFileSync(WEB_REPORT, "utf8").matchAll(/->\s+([a-z0-9-]+)\.webp/g)) {
    webSet.add(m[1]);
  }
}

const rows = [];
const counts = { website: 0, pdf: 0, generated: 0 };
const generatedList = [];
for (const f of catalog.finishes) {
  const cat = f.category.toLowerCase();
  const baseSlug = slugify(`${cat}-${f.name}`);
  const altSlug = slugify(f.name);
  const onDisk =
    fs.existsSync(path.join(FIN_DIR, `${baseSlug}.webp`)) ||
    fs.existsSync(path.join(FIN_DIR, `${altSlug}.webp`));
  let source;
  if (webSet.has(baseSlug)) source = "website";
  else if (onDisk) source = "pdf";
  else {
    source = "generated";
    generatedList.push(`${f.category}: ${f.name}`);
  }
  counts[source]++;
  rows.push({ name: f.name, category: f.category, baseSlug, source });
}

const doorReal = catalog.doorStyles.filter((d) => {
  const rel = d.image
    ? d.image.replace(/^\/?/, "")
    : `door-styles/${slugify(d.name)}.webp`;
  return fs.existsSync(path.join(ROOT, "public/images/catalog", rel));
}).length;

// Cabinet SKUs wired to a real supplier family rendering (boxImage -> renderings/).
const CAB_GEN = path.join(ROOT, "shared/catalog/generated/cabinetProducts.ts");
let cabRendered = 0;
let cabTotal = Array.isArray(catalog.cabinets) ? catalog.cabinets.length : 0;
if (fs.existsSync(CAB_GEN)) {
  const src = fs.readFileSync(CAB_GEN, "utf8");
  cabRendered = (src.match(/\/images\/catalog\/renderings\//g) || []).length;
  if (!cabTotal) cabTotal = (src.match(/boxImage:/g) || []).length;
}

const md = `# Image coverage report

Generated: ${new Date().toISOString()}

Finish swatch source priority: **website** (onesourcecabinets.com, cleaned) >
**pdf** (Custom_Catalog.v1.pdf high-DPI crop) > **generated** (flat tile fallback).
codegen resolves each finish to \`public/images/catalog/finishes/{category}-{slug}.webp\`
automatically, so no catalog.json image-field edits are required.

## Finish swatches (${catalog.finishes.length})

| Source | Count |
|--------|------:|
| Website (real photo) | ${counts.website} |
| PDF crop (real swatch) | ${counts.pdf} |
| Generated tile (fallback) | ${counts.generated} |
| **Real total** | **${counts.website + counts.pdf}** |

## Finishes still on a generated fallback (${generatedList.length})

${
  generatedList.length
    ? generatedList.map((g) => `- ${g}`).join("\n") +
      "\n\n_These labels are ambiguously grid-merged in the PDF and not present in the website galleries, so a clean per-swatch crop could not be mapped automatically. They fall back to a color-accurate flat tile._"
    : "_None — every finish has a real swatch image._"
}

## Doors & cabinets

- Door styles with a real supplier profile rendering (PDF p8-9): ${doorReal}/${catalog.doorStyles.length}
- Cabinet SKUs wired to a real supplier family rendering (PDF p82-123): ${cabRendered}/${cabTotal}
- Remaining ${Math.max(cabTotal - cabRendered, 0)} cabinet SKUs have no dedicated supplier line drawing (e.g. glass-wall, some floating variants, trim/filler/panel items) and fall back to a spec-accurate front-elevation SVG diagram.

## Per-finish detail

| Finish | Category | Source | File |
|--------|----------|--------|------|
${rows.map((r) => `| ${r.name} | ${r.category} | ${r.source} | ${r.baseSlug}.webp |`).join("\n")}
`;

fs.writeFileSync(OUT, md);
console.log(
  `image-coverage: website=${counts.website} pdf=${counts.pdf} generated=${counts.generated} (real ${counts.website + counts.pdf}/${catalog.finishes.length})`,
);
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
