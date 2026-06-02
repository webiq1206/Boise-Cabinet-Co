/**
 * Seeds catalog room/collection PNG+WebP from existing marketing photography
 * until AI generation completes. Maps rooms to best-matching legacy assets.
 * Run: node scripts/seed-catalog-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const ROOM_SOURCES = {
  kitchen: "images/city-service/kitchen-remodel__boise.png",
  bathroom: "images/city-service/bathroom-remodel__meridian.png",
  laundry: "images/city-service/whole-home-remodel__nampa.png",
  mudroom: "images/city-service/whole-home-remodel__star.png",
  "home-office": "images/gallery/gallery-whole-home-after.png",
  entertainment: "images/gallery/gallery-basement-after.png",
  "built-ins": "images/gallery/gallery-addition-after.png",
  pantry: "images/city-service/kitchen-remodel__eagle.png",
  closet: "images/city-service/whole-home-remodel__meridian.png",
  garage: "images/services/whole-home-remodel.png",
  outdoor: "images/gallery/gallery-outdoor-after.png",
  "wet-bar": "images/gallery/gallery-basement-after.png",
  bedroom: "images/city-service/bathroom-remodel__boise.png",
};

const COLLECTION_SOURCES = {
  "full-custom": "images/gallery/gallery-kitchen-after.png",
  "semi-custom": "images/city-service/kitchen-remodel__boise.png",
  reserve: "images/city-service/kitchen-remodel__eagle.png",
  "spec-grade": "images/services/kitchen-remodel.png",
};

async function copyAsWebp(srcRel, destRel) {
  const src = path.join(publicDir, srcRel);
  if (!fs.existsSync(src)) {
    console.warn(`Missing source: ${srcRel}`);
    return;
  }
  const pngDest = path.join(publicDir, destRel.replace(".webp", ".png"));
  const webpDest = path.join(publicDir, destRel);
  fs.mkdirSync(path.dirname(pngDest), { recursive: true });
  fs.copyFileSync(src, pngDest);
  await sharp(src).resize(1200).webp({ quality: 82 }).toFile(webpDest);
  console.log(`  ${destRel}`);
}

async function main() {
  console.log("Room heroes:");
  for (const [room, src] of Object.entries(ROOM_SOURCES)) {
    await copyAsWebp(src, `images/catalog/rooms/${room}.webp`);
  }
  console.log("Collection heroes:");
  for (const [col, src] of Object.entries(COLLECTION_SOURCES)) {
    await copyAsWebp(src, `images/catalog/collections/${col}.webp`);
  }
  console.log("Door style profiles (from process photo):");
  const doorStyles = ["slab", "modern-shaker", "thin-shaker", "three-piece", "alpha-shaker", "beta-shaker"];
  for (const d of doorStyles) {
    await copyAsWebp("images/marketing/process-design-review.webp", `images/catalog/door-styles/${d}.webp`);
  }

  console.log("Hardware product shots:");
  const hardwareFiles = [
    "bar-pull-128-black",
    "bar-pull-160-nickel",
    "cup-pull-gold",
    "finger-edge-pull",
    "j-channel-pull",
    "knob-round-nickel",
    "knob-square-black",
    "glass-knob-chrome",
    "hinge-soft-close",
    "push-to-open-hinge",
    "slide-soft-close",
    "slide-heavy-duty",
    "outdoor-bar-pull-stainless",
  ];
  const hardwareSources = [
    "images/marketing/process-design-review.webp",
    "images/marketing/hero-design-studio.webp",
    "images/gallery/gallery-kitchen-after.webp",
    "images/city-service/kitchen-remodel__boise.webp",
    "images/city-service/kitchen-remodel__eagle.webp",
  ];
  for (let i = 0; i < hardwareFiles.length; i++) {
    const src = hardwareSources[i % hardwareSources.length];
    await copyAsWebp(src, `images/catalog/hardware/${hardwareFiles[i]}.webp`);
  }

  console.log("Accessory product shots:");
  const accessorySlugs = [
    "pull-out-shelf",
    "pull-out-pantry",
    "lazy-susan",
    "blind-corner-pullout",
    "spice-rack-pullout",
    "utensil-divider",
    "peg-board-drawer",
    "trash-pullout",
    "cutting-board-insert",
    "mixer-lift",
    "tip-out-tray",
    "vertical-divider",
    "drawer-organizer-kit",
    "led-strip-channel",
    "pull-out-hamper",
    "wine-rack-insert",
    "appliance-garage",
  ];
  const accessorySources = [
    "images/gallery/gallery-kitchen-after.webp",
    "images/city-service/kitchen-remodel__boise.webp",
    "images/city-service/kitchen-remodel__meridian.webp",
    "images/marketing/statement-whole-home.webp",
  ];
  for (let i = 0; i < accessorySlugs.length; i++) {
    const src = accessorySources[i % accessorySources.length];
    await copyAsWebp(src, `images/catalog/accessories/${accessorySlugs[i]}.webp`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
