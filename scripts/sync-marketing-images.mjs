/**
 * Syncs legacy PNG assets to new marketing/catalog paths and generates WebP variants.
 * Run: node scripts/sync-marketing-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const COPIES = [
  ["images/hero-remodel-interior.png", "images/marketing/hero-home.webp"],
  ["images/gallery/gallery-kitchen-after.png", "images/marketing/hero-about.webp"],
  ["images/city-service/bathroom-remodel__meridian.png", "images/marketing/hero-contact.webp"],
  ["images/process-design-review.png", "images/marketing/hero-design-studio.webp"],
  ["images/process-design-review.png", "images/marketing/process-design-review.webp"],
  ["images/gallery/gallery-whole-home-after.png", "images/marketing/statement-whole-home.webp"],
  ["images/hero-remodel-interior.png", "images/marketing/og-default.webp"],
];

const GALLERY = [
  "kitchen", "bathroom", "whole-home", "addition", "basement", "outdoor",
];

async function toWebp(srcRel, destRel, width = 1920) {
  const src = path.join(publicDir, srcRel);
  const dest = path.join(publicDir, destRel);
  if (!fs.existsSync(src)) {
    console.warn(`Skip missing: ${srcRel}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);
  console.log(`  ${destRel}`);
}

async function main() {
  console.log("Marketing images:");
  for (const [src, dest] of COPIES) {
    await toWebp(src, dest);
  }

  console.log("Gallery images:");
  for (const g of GALLERY) {
    for (const phase of ["before", "after"]) {
      await toWebp(
        `images/gallery/gallery-${g}-${phase}.png`,
        `images/gallery/gallery-${g}-${phase}.webp`,
      );
    }
  }

  console.log("Area images:");
  const areas = fs.readdirSync(path.join(publicDir, "images/areas")).filter((f) => f.endsWith(".png"));
  for (const f of areas) {
    await toWebp(`images/areas/${f}`, `images/areas/${f.replace(".png", ".webp")}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
