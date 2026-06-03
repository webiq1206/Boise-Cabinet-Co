/**
 * Finish swatch QC / guard.
 *
 * The finish swatches under public/images/catalog/finishes/ are now real
 * photorealistic material textures (PNG + WebP). The old procedural generator
 * that rebuilt flat solid-color squares from hex values has been RETIRED — it
 * would have silently clobbered the real photos and it relied on `sharp`, which
 * is not installed in this environment.
 *
 * This script now only verifies coverage. It NEVER writes or overwrites a
 * finish image. The skip-if-exists behaviour mirrors the guard in
 * scripts/seed-catalog-images.mjs so the npm scripts (images:swatches /
 * images:qc) stay safe to run.
 *
 * Run: node scripts/generate-finish-swatches.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const finishesDir = path.join(root, "public", "images", "catalog", "finishes");

const FINISHES = JSON.parse(
  fs.readFileSync(path.join(root, "scripts", "site-image-manifest.json"), "utf8"),
).entries.filter((e) => e.placement === "swatch");

function main() {
  let present = 0;
  const missing = [];

  for (const entry of FINISHES) {
    const slug = entry.finishId;
    if (!slug) continue;
    const webp = path.join(finishesDir, `${slug}.webp`);
    const png = path.join(finishesDir, `${slug}.png`);
    // Mirror the seed-catalog-images guard: a slug is considered present (and is
    // therefore never touched) if EITHER the .webp or the .png already exists.
    if (fs.existsSync(webp) || fs.existsSync(png)) {
      present++;
      console.log(`  ok ${slug}`);
      continue;
    }
    missing.push(slug);
    console.warn(`  MISSING ${slug} — needs a real finish texture (no procedural fallback).`);
  }

  console.log(`Finish swatch QC: ${present}/${FINISHES.length} present.`);

  if (missing.length) {
    console.warn(
      `\n${missing.length} finish swatch(es) missing: ${missing.join(", ")}.\n` +
        "The procedural generator has been retired; generate real textures via the " +
        "image pipeline (e.g. images:generate:catalog) instead of solid-color squares.",
    );
  } else {
    console.log("All finish swatches present. Nothing to do.");
  }
}

main();
