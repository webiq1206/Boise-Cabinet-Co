#!/usr/bin/env node
/**
 * Hand-crop the 3 finish swatches the grid extractor couldn't auto-map, so all
 * 299 finishes have a real supplier swatch:
 *   - Rialto / Hemlock  -> p51 col 3 (supplier prints one shared "RIALTO HEMLOCK" swatch)
 *   - Nizza Riva        -> p66 "NIZZA" swatch (supplier splits Nizza & Riva; catalog merges them)
 *
 *   node scripts/catalog/extract-missing-swatches.mjs
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
const OUT_DIR = path.join(ROOT, "public/images/catalog/finishes");
const DPI = 300;

// Each target gives a search window (PDF points) that contains exactly one swatch.
const TARGETS = [
  { slugs: ["woodgrain-rialto", "woodgrain-hemlock"], page: 51, win: { x0: 405, x1: 575, y0: 30, y1: 193 } },
  { slugs: ["woodgrain-nizza-riva"], page: 66, win: { x0: 212, x1: 382, y0: 270, y1: 425 } },
];

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "osc-swatch-"));

for (const { slugs, page, win } of TARGETS) {
  const xml = execSync(`pdftotext -bbox-layout -f ${page} -l ${page} ${JSON.stringify(PDF)} -`, { encoding: "utf8" });
  const dim = xml.match(/width="([\d.]+)" height="([\d.]+)"/);
  const pw = +dim[1], ph = +dim[2];

  const base = path.join(tmpDir, `p${page}`);
  execSync(`pdftoppm -png -r ${DPI} -f ${page} -l ${page} ${JSON.stringify(PDF)} ${JSON.stringify(base)}`, { stdio: "pipe" });
  const rendered = fs.readdirSync(tmpDir).find((f) => f === `p${page}.png` || f.startsWith(`p${page}-`));
  const pageImg = path.join(tmpDir, rendered);
  const { data, info } = await sharp(pageImg).raw().toBuffer({ resolveWithObject: true });
  const sx = info.width / pw, sy = info.height / ph;

  const wx0 = Math.round(win.x0 * sx), wx1 = Math.round(win.x1 * sx);
  const wy0 = Math.round(win.y0 * sy), wy1 = Math.round(win.y1 * sy);
  const colored = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return (r + g + b) / 3 < 244; // non-white swatch fill
  };
  // tight bbox of the swatch within the window
  let x0 = wx1, x1 = wx0, y0 = wy1, y1 = wy0;
  for (let y = wy0; y < wy1; y++) {
    for (let x = wx0; x < wx1; x++) {
      if (colored((y * info.width + x) * info.channels)) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  // inset a few px to drop any border line / antialiasing
  const inset = 6;
  x0 += inset; y0 += inset; x1 -= inset; y1 -= inset;
  const w = x1 - x0, h = y1 - y0;
  if (w < 60 || h < 60) { console.warn(`bad swatch crop for ${slugs.join("/")}`); continue; }
  const buf = await sharp(pageImg).extract({ left: x0, top: y0, width: w, height: h }).toBuffer();
  for (const slug of slugs) {
    for (const [suffix, size] of [["", 640], ["-640", 640], ["-320", 320], ["-160", 160]]) {
      await sharp(buf).resize(size, size, { fit: "cover" }).webp({ quality: 90 }).toFile(path.join(OUT_DIR, `${slug}${suffix}.webp`));
    }
    console.log(`wrote ${slug}.webp (+variants) from p${page}`);
  }
}

for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
fs.rmdirSync(tmpDir);
