#!/usr/bin/env node
/**
 * Extract the real finish swatch images from the supplier PDF and write them as
 * WebP tiles the catalog codegen will pick up automatically.
 *
 *   node scripts/catalog/extract-pdf-images.mjs [--force] [--pdf path]
 *
 * Strategy (reliable name->image mapping):
 *   1. pdftotext -bbox-layout gives the exact rectangle of every printed swatch
 *      LABEL, per page.
 *   2. Finish swatches sit directly above, and left-aligned with, their label in
 *      a regular grid. We derive each page's column pitch + row pitch from the
 *      label positions, then crop the rectangle immediately above each label.
 *   3. pdftoppm renders the page to a raster; sharp crops + encodes WebP.
 *
 * Category is assigned by page range (Matte 10-21, Gloss 22-35, Woodgrain
 * 36-67) and each label is matched to a real catalog finish name in that
 * category, so headings / material blurbs / page numbers are ignored.
 *
 * Output: public/images/catalog/finishes/{category}-{slug}.webp
 * By default only fills gaps (won't clobber an existing curated image); pass
 * --force to overwrite. Writes docs/catalog-audit/pdf-image-extract.md.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const pdfArgIdx = args.indexOf("--pdf");
const PDF = pdfArgIdx >= 0 ? args[pdfArgIdx + 1] : path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const OUT_DIR = path.join(ROOT, "public/images/catalog/finishes");
const REPORT = path.join(ROOT, "docs/catalog-audit/pdf-image-extract.md");

const DPI = 220;
const SCALE = DPI / 72;
const PAGE_CATEGORY = (page) => {
  if (page >= 10 && page <= 21) return "matte";
  if (page >= 22 && page <= 35) return "gloss";
  if (page >= 36 && page <= 67) return "woodgrain";
  return null;
};

// MUST match codegen-catalog.mjs slugify EXACTLY (no accent folding) so the
// emitted filenames are the ones codegen looks up. Accent-insensitive matching
// is handled separately by norm().
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function norm(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

if (!fs.existsSync(PDF)) {
  console.error(`PDF not found: ${PDF}`);
  process.exit(1);
}

// ── Build the set of valid finish names per category ──────────────────────────
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const finishByCatName = new Map(); // `${category}|${NORM NAME}` -> { name, baseSlug }
for (const f of catalog.finishes) {
  const cat = f.category.toLowerCase();
  finishByCatName.set(`${cat}|${norm(f.name)}`, {
    name: f.name,
    baseSlug: slugify(`${cat}-${f.name}`),
  });
}

// ── Parse label boxes from the bbox-layout XHTML ──────────────────────────────
const xml = execSync(`pdftotext -bbox-layout ${JSON.stringify(PDF)} -`, {
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
});

const pages = [];
const pageRe = /<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g;
let pm;
while ((pm = pageRe.exec(xml))) {
  pages.push({ width: +pm[1], height: +pm[2], body: pm[3] });
}

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const clusterBy = (vals, tol) => {
  const sorted = [...new Set(vals)].sort((a, b) => a - b);
  const groups = [];
  for (const v of sorted) {
    const g = groups[groups.length - 1];
    if (g && v - g.ref <= tol) g.members.push(v);
    else groups.push({ ref: v, members: [v] });
  }
  return groups.map((g) => Math.min(...g.members));
};

const tmpDir = fs.mkdirSync(path.join(os.tmpdir(), `osc-pdf-${Date.now()}`), { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const written = [];
const skipped = [];
const unmatchedLabels = [];

for (let i = 0; i < pages.length; i++) {
  const pageNo = i + 1;
  const category = PAGE_CATEGORY(pageNo);
  if (!category) continue;
  const { width, height, body } = pages[i];

  // ── Reconstruct grid cells from WORDS (pdftotext's <block> grouping merges
  //    horizontally-adjacent labels from different columns, so we cannot trust
  //    it). words -> text-lines -> columns -> cells (multi-line labels). ──────
  const words = [];
  const wordRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g;
  let wm;
  while ((wm = wordRe.exec(body))) {
    const text = wm[5].replace(/&amp;/g, "&").replace(/&[^;]+;/g, " ").trim();
    if (!text) continue;
    const yMin = +wm[2];
    if (yMin > height - 60) continue; // page footer
    words.push({ text, xMin: +wm[1], yMin, xMax: +wm[3], yMax: +wm[4] });
  }
  if (!words.length) continue;

  // Group words into baseline rows (tol 4pt). A row spans the full page width
  // across every column, so we then split each row into column SEGMENTS wherever
  // the horizontal gap between consecutive words is large (within-label spaces
  // are ~4-6pt; the gap between two columns is >=14pt).
  const COL_GAP = 12;
  const rowBaselines = clusterBy(words.map((w) => w.yMin), 4);
  const rowMap = new Map();
  for (const w of words) {
    const base = rowBaselines.reduce((b, t) => (Math.abs(t - w.yMin) < Math.abs(b - w.yMin) ? t : b), rowBaselines[0]);
    (rowMap.get(base) || rowMap.set(base, []).get(base)).push(w);
  }
  const fragments = []; // { left, top, text } - one label fragment per column per row
  for (const [base, ws] of rowMap) {
    ws.sort((a, b) => a.xMin - b.xMin);
    let seg = null;
    for (const w of ws) {
      if (seg && w.xMin - seg.xMax <= COL_GAP) {
        seg.text += ` ${w.text}`;
        seg.xMax = w.xMax;
      } else {
        seg = { left: w.xMin, xMax: w.xMax, top: base, text: w.text };
        fragments.push(seg);
      }
    }
  }

  // Columns from fragment left edges (each fragment starts at its column left).
  const colLeftsAll = clusterBy(fragments.map((f) => f.left), 40);
  // Group lines per column, then split each column's lines into cells by y-gap.
  const cells = [];
  for (const col of colLeftsAll) {
    const colFrags = fragments
      .filter((f) => Math.abs(f.left - col) <= 40)
      .sort((a, b) => a.top - b.top);
    let cur = null;
    for (const f of colFrags) {
      if (cur && f.top - cur.lastTop < 60) {
        cur.text += ` ${f.text}`;
        cur.lastTop = f.top;
      } else {
        cur = { left: col, yMin: f.top, lastTop: f.top, text: f.text };
        cells.push(cur);
      }
    }
  }

  // Keep only cells whose text is a real finish name in this category.
  const labels = [];
  for (const c of cells) {
    const key = `${category}|${norm(c.text)}`;
    const hit = finishByCatName.get(key);
    if (hit) labels.push({ xMin: c.left, yMin: c.yMin, ...hit });
    else if (/[A-Z]/.test(c.text) && c.text.length <= 28) {
      unmatchedLabels.push({ page: pageNo, category, text: c.text });
    }
  }
  if (!labels.length) continue;

  // Derive grid geometry from label positions.
  const colLefts = clusterBy(labels.map((l) => l.xMin), 40);
  const rowTops = clusterBy(labels.map((l) => l.yMin), 24);
  const colPitch =
    colLefts.length > 1 ? median(colLefts.slice(1).map((c, k) => c - colLefts[k])) : 176;
  const rowPitch =
    rowTops.length > 1 ? median(rowTops.slice(1).map((r, k) => r - rowTops[k])) : 234;
  const swatchW = Math.max(40, colPitch - 10);
  const swatchTopGap = 22; // points between swatch top and the row above's label
  const swatchBottomGap = 8; // points between swatch bottom and its own label

  // Render the page once.
  const ppmBase = path.join(tmpDir, `p${pageNo}`);
  execSync(`pdftoppm -png -r ${DPI} -f ${pageNo} -l ${pageNo} ${JSON.stringify(PDF)} ${JSON.stringify(ppmBase)}`, {
    stdio: "pipe",
  });
  const rendered = fs.readdirSync(tmpDir).find((f) => f.startsWith(`p${pageNo}-`) || f === `p${pageNo}.png`);
  if (!rendered) continue;
  const pageImg = path.join(tmpDir, rendered);
  const meta = await sharp(pageImg).metadata();
  const pxScaleX = meta.width / width;
  const pxScaleY = meta.height / height;

  for (const l of labels) {
    const colLeft = colLefts.reduce((best, c) => (Math.abs(c - l.xMin) < Math.abs(best - l.xMin) ? c : best), colLefts[0]);
    // Square crop anchored at the label's top edge (a reliable boundary): height
    // = swatch width. This stays well inside the printed swatch and never
    // overshoots into the page background / header on pages with description
    // blocks (which a row-pitch-derived height does).
    const botPt = l.yMin - swatchBottomGap;
    const availAbove = botPt - 8; // top margin guard
    const side = Math.min(swatchW, availAbove, rowPitch - swatchTopGap);
    const topPt = botPt - side;
    const leftPx = Math.round(colLeft * pxScaleX);
    const topPx = Math.round(topPt * pxScaleY);
    const wPx = Math.round(swatchW * pxScaleX);
    const hPx = Math.round(side * pxScaleY);
    if (hPx < 40 || wPx < 40) continue;

    const outFile = path.join(OUT_DIR, `${l.baseSlug}.webp`);
    if (fs.existsSync(outFile) && !FORCE) {
      skipped.push(l.baseSlug);
      continue;
    }
    const clampW = Math.min(wPx, meta.width - leftPx);
    const clampH = Math.min(hPx, meta.height - topPx);
    try {
      await sharp(pageImg)
        .extract({ left: leftPx, top: topPx, width: clampW, height: clampH })
        .resize(480, 480, { fit: "cover" })
        .webp({ quality: 86 })
        .toFile(outFile);
      written.push({ baseSlug: l.baseSlug, name: l.name, page: pageNo, category });
    } catch (e) {
      console.warn(`crop failed ${l.baseSlug} p${pageNo}: ${e.message}`);
    }
  }
}

// cleanup temp renders
try {
  for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
  fs.rmdirSync(tmpDir);
} catch {}

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
const byCat = written.reduce((a, w) => ((a[w.category] = (a[w.category] || 0) + 1), a), {});
const md = `# PDF swatch extraction

Generated: ${new Date().toISOString()}
Source: ${path.relative(ROOT, PDF)} @ ${DPI} DPI
Mode: ${FORCE ? "force (overwrite)" : "gap-fill (skip existing)"}

| Metric | Count |
|--------|------:|
| Swatches written | ${written.length} |
| Skipped (existing) | ${skipped.length} |
| Unmatched all-caps labels (triage) | ${unmatchedLabels.length} |

## Written by category

${Object.entries(byCat).map(([k, v]) => `- ${k}: ${v}`).join("\n") || "_None_"}

## Unmatched all-caps labels (not written; verify they are headings, not finishes)

${
  unmatchedLabels.length
    ? [...new Set(unmatchedLabels.map((u) => `p${u.page} [${u.category}] ${u.text}`))].slice(0, 80).join("\n")
    : "_None_"
}
`;
fs.writeFileSync(REPORT, md);

console.log(
  `pdf-extract: written=${written.length} skipped_existing=${skipped.length} unmatched_labels=${unmatchedLabels.length}`,
);
console.log(`Wrote ${path.relative(ROOT, REPORT)}`);
