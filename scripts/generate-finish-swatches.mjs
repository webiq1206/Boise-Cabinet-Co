/**
 * Generates finish swatch WebP textures from catalog hex colors.
 * Run: node scripts/generate-finish-swatches.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const FINISHES = JSON.parse(
  fs.readFileSync(path.join(root, "scripts", "site-image-manifest.json"), "utf8"),
).entries.filter((e) => e.placement === "swatch");

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// Load hex from finishes.ts via simple parse
const finishesTs = fs.readFileSync(path.join(root, "shared/catalog/finishes.ts"), "utf8");
const hexBySlug = {};
for (const m of finishesTs.matchAll(/slug: "([^"]+)"[\s\S]*?hexColor: "(#[0-9A-Fa-f]+)"/g)) {
  hexBySlug[m[1]] = m[2];
}

async function generateSwatch(slug, hex, category) {
  const size = 400;
  const { r, g, b } = hexToRgb(hex);
  const svg =
    category === "woodgrain"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="rgb(${Math.min(r + 20, 255)},${Math.min(g + 15, 255)},${Math.min(b + 10, 255)})"/>
              <stop offset="50%" stop-color="rgb(${r},${g},${b})"/>
              <stop offset="100%" stop-color="rgb(${Math.max(r - 25, 0)},${Math.max(g - 20, 0)},${Math.max(b - 15, 0)})"/>
            </linearGradient>
            <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/></filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <rect width="100%" height="100%" filter="url(#n)" opacity="0.08"/>
        </svg>`
      : category === "gloss"
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgb(${Math.min(r + 40, 255)},${Math.min(g + 40, 255)},${Math.min(b + 40, 255)})"/>
                <stop offset="100%" stop-color="rgb(${r},${g},${b})"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
            <rect width="100%" height="100%" fill="rgb(${r},${g},${b})"/>
          </svg>`;

  const dest = path.join(root, "public", "images", "catalog", "finishes", `${slug}.webp`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(dest);
}

async function main() {
  for (const entry of FINISHES) {
    const slug = entry.finishId;
    const hex = hexBySlug[slug] ?? "#E8E4DE";
    const category = slug.includes("oak") || slug.includes("walnut") ? "woodgrain" : entry.finishId?.startsWith("gloss") ? "gloss" : "matte";
    await generateSwatch(slug, hex, category);
    console.log(`Swatch: ${slug}`);
  }
  console.log(`Generated ${FINISHES.length} finish swatches.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
