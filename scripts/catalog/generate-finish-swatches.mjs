#!/usr/bin/env node
/**
 * Generate raster finish swatches for every finish that does NOT already have a
 * real on-disk photo, so no finish falls back to a flat SVG tile.
 *
 * - woodgrain finishes  → composited from an AI wood-grain base texture chosen
 *   by name/colorFamily, with a subtle deterministic per-finish variation.
 * - matte / gloss        → the finish's family hex tinted tile with a realistic
 *   matte or lacquer sheen overlay.
 *
 * Output: public/generated/finishes/{slug}.webp  (slug matches the runtime
 * Finish.slug so codegen can bind it). Real photos under
 * public/images/catalog/finishes are never touched and always win.
 *
 * Run: node scripts/catalog/generate-finish-swatches.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, "data/catalog.json"), "utf8"));
const FINISH_IMG_DIR = path.join(ROOT, "public/images/catalog/finishes");
const OUT_DIR = path.join(ROOT, "public/generated/finishes");
const TEX_DIR = path.join(__dirname, "textures");
const SIZE = 800;

// Mirror codegen-catalog.mjs exactly so slugs/colors line up.
const FAMILY_HEX = {
  Green: "#2D4A3E",
  "Neutral / Beige": "#D8CFC0",
  Black: "#1A1A1A",
  Grey: "#8A8A8A",
  Blue: "#3A5A78",
  White: "#F2EFE9",
  Wood: "#9C6B43",
};
const FAMILY_HEX_DEFAULT = "#CFC7B8";

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function uniqueSlugger() {
  const seen = new Map();
  return (base) => {
    const b = base || "item";
    const n = (seen.get(b) || 0) + 1;
    seen.set(b, n);
    return n === 1 ? b : `${b}-${n}`;
  };
}
const finishImageExists = (file) => fs.existsSync(path.join(FINISH_IMG_DIR, file));

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Pick the closest AI wood texture for a woodgrain finish. */
function woodTone(name, family) {
  const n = name.toLowerCase();
  const has = (...k) => k.some((x) => n.includes(x));
  if (has("charcoal", "black", "carbon", "coal", "onyx", "obsidian", "anthracite", "noir", "notte", "ebony", "nero")) return "charcoal";
  if (has("espresso", "wenge", "mocha", "coffee", "chocolate", "dark", "scuro", "midnight", "noce", "bruno")) return "espresso";
  if (has("walnut", "pecan", "chestnut", "cherry", "kirsche", "cognac", "caramel", "teak", "cappuccino", "hazel", "toffee", "copper", "mogano", "mahogany", "rust")) return "walnut";
  if (has("grey", "gray", "grigio", "fog", "smoke", "ash", "cement", "cemento", "stone", "driftwood", "pewter", "graphite", "silver", "olmo", "cenere")) return "grey";
  if (has("white", "blanc", "bianco", "snow", "pearl", "alaska", "dover", "frost", "chalk", "arctic")) return "blonde";
  if (has("honey", "golden", "gold", "miele", "amber", "wheat", "rovere")) return "honey";
  if (has("natural", "oak", "sand", "sabbia", "beige", "light", "sahara", "almond", "linen", "cream", "avorio", "ivory")) return "natural";
  switch (family) {
    case "White": return "blonde";
    case "Black": return "charcoal";
    case "Grey": return "grey";
    case "Wood": return "honey";
    default: return "natural";
  }
}

function matteSheenSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity="0.10"/>
        <stop offset="0.5" stop-color="white" stop-opacity="0"/>
        <stop offset="1" stop-color="black" stop-opacity="0.10"/>
      </linearGradient></defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
    </svg>`,
  );
}
function glossSheenSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="white" stop-opacity="0.42"/>
          <stop offset="0.28" stop-color="white" stop-opacity="0.08"/>
          <stop offset="0.6" stop-color="white" stop-opacity="0"/>
          <stop offset="1" stop-color="black" stop-opacity="0.20"/>
        </linearGradient>
        <radialGradient id="hot" cx="0.32" cy="0.24" r="0.55">
          <stop offset="0" stop-color="white" stop-opacity="0.5"/>
          <stop offset="1" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
      <ellipse cx="${SIZE * 0.3}" cy="${SIZE * 0.25}" rx="${SIZE * 0.4}" ry="${SIZE * 0.22}" fill="url(#hot)"/>
    </svg>`,
  );
}
function satinSheenSvg() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0" stop-color="white" stop-opacity="0.14"/>
        <stop offset="0.45" stop-color="white" stop-opacity="0"/>
        <stop offset="1" stop-color="black" stop-opacity="0.08"/>
      </linearGradient></defs>
      <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
    </svg>`,
  );
}

/**
 * Derive a swatch color from the finish name for solid (matte/gloss) finishes.
 * The catalog only carries a coarse family hex (many finishes fall back to a
 * generic greige), so name keywords give a far more accurate tile color.
 */
function nameColor(name) {
  const n = name.toLowerCase();
  const has = (...k) => k.some((x) => n.includes(x));
  if (has("anthracite", "charcoal", "graphite", "carbon", "slate")) return "#34373B";
  if (has("black", "nero", "noir", "onyx", "obsidian", "coal", "ebony")) return "#1A1A1A";
  if (has("white", "bianco", "blanc", "snow", "pearl", "arctic", "alaska", "chalk", "frost")) return "#F2EFE9";
  if (has("green", "verde", "sage", "olive", "forest", "emerald", "mint")) return "#2D4A3E";
  if (has("blue", "blu", "navy", "azure", "teal", "cobalt", "indigo")) return "#3A5A78";
  if (has("burgundy", "wine", "crimson", "ruby")) return "#6E2A2E";
  if (has("red", "rosso")) return "#7B2D2D";
  if (has("mustard", "ochre", "yellow", "giallo")) return "#C9A227";
  if (has("mocha", "coffee", "chocolate", "espresso", "brown", "marrone")) return "#5A4332";
  if (has("blush", "pink", "rosa")) return "#D9B6AE";
  if (has("grey", "gray", "grigio", "fog", "smoke", "silver", "cement", "cemento", "stone", "ash", "pewter", "fumo")) return "#8A8A8A";
  if (has("beige", "sand", "sabbia", "cream", "avorio", "ivory", "linen", "almond", "taupe", "greige", "mushroom", "sahara")) return "#D8CFC0";
  return undefined;
}

async function buildSolid(hex, slug, gloss) {
  const { r, g, b } = hexToRgb(hex);
  const h = hashStr(slug);
  const brightness = 1 + (((h & 255) / 255 - 0.5) * 0.08);
  const base = sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: { r, g, b } },
  });
  return base
    .modulate({ brightness })
    .composite([{ input: gloss ? glossSheenSvg() : matteSheenSvg() }]);
}

async function buildWood(name, family, slug) {
  const tone = woodTone(name, family);
  const tex = path.join(TEX_DIR, `${tone}.webp`);
  if (!fs.existsSync(tex)) throw new Error(`Missing wood texture: ${tone}`);
  const h = hashStr(slug);
  const brightness = 1 + (((h & 255) / 255 - 0.5) * 0.1);
  const saturation = 1 + ((((h >> 8) & 255) / 255 - 0.5) * 0.12);
  const hue = Math.round((((h >> 16) & 255) / 255 - 0.5) * 8);
  return sharp(tex)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .modulate({ brightness, saturation, hue })
    .composite([{ input: satinSheenSvg() }]);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const finishSlug = uniqueSlugger();
  const stats = { real: 0, wood: 0, matte: 0, gloss: 0 };

  for (const f of CATALOG.finishes) {
    const cat = f.category.toLowerCase();
    const baseSlug = slugify(`${cat}-${f.name}`);
    const slug = finishSlug(baseSlug);

    // A real on-disk photo always wins; skip generating a tile for it.
    const hasReal = [
      `${baseSlug}.webp`,
      `${baseSlug}.png`,
      `${slugify(f.name)}.webp`,
      `${slugify(f.name)}.png`,
    ].some(finishImageExists);
    if (hasReal) {
      stats.real++;
      continue;
    }

    // Prefer a name-derived color (most accurate), then the family hex, then the
    // neutral default so a tile always renders.
    const hex = nameColor(f.name) ?? FAMILY_HEX[f.colorFamily] ?? FAMILY_HEX_DEFAULT;
    const dest = path.join(OUT_DIR, `${slug}.webp`);
    let pipe;
    if (cat === "woodgrain") {
      pipe = await buildWood(f.name, f.colorFamily, slug);
      stats.wood++;
    } else if (cat === "gloss") {
      pipe = await buildSolid(hex, slug, true);
      stats.gloss++;
    } else {
      pipe = await buildSolid(hex, slug, false);
      stats.matte++;
    }
    await pipe.webp({ quality: 88 }).toFile(dest);
  }

  console.log(
    `Finish swatches: ${stats.real} real (skipped), generated ${stats.wood} wood + ${stats.matte} matte + ${stats.gloss} gloss tiles.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
