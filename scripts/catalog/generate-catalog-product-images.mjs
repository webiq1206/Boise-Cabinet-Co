#!/usr/bin/env node
/**
 * Generate product hero, thumb, and diagram WebPs for all cabinetProducts.json entries.
 * Usage: node scripts/catalog/generate-catalog-product-images.mjs [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { productDiagramSvg } from "./product-diagram-svg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PRODUCTS_JSON = path.join(ROOT, "data/supplier-catalog/cabinetProducts.json");
const OUT_DIR = path.join(ROOT, "public/images/catalog/products");
const force = process.argv.includes("--force");

async function svgToWebp(svg, dest, w, h) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(w, h, { fit: "contain", background: { r: 243, g: 236, b: 223, alpha: 1 } })
    .webp({ quality: 84 })
    .toFile(dest);
}

async function main() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = product.slug;
    const hero = path.join(OUT_DIR, `${slug}.webp`);
    const thumb = path.join(OUT_DIR, `${slug}-thumb.webp`);
    const diagram = path.join(OUT_DIR, `${slug}-diagram.webp`);

    if (!force && fs.existsSync(hero) && fs.existsSync(thumb) && fs.existsSync(diagram)) {
      skipped++;
      continue;
    }

    const svgHero = productDiagramSvg(product, { showLabel: true });
    const svgDiagram = productDiagramSvg(product, { showLabel: false });

    await svgToWebp(svgHero, hero, 800, 600);
    await svgToWebp(svgDiagram, diagram, 640, 480);
    await svgToWebp(svgDiagram, thumb, 320, 240);
    created++;
  }

  console.log(
    `Product images: created/updated ${created}, skipped ${skipped}, total ${products.length} → ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
