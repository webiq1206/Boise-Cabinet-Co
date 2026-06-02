/**
 * Batch-optimizes public/images to WebP + responsive widths.
 * Run: node scripts/optimize-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const imagesRoot = path.join(root, "public", "images");
const WIDTHS = [640, 1080, 1920];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(png|jpe?g)$/i.test(name)) files.push(full);
  }
  return files;
}

async function optimize(file) {
  const rel = path.relative(imagesRoot, file);
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  const meta = await sharp(file).metadata();
  const maxW = meta.width ?? 1920;

  for (const w of WIDTHS) {
    if (w > maxW) continue;
    const dest = `${base}-${w}.webp`;
    if (fs.existsSync(dest)) continue;
    await sharp(file).resize(w).webp({ quality: 82 }).toFile(dest);
  }

  const webpDest = `${base}.webp`;
  if (!fs.existsSync(webpDest)) {
    await sharp(file).webp({ quality: 82 }).toFile(webpDest);
    console.log(`  ${rel} → .webp`);
  }
}

async function main() {
  const files = walk(imagesRoot);
  console.log(`Optimizing ${files.length} source images...`);
  for (const f of files) {
    await optimize(f);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
