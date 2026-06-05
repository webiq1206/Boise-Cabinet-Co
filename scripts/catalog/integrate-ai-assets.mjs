/**
 * Integrates AI-generated source art (rooms, door styles, wood-grain base
 * textures) into the catalog image folders at consistent sizes/aspect ratios.
 *
 * Source art lives in the Cursor assets dir (one-time generation); this script
 * is the reproducible "import + normalize" step. Wood textures are saved under
 * scripts/catalog/textures and consumed by generate-finish-swatches.mjs.
 *
 * Run: node scripts/catalog/integrate-ai-assets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const SRC =
  "/Users/jaredbrost/.cursor/projects/Users-jaredbrost-Desktop-Boise-Cabinet-Co/assets";
const pub = path.join(root, "public");

// Soft seamless studio gray that matches the generated door backgrounds, so the
// contain-padding is invisible.
const STUDIO_BG = { r: 219, g: 219, b: 217 };

const ROOMS = {
  "sample-room-kitchen.webp": "kitchen",
  "sample-room-bathroom.webp": "bathroom",
  "room-laundry.webp": "laundry",
  "room-mudroom.webp": "mudroom",
  "room-home-office.webp": "home-office",
  "room-entertainment.webp": "entertainment",
  "room-built-ins.webp": "built-ins",
  "room-pantry.webp": "pantry",
  "room-closet.webp": "closet",
  "room-garage.webp": "garage",
  "room-outdoor.webp": "outdoor",
  "room-wet-bar.webp": "wet-bar",
  "room-bedroom.webp": "bedroom",
};

const DOORS = {
  "door-slab.webp": "slab",
  "door-modern-shaker.webp": "modern-shaker",
  "door-thin-shaker.webp": "thin-shaker",
  "door-alpha-shaker.webp": "alpha-shaker",
  "door-beta-shaker.webp": "beta-shaker",
  "door-three-piece.webp": "three-piece",
};

const WOODS = {
  "wood-blonde.webp": "blonde",
  "wood-natural.webp": "natural",
  "sample-finish-woodgrain-oak.webp": "honey",
  "wood-walnut.webp": "walnut",
  "wood-espresso.webp": "espresso",
  "wood-grey.webp": "grey",
  "wood-charcoal.webp": "charcoal",
};

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Source asset dir not found: ${SRC}`);
    process.exit(1);
  }

  const roomsDir = path.join(pub, "images/catalog/rooms");
  const doorsDir = path.join(pub, "images/catalog/door-styles");
  const texDir = path.join(__dirname, "textures");
  ensure(roomsDir);
  ensure(doorsDir);
  ensure(texDir);

  let n = 0;

  // Rooms: 3:2 landscape, cover crop, plus refreshed responsive variants so the
  // base and -640/-1080 widths all come from the same AI source.
  for (const [src, slug] of Object.entries(ROOMS)) {
    const s = path.join(SRC, src);
    if (!fs.existsSync(s)) {
      console.warn(`  missing room source: ${src}`);
      continue;
    }
    const crop = (w, h) =>
      sharp(s).resize(w, h, { fit: "cover", position: "centre" });
    await crop(1600, 1067).webp({ quality: 82 }).toFile(path.join(roomsDir, `${slug}.webp`));
    await crop(640, 427).webp({ quality: 80 }).toFile(path.join(roomsDir, `${slug}-640.webp`));
    await crop(1080, 720).webp({ quality: 82 }).toFile(path.join(roomsDir, `${slug}-1080.webp`));
    n++;
  }

  // Doors: padded to a consistent square on studio gray so the whole door is
  // always visible (works for both the 4:3 hero crop and square tiles).
  for (const [src, slug] of Object.entries(DOORS)) {
    const s = path.join(SRC, src);
    if (!fs.existsSync(s)) {
      console.warn(`  missing door source: ${src}`);
      continue;
    }
    const pad = (px) =>
      sharp(s)
        .resize(px, px, { fit: "contain", background: STUDIO_BG })
        .flatten({ background: STUDIO_BG });
    await pad(1100).webp({ quality: 86 }).toFile(path.join(doorsDir, `${slug}.webp`));
    await pad(640).webp({ quality: 84 }).toFile(path.join(doorsDir, `${slug}-640.webp`));
    await pad(1080).webp({ quality: 86 }).toFile(path.join(doorsDir, `${slug}-1080.webp`));
    n++;
  }

  // Wood-grain base textures: square, consumed at build time by the finish
  // swatch generator (not served).
  for (const [src, tone] of Object.entries(WOODS)) {
    const s = path.join(SRC, src);
    if (!fs.existsSync(s)) {
      console.warn(`  missing wood source: ${src}`);
      continue;
    }
    await sharp(s)
      .resize(640, 640, { fit: "cover", position: "centre" })
      .webp({ quality: 88 })
      .toFile(path.join(texDir, `${tone}.webp`));
    n++;
  }

  console.log(`Integrated ${n} AI assets (rooms, doors, wood textures).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
