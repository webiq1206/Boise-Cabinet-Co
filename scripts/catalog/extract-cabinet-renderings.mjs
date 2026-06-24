#!/usr/bin/env node
/**
 * Extract the supplier's cabinet line-drawing renderings from the catalog PDF
 * and map each one to the SKU codes it represents.
 *
 *   node scripts/catalog/extract-cabinet-renderings.mjs [--pages 82-123]
 *
 * The cabinet section pages (~p82-123) lay each cabinet FAMILY out as:
 *   [blue banner header] -> [isometric drawing(s) + dimension callouts] ->
 *   [vertical list of SKU codes] (W-1D-0S, W-1D-1S, ...).
 * The SKU list is the reliable anchor: every code in it is a real catalog
 * cabinet code. We group the codes per page column, crop the block above/around
 * each group (the supplier's actual drawing for that family), and map every code
 * in the group to that one rendering — exactly how the supplier presents them.
 *
 * Output:
 *   public/images/catalog/renderings/{first-code-slug}.webp  (one per family)
 *   data/supplier-catalog/cabinetRenderings.json             ({ CODE: path })
 *   docs/catalog-audit/cabinet-rendering-extract.md
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PDF = path.join(ROOT, "docs/supplier/Custom_Catalog.v1.pdf");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const OUT_DIR = path.join(ROOT, "public/images/catalog/renderings");
const MAP_OUT = path.join(ROOT, "data/supplier-catalog/cabinetRenderings.json");
const REPORT = path.join(ROOT, "docs/catalog-audit/cabinet-rendering-extract.md");

const DPI = 200;
const args = process.argv.slice(2);
const pagesArgIdx = args.indexOf("--pages");
const pagesArg = pagesArgIdx >= 0 ? args[pagesArgIdx + 1] : "82-123";
const [P_FROM, P_TO] = pagesArg.split("-").map(Number);

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const catalogCodes = new Set(catalog.cabinets.map((c) => c.code));

const xml = execSync(`pdftotext -bbox-layout -f ${P_FROM} -l ${P_TO} ${JSON.stringify(PDF)} -`, {
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
});
const pageBlocks = xml.split(/<page /).slice(1);

fs.mkdirSync(OUT_DIR, { recursive: true });
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "osc-render-"));

const mapping = {}; // CODE -> public path
const families = []; // for report
const usedNames = new Set();

// Detect the navy section headers (RGB ~54,103,163). Some pages style them as a
// solid blue BAR, others as blue TEXT — both are the only blue on the page, so we
// segment each row's blue pixels into horizontal clusters (splitting columns that
// sit side by side) and group them vertically into header rectangles.
function detectHeaders(data, info) {
  const { width: W, height: H, channels: C } = info;
  const MERGE_GAP = Math.round(W * 0.035); // merge letters/words, keep columns apart
  const MIN_EXT = Math.round(W * 0.05);
  const isBlue = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return r < 120 && g > 55 && g < 160 && b > 115 && b - r > 40;
  };
  const rowClusters = [];
  for (let y = 0; y < H; y++) {
    const xs = [];
    for (let x = 0; x < W; x++) if (isBlue((y * W + x) * C)) xs.push(x);
    const clusters = [];
    let cx0 = null, cx1 = null;
    for (const x of xs) {
      if (cx0 === null) { cx0 = cx1 = x; }
      else if (x - cx1 <= MERGE_GAP) cx1 = x;
      else { clusters.push({ x0: cx0, x1: cx1 }); cx0 = cx1 = x; }
    }
    if (cx0 !== null) clusters.push({ x0: cx0, x1: cx1 });
    rowClusters[y] = clusters.filter((c) => c.x1 - c.x0 >= MIN_EXT);
  }
  const rects = [];
  const active = [];
  for (let y = 0; y < H; y++) {
    const used = new Set();
    for (const r of active) {
      const m = rowClusters[y].find(
        (c) => !used.has(c) && Math.min(c.x1, r.x1) - Math.max(c.x0, r.x0) > -10,
      );
      if (m && y - r.y1 <= 3) {
        r.y1 = y; r.x0 = Math.min(r.x0, m.x0); r.x1 = Math.max(r.x1, m.x1); used.add(m);
      }
    }
    for (const c of rowClusters[y]) {
      if (!used.has(c)) { const nr = { x0: c.x0, x1: c.x1, y0: y, y1: y }; rects.push(nr); active.push(nr); }
    }
    for (let i = active.length - 1; i >= 0; i--) if (y - active[i].y1 > 3) active.splice(i, 1);
  }
  return rects.filter((b) => b.y1 - b.y0 >= 12 && b.y1 - b.y0 <= 130 && b.x1 - b.x0 >= MIN_EXT);
}

// Hood pages are a per-item grid (drawing ABOVE a caption whose last line is the
// code) with no per-item blue header — handled by a dedicated pass below.
const HOOD_PAGES = new Set([99, 100, 101, 102, 103]);

async function emitCrop(pageImg, info, box, codes) {
  const uniq = [...new Set(codes)];
  if (!uniq.length || box.width < 60 || box.height < 60) return;
  const firstCode = [...uniq].sort()[0];
  let name = slugify(firstCode);
  while (usedNames.has(name)) name = `${name}-x`;
  usedNames.add(name);
  const outRel = `/images/catalog/renderings/${name}.webp`;
  try {
    await sharp(pageImg)
      .extract({
        left: box.left,
        top: box.top,
        width: Math.min(box.width, info.width - box.left),
        height: Math.min(box.height, info.height - box.top),
      })
      .resize(820, null, { withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(path.join(ROOT, outRel.replace(/^\//, "public/")));
    for (const c of uniq) mapping[c] = outRel;
    families.push({ page: box.page, name, codes: uniq });
  } catch (e) {
    console.warn(`crop failed p${box.page} ${name}: ${e.message}`);
  }
}

for (let idx = 0; idx < pageBlocks.length; idx++) {
  const pageNo = P_FROM + idx;
  if (HOOD_PAGES.has(pageNo)) continue;
  const blk = pageBlocks[idx];
  const dim = blk.match(/width="([\d.]+)" height="([\d.]+)"/);
  if (!dim) continue;
  const width = +dim[1];
  const height = +dim[2];

  const anchors = [];
  for (const wm of blk.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g)) {
    const text = wm[5].replace(/&amp;/g, "&").trim();
    if (catalogCodes.has(text)) {
      anchors.push({ code: text, xMin: +wm[1], yMin: +wm[2], xMax: +wm[3], yMax: +wm[4] });
    }
  }
  if (!anchors.length) continue;

  const ppmBase = path.join(tmpDir, `p${pageNo}`);
  execSync(`pdftoppm -png -r ${DPI} -f ${pageNo} -l ${pageNo} ${JSON.stringify(PDF)} ${JSON.stringify(ppmBase)}`, { stdio: "pipe" });
  const rendered = fs.readdirSync(tmpDir).find((f) => f === `p${pageNo}.png` || f.startsWith(`p${pageNo}-`));
  if (!rendered) continue;
  const pageImg = path.join(tmpDir, rendered);
  const { data, info } = await sharp(pageImg).raw().toBuffer({ resolveWithObject: true });
  const sx = info.width / width;
  const sy = info.height / height;
  const footerPx = Math.round(info.height * 0.935);

  const headers = detectHeaders(data, info).sort((a, b) => a.y0 - b.y0);
  if (!headers.length) continue;

  // Cluster header centers into columns; column x-bounds = midpoints between
  // adjacent column centers (page edges at the ends). Works for bar OR text
  // headers and for 2- or 3-column pages.
  const centers = [...new Set(headers.map((h) => Math.round((h.x0 + h.x1) / 2)))].sort((a, b) => a - b);
  const colCenters = [];
  for (const c of centers) {
    const last = colCenters[colCenters.length - 1];
    if (last !== undefined && c - last < info.width * 0.12) { colCenters[colCenters.length - 1] = Math.round((last + c) / 2); continue; }
    colCenters.push(c);
  }
  const colBounds = colCenters.map((c, i) => ({
    center: c,
    left: i === 0 ? 0 : Math.round((colCenters[i - 1] + c) / 2),
    right: i === colCenters.length - 1 ? info.width : Math.round((c + colCenters[i + 1]) / 2),
  }));
  const colOf = (cx) =>
    colBounds.reduce((best, cb) => (Math.abs(cb.center - cx) < Math.abs(best.center - cx) ? cb : best), colBounds[0]);

  // "ink" = dark, non-blue pixel (line art, dim text, codes) — excludes headers.
  const isInk = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < 120 && g > 55 && g < 160 && b - r > 40) return false; // header blue
    return (r + g + b) / 3 < 170;
  };
  const inkInRow = (x0, x1, y) => {
    let n = 0;
    for (let x = x0; x < x1; x++) if (isInk((y * info.width + x) * info.channels)) n++;
    return n;
  };

  // Assign each code to the nearest header ABOVE it (y-primary; x only breaks ties
  // between headers at a similar height). Code lists often drift horizontally away
  // from their drawing/column, so x-range filtering is unreliable — header
  // proximity is not.
  const TOL = 22 * sy; // a code list may sit beside (same y as) its own header
  const assigned = new Map();
  for (const a of anchors) {
    const ay = a.yMin * sy;
    const cand = headers.filter((h) => h.y0 <= ay + TOL);
    if (!cand.length) continue;
    const maxY0 = Math.max(...cand.map((h) => h.y0));
    const near = cand.filter((h) => maxY0 - h.y0 < 34 * sy);
    const ax = ((a.xMin + a.xMax) / 2) * sx;
    near.sort((p, q) => Math.abs((p.x0 + p.x1) / 2 - ax) - Math.abs((q.x0 + q.x1) / 2 - ax));
    const h = near[0];
    if (!assigned.has(h)) assigned.set(h, []);
    assigned.get(h).push(a);
  }

  for (const b of headers) {
    const codesA = assigned.get(b);
    if (!codesA || !codesA.length) continue;
    const col = colOf(Math.round((b.x0 + b.x1) / 2));
    // Vertical extent: just below this header down to the next header in the SAME
    // column, else footer.
    const below = headers.filter((o) => o.y0 > b.y1 + 5 && colOf(Math.round((o.x0 + o.x1) / 2)) === col);
    const capPx = below.length ? Math.min(...below.map((o) => o.y0)) - 6 : footerPx;
    const topPx = b.y1 + 4;
    if (capPx - topPx < 60) continue;

    const winX0 = col.left + 2;
    const winX1 = col.right - 2;

    // When a next header bounds this section, crop the whole section (handles
    // codes above OR below the drawing). For the last/only section in a column
    // (no next header), bound by this family's code list so shared centered
    // legends/cutaways below the columns are excluded. Then trim trailing white.
    const maxCodeY = Math.max(...codesA.map((a) => a.yMax * sy));
    let bottomPx = below.length ? capPx : Math.min(Math.round(maxCodeY) + 46, footerPx);
    while (bottomPx > topPx + 60 && inkInRow(winX0, winX1, bottomPx - 1) < 4) bottomPx--;
    bottomPx = Math.min(bottomPx + 14, capPx);
    if (bottomPx - topPx < 60) continue;

    // content-aware left/right of the actual drawing+labels within the column
    let colX0 = winX1, colX1 = winX0;
    for (let x = winX0; x < winX1; x++) {
      let ink = 0;
      for (let y = topPx; y < bottomPx; y++) if (isInk((y * info.width + x) * info.channels)) ink++;
      if (ink > 4) { if (x < colX0) colX0 = x; if (x > colX1) colX1 = x; }
    }
    colX0 = Math.max(winX0, colX0 - 12);
    colX1 = Math.min(winX1, colX1 + 12);
    if (colX1 - colX0 < 60) continue;

    await emitCrop(pageImg, info, {
      page: pageNo,
      left: colX0,
      top: topPx,
      width: colX1 - colX0,
      height: bottomPx - topPx,
    }, codesA.map((a) => a.code));
  }
}

// --- Hood pass: 3-column grid, drawing above each caption ---
for (let idx = 0; idx < pageBlocks.length; idx++) {
  const pageNo = P_FROM + idx;
  if (!HOOD_PAGES.has(pageNo)) continue;
  const blk = pageBlocks[idx];
  const dim = blk.match(/width="([\d.]+)" height="([\d.]+)"/);
  if (!dim) continue;
  const width = +dim[1], height = +dim[2];

  const anchors = [];
  for (const wm of blk.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g)) {
    const text = wm[5].replace(/&amp;/g, "&").trim();
    if (catalogCodes.has(text)) anchors.push({ code: text, xMin: +wm[1], yMin: +wm[2], xMax: +wm[3], yMax: +wm[4] });
  }
  if (!anchors.length) continue;

  const ppmBase = path.join(tmpDir, `p${pageNo}`);
  execSync(`pdftoppm -png -r ${DPI} -f ${pageNo} -l ${pageNo} ${JSON.stringify(PDF)} ${JSON.stringify(ppmBase)}`, { stdio: "pipe" });
  const rendered = fs.readdirSync(tmpDir).find((f) => f === `p${pageNo}.png` || f.startsWith(`p${pageNo}-`));
  if (!rendered) continue;
  const pageImg = path.join(tmpDir, rendered);
  const meta = await sharp(pageImg).metadata();
  const sx = meta.width / width;
  const sy = meta.height / height;

  // Columns from code LEFT edges (captions are left-aligned). Column boundaries
  // sit just left of the next column's caption so drawings/captions never clip.
  const xls = anchors.map((a) => a.xMin * sx).sort((x, y) => x - y);
  const colLefts = [];
  for (const xl of xls) {
    const last = colLefts[colLefts.length - 1];
    if (last && xl - last.sum / last.n < meta.width * 0.12) { last.sum += xl; last.n++; }
    else colLefts.push({ sum: xl, n: 1 });
  }
  const lefts = colLefts.map((c) => c.sum / c.n);
  const colIndex = (xl) => {
    let i = 0;
    for (let k = 1; k < lefts.length; k++) if (Math.abs(lefts[k] - xl) < Math.abs(lefts[i] - xl)) i = k;
    return i;
  };
  const colBound = (i) => ({
    left: i === 0 ? Math.max(0, Math.round(lefts[0] - 22)) : Math.round(lefts[i] - 14),
    right: i === lefts.length - 1 ? meta.width - 8 : Math.round(lefts[i + 1] - 10),
  });

  const byCol = new Map();
  for (const a of anchors) {
    const i = colIndex(a.xMin * sx);
    if (!byCol.has(i)) byCol.set(i, []);
    byCol.get(i).push(a);
  }

  const data2 = await sharp(pageImg).raw().toBuffer({ resolveWithObject: true });
  const W = data2.info.width;
  const isInk = (i) => {
    const r = data2.data[i], g = data2.data[i + 1], b = data2.data[i + 2];
    if (r < 120 && g > 55 && g < 160 && b - r > 40) return false;
    return (r + g + b) / 3 < 170;
  };
  const hoodHeaders = detectHeaders(data2.data, data2.info);

  for (const [, list] of byCol) {
    list.sort((a, b) => a.yMin - b.yMin);
    const cells = [];
    let cur = null;
    for (const a of list) {
      if (cur && a.yMin - cur.yMax < 40) { cur.codes.push(a.code); cur.yMin = Math.min(cur.yMin, a.yMin); cur.yMax = Math.max(cur.yMax, a.yMax); cur.cx = (cur.cx + (a.xMin + a.xMax) / 2) / 2; }
      else { cur = { codes: [a.code], yMin: a.yMin, yMax: a.yMax, cx: (a.xMin + a.xMax) / 2 }; cells.push(cur); }
    }
    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      const cb = colBound(colIndex(cell.cx * sx));
      let topPx = c === 0 ? Math.round(78 * sy) : Math.round(cells[c - 1].yMax * sy) + 24;
      const cellTopPx = Math.round(cell.yMin * sy);
      // clamp below any blue sub-banner ("ANGLED"/"STEP") sitting above this cell
      for (const h of hoodHeaders) if (h.y1 < cellTopPx && h.y1 > topPx) topPx = h.y1 + 6;
      const botPx = Math.min(Math.round(cell.yMax * sy) + 16, data2.info.height);
      if (botPx - topPx < 60) continue;
      // trim leading whitespace / sub-banner: advance top to first ink row
      for (let y = topPx; y < botPx; y++) {
        let ink = 0;
        for (let x = cb.left + 2; x < cb.right - 2; x++) if (isInk((y * W + x) * data2.info.channels)) ink++;
        if (ink > 3) { topPx = Math.max(topPx, y - 10); break; }
      }
      // content-trim left/right within the column
      let x0 = cb.right, x1 = cb.left;
      for (let x = cb.left + 2; x < cb.right - 2; x++) {
        let ink = 0;
        for (let y = topPx; y < botPx; y++) if (isInk((y * W + x) * data2.info.channels)) ink++;
        if (ink > 3) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
      }
      x0 = Math.max(cb.left, x0 - 12); x1 = Math.min(cb.right, x1 + 12);
      if (x1 - x0 < 60) continue;
      await emitCrop(pageImg, data2.info, { page: pageNo, left: x0, top: topPx, width: x1 - x0, height: botPx - topPx }, cell.codes);
    }
  }
}

try {
  for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
  fs.rmdirSync(tmpDir);
} catch {}

// Stable, sorted mapping.
const sortedMap = Object.fromEntries(Object.keys(mapping).sort().map((k) => [k, mapping[k]]));
fs.writeFileSync(MAP_OUT, JSON.stringify(sortedMap, null, 2) + "\n");

const mappedCodes = new Set(Object.keys(mapping));
const unmapped = catalog.cabinets.map((c) => c.code).filter((c) => !mappedCodes.has(c));

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
const md = `# Cabinet rendering extraction

Generated: ${new Date().toISOString()}
Source: ${path.relative(ROOT, PDF)} pages ${P_FROM}-${P_TO} @ ${DPI} DPI

| Metric | Count |
|--------|------:|
| Family renderings written | ${families.length} |
| Cabinet codes mapped to a rendering | ${mappedCodes.size} |
| Cabinet codes NOT mapped (fallback to SVG diagram) | ${unmapped.length} |

## Families (page, image -> codes)

${families
  .map((f) => `- p${f.page} \`${f.name}.webp\` -> ${f.codes.join(", ")}`)
  .join("\n")}

## Unmapped cabinet codes (${unmapped.length})

${unmapped.length ? unmapped.map((c) => `- \`${c}\``).join("\n") : "_None_"}
`;
fs.writeFileSync(REPORT, md);

console.log(
  `cabinet-renderings: families=${families.length} mapped=${mappedCodes.size}/${catalog.cabinets.length} unmapped=${unmapped.length}`,
);
console.log(`Wrote ${path.relative(ROOT, MAP_OUT)} and ${path.relative(ROOT, REPORT)}`);
