#!/usr/bin/env node
/**
 * Extract the supplier's 6 door-profile renderings (the dark door-panel diagrams)
 * from the catalog PDF (p8-9) into the door-style image slots.
 *
 *   node scripts/catalog/extract-door-renderings.mjs
 *
 * Each door page is 3 columns; every column shows a small drawer-front panel and a
 * large door-front panel above the style name. We crop the large door panel (the
 * representative door rendering) for each style.
 *
 * Output: public/images/catalog/door-styles/{slug}.webp (+ -320/-640 variants)
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
const OUT_DIR = path.join(ROOT, "public/images/catalog/door-styles");
const DPI = 220;

const PAGES = [
  { page: 8, styles: [["SLAB", "slab"], ["3 PIECE", "three-piece"], ["MODERN SHAKER", "modern-shaker"]] },
  { page: 9, styles: [["THIN SHAKER", "thin-shaker"], ["ALPHA SHAKER", "alpha-shaker"], ["BETA SHAKER", "beta-shaker"]] },
];

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "osc-door-"));
const written = [];

for (const { page, styles } of PAGES) {
  // Style-name x positions anchor the 3 columns.
  const xml = execSync(`pdftotext -bbox-layout -f ${page} -l ${page} ${JSON.stringify(PDF)} -`, { encoding: "utf8" });
  const m = xml.match(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/);
  const width = +m[1];
  const nameX = {};
  let nameY = 0;
  for (const lm of m[3].matchAll(/<line xMin="([\d.]+)" yMin="([\d.]+)"[^>]*>([\s\S]*?)<\/line>/g)) {
    const t = [...lm[3].matchAll(/<word[^>]*>([\s\S]*?)<\/word>/g)].map((w) => w[1]).join(" ");
    const hit = styles.find(([label]) => label === t);
    if (hit) { nameX[hit[1]] = +lm[1]; nameY = +lm[2]; }
  }

  const base = path.join(tmpDir, `p${page}`);
  execSync(`pdftoppm -png -r ${DPI} -f ${page} -l ${page} ${JSON.stringify(PDF)} ${JSON.stringify(base)}`, { stdio: "pipe" });
  const rendered = fs.readdirSync(tmpDir).find((f) => f === `p${page}.png` || f.startsWith(`p${page}-`));
  const pageImg = path.join(tmpDir, rendered);
  const { data, info } = await sharp(pageImg).raw().toBuffer({ resolveWithObject: true });
  const sx = info.width / width;
  const isDark = (i) => (data[i] + data[i + 1] + data[i + 2]) / 3 < 110;

  const topPx = Math.round(70 * (info.height / +m[2]));
  const namePx = Math.round((nameY - 14) * (info.height / +m[2]));

  // Detect the door panels as vertical dark bands (white gutters separate styles).
  const colDark = new Array(info.width).fill(0);
  for (let x = 0; x < info.width; x++) {
    let n = 0;
    for (let y = topPx; y < namePx; y++) if (isDark((y * info.width + x) * info.channels)) n++;
    colDark[x] = n;
  }
  const thresh = (namePx - topPx) * 0.18;
  const xbands = [];
  let cur = null;
  let blank = 0;
  for (let x = 0; x < info.width; x++) {
    if (colDark[x] > thresh) {
      if (!cur) { cur = { x0: x, x1: x }; xbands.push(cur); }
      else { cur.x1 = x; }
      blank = 0;
    } else if (cur && ++blank > 24) cur = null; // bridge thin internal panel lines
  }
  const panels = xbands.filter((b) => b.x1 - b.x0 > 60);

  for (const band of panels) {
    // which style name sits under this panel
    const slug = styles
      .map(([, s]) => s)
      .find((s) => nameX[s] * sx >= band.x0 - 40 * sx && nameX[s] * sx <= band.x1 + 40 * sx);
    if (!slug) continue;
    // largest dark row-band within this x-band = the door (vs the small drawer panel)
    const rowDark = [];
    for (let y = topPx; y < namePx; y++) {
      let n = 0;
      for (let x = band.x0; x < band.x1; x++) if (isDark((y * info.width + x) * info.channels)) n++;
      rowDark[y] = n > (band.x1 - band.x0) * 0.25;
    }
    const bands = [];
    let c2 = null;
    for (let y = topPx; y < namePx; y++) {
      if (rowDark[y]) { if (!c2) { c2 = { y0: y, y1: y }; bands.push(c2); } else c2.y1 = y; }
      else c2 = null;
    }
    const door = bands.sort((a, b) => b.y1 - b.y0 - (a.y1 - a.y0))[0];
    if (!door) { console.warn(`no door panel for ${slug}`); continue; }
    const pad = 12;
    const left = Math.max(0, band.x0 - pad);
    const top = Math.max(0, door.y0 - pad);
    const w = Math.min(band.x1 - band.x0 + pad * 2, info.width - left);
    const h = Math.min(door.y1 - door.y0 + pad * 2, info.height - top);
    if (w < 60 || h < 60) { console.warn(`bad crop ${slug}`); continue; }
    const region = sharp(pageImg).extract({ left, top, width: w, height: h });
    const buf = await region.toBuffer();
    await sharp(buf).resize(640, null, { withoutEnlargement: true }).webp({ quality: 92 }).toFile(path.join(OUT_DIR, `${slug}.webp`));
    await sharp(buf).resize(640, null, { withoutEnlargement: true }).webp({ quality: 92 }).toFile(path.join(OUT_DIR, `${slug}-640.webp`));
    await sharp(buf).resize(320, null, { withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(OUT_DIR, `${slug}-320.webp`));
    written.push(slug);
  }
}

for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
fs.rmdirSync(tmpDir);
console.log(`door renderings written: ${written.join(", ")}`);
