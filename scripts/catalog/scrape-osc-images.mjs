#!/usr/bin/env node
/**
 * Scrape the supplier finish swatch photos from onesourcecabinets.com and write
 * them as WebP tiles, preferred over the PDF crops (per the parity plan). Each
 * gallery <img> carries alt="<Finish Name> Cabinet Finish", giving a reliable
 * name->image mapping; the full-resolution upload is used (size suffix stripped).
 *
 *   node scripts/catalog/scrape-osc-images.mjs
 *
 * Network access required. Output: public/images/catalog/finishes/{cat}-{slug}.webp
 * Report: docs/catalog-audit/web-image-scrape.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");
const OUT_DIR = path.join(ROOT, "public/images/catalog/finishes");
const REPORT = path.join(ROOT, "docs/catalog-audit/web-image-scrape.md");

const PAGES = [
  { category: "woodgrain", url: "https://onesourcecabinets.com/woodgrain-texture/" },
  { category: "gloss", url: "https://onesourcecabinets.com/gloss-cabinets/" },
  { category: "matte", url: "https://onesourcecabinets.com/matte-colors/" },
];

// MUST match codegen-catalog.mjs slugify EXACTLY (no accent folding) so emitted
// filenames are the ones codegen resolves. norm() handles accent-insensitive
// name matching separately.
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

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const finishByCatName = new Map();
for (const f of catalog.finishes) {
  const cat = f.category.toLowerCase();
  finishByCatName.set(`${cat}|${norm(f.name)}`, {
    name: f.name,
    baseSlug: slugify(`${cat}-${f.name}`),
  });
}

const UA = { "User-Agent": "Mozilla/5.0 (compatible; catalog-parity/1.0)" };

function fullResUrl(u) {
  // Strip WordPress size suffix: foo-300x300.png -> foo.png
  return u.replace(/-\d+x\d+(?=\.[a-zA-Z]+(?:\?|$))/, "");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const written = [];
  const unmatched = [];
  const failed = [];

  for (const { category, url } of PAGES) {
    let htmlRaw;
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      htmlRaw = await res.text();
    } catch (e) {
      console.warn(`fetch failed ${url}: ${e.message}`);
      failed.push(`${category} page: ${e.message}`);
      continue;
    }
    const decode = (s) =>
      s
        .replace(/&amp;/g, "&")
        .replace(/&#0?39;/g, "'")
        .replace(/&#8217;/g, "\u2019")
        .replace(/&[a-z]+;/gi, " ");

    // Each gallery image: <img ... alt="Name Cabinet Finish" ...> with src/srcset.
    const imgTags = htmlRaw.match(/<img\b[^>]*>/gi) || [];
    const seen = new Set();
    for (const tag of imgTags) {
      const altM = tag.match(/alt="([^"]*?)\s+Cabinet Finish"/i);
      if (!altM) continue;
      const name = decode(altM[1]).trim();
      // The site sometimes prefixes the category onto the name for SEO
      // ("Gloss Tan" vs catalog "Tan"); strip a leading category word.
      const stripped = name.replace(new RegExp(`^${category}\\s+`, "i"), "");
      const hit =
        finishByCatName.get(`${category}|${norm(name)}`) ||
        finishByCatName.get(`${category}|${norm(stripped)}`);
      if (!hit) {
        unmatched.push(`${category}: ${name}`);
        continue;
      }
      if (seen.has(hit.baseSlug)) continue;
      seen.add(hit.baseSlug);

      // Best image URL: prefer the largest in srcset, else src.
      let imgUrl = null;
      const srcset = tag.match(/srcset="([^"]+)"/i);
      if (srcset) {
        const candidates = srcset[1]
          .split(",")
          .map((c) => c.trim().split(/\s+/)[0])
          .filter(Boolean);
        imgUrl = candidates.map(fullResUrl).find(Boolean) || candidates[0];
      }
      if (!imgUrl) {
        const src = tag.match(/\bsrc="([^"]+)"/i);
        if (src) imgUrl = fullResUrl(src[1]);
      }
      if (!imgUrl || !/^https?:/.test(imgUrl)) continue;

      try {
        const ir = await fetch(imgUrl, { headers: UA });
        if (!ir.ok) throw new Error(`HTTP ${ir.status}`);
        const buf = Buffer.from(await ir.arrayBuffer());
        // The site bakes the finish name into a label band across the bottom
        // ~20% of each tile; crop it off so we store a clean swatch.
        const meta = await sharp(buf).metadata();
        const cropH = Math.round((meta.height || 500) * 0.8);
        await sharp(buf)
          .extract({ left: 0, top: 0, width: meta.width || 500, height: cropH })
          .resize(480, 480, { fit: "cover" })
          .webp({ quality: 88 })
          .toFile(path.join(OUT_DIR, `${hit.baseSlug}.webp`));
        written.push({ category, name, baseSlug: hit.baseSlug, src: imgUrl });
      } catch (e) {
        failed.push(`${category} ${name}: ${e.message}`);
      }
    }
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  const byCat = written.reduce((a, w) => ((a[w.category] = (a[w.category] || 0) + 1), a), {});
  const md = `# Website swatch scrape (onesourcecabinets.com)

Generated: ${new Date().toISOString()}

| Metric | Count |
|--------|------:|
| Swatches written (preferred over PDF) | ${written.length} |
| Gallery images with no catalog match | ${unmatched.length} |
| Download/encode failures | ${failed.length} |

## Written by category

${Object.entries(byCat).map(([k, v]) => `- ${k}: ${v}`).join("\n") || "_None_"}

## Written

${written.map((w) => `- ${w.category}: ${w.name} -> ${w.baseSlug}.webp (${w.src})`).join("\n") || "_None_"}

## Unmatched gallery labels

${unmatched.length ? [...new Set(unmatched)].join("\n") : "_None_"}

## Failures

${failed.length ? failed.join("\n") : "_None_"}
`;
  fs.writeFileSync(REPORT, md);
  console.log(
    `web-scrape: written=${written.length} unmatched=${unmatched.length} failed=${failed.length}`,
  );
  console.log(`Wrote ${path.relative(ROOT, REPORT)}`);
}

main();
