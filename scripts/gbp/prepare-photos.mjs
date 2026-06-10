/**
 * Prepares SEO-named GBP upload assets in public/gbp-upload/.
 * Run: node scripts/gbp/prepare-photos.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const publicDir = path.join(root, "public");
const outDir = path.join(publicDir, "gbp-upload");

const DOOR_SLUGS = [
  "slab",
  "three-piece",
  "modern-shaker",
  "thin-shaker",
  "alpha-shaker",
  "beta-shaker",
];

const ROOM_SLUGS = [
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
  "closet",
  "garage",
  "outdoor",
  "wet-bar",
  "bedroom",
];

const FINISH_SAMPLES = [
  { slug: "snowcap", category: "matte" },
  { slug: "porcelain", category: "gloss" },
  { slug: "white-oak", category: "woodgrain" },
  { slug: "graphite", category: "gloss" },
  { slug: "natural-walnut", category: "woodgrain" },
  { slug: "obsidian", category: "gloss" },
  { slug: "sagebrush", category: "matte" },
  { slug: "driftwood", category: "woodgrain" },
];

const GALLERY_AFTER = [
  { src: "gallery-kitchen-after.webp", dest: "custom-kitchen-cabinets-boise-idaho-after.webp" },
  { src: "gallery-bathroom-after.webp", dest: "bathroom-vanity-cabinets-meridian-idaho-after.webp" },
  { src: "gallery-whole-home-after.webp", dest: "whole-home-cabinetry-eagle-idaho-after.webp" },
  { src: "gallery-outdoor-after.webp", dest: "outdoor-kitchen-cabinets-treasure-valley-idaho-after.webp" },
];

const WORK_TEAM = [
  { src: "images/marketing/hero-construction.webp", dest: "cabinet-installation-treasure-valley-idaho.webp" },
  { src: "images/marketing/hero-about.webp", dest: "custom-cabinet-team-boise-idaho.webp" },
  { src: "images/marketing/process-about.webp", dest: "cabinet-design-process-boise-idaho.webp" },
];

function copy(srcRel, destName) {
  const src = path.join(publicDir, srcRel);
  const dest = path.join(outDir, destName);
  if (!fs.existsSync(src)) {
    console.warn(`  SKIP missing: ${srcRel}`);
    return false;
  }
  fs.copyFileSync(src, dest);
  console.log(`  ${destName}`);
  return true;
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  console.log("Logo & cover:");
  if (copy("icon-512.png", "logo-boise-cabinet-co-idaho.png")) count++;
  if (copy("images/marketing/og-default.webp", "cover-custom-kitchen-cabinets-treasure-valley-idaho.webp")) count++;

  console.log("Door style products:");
  for (const slug of DOOR_SLUGS) {
    if (copy(`images/catalog/door-styles/${slug}.webp`, `product-${slug}-cabinet-doors-boise-idaho.webp`)) count++;
  }

  console.log("Room category photos:");
  for (const slug of ROOM_SLUGS) {
    if (copy(`images/catalog/rooms/${slug}.webp`, `${slug}-cabinets-treasure-valley-idaho.webp`)) count++;
  }

  console.log("Finish swatches:");
  for (const { slug, category } of FINISH_SAMPLES) {
    if (copy(`images/catalog/finishes/${slug}.webp`, `cabinet-finish-${category}-${slug}-boise-idaho.webp`)) count++;
  }

  console.log("Gallery project photos:");
  for (const { src, dest } of GALLERY_AFTER) {
    if (copy(`images/gallery/${src}`, dest)) count++;
  }

  console.log("Team & at-work:");
  for (const { src, dest } of WORK_TEAM) {
    if (copy(src, dest)) count++;
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    outputDir: "public/gbp-upload",
    fileCount: count,
    minimumRequired: 20,
    ready: count >= 20,
    note: "Upload all files from public/gbp-upload/ to GBP as owner photos. Add your own install photos with city names in filenames.",
  };

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone: ${count} files in public/gbp-upload/ (minimum 20: ${manifest.ready ? "PASS" : "NEEDS MORE PROJECT PHOTOS"})`);
}

main();
