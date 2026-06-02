/** Quick script to convert city-service and services PNGs to WebP */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images");

async function convertDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".png")) continue;
    const src = path.join(dir, f);
    const dest = path.join(dir, f.replace(".png", ".webp"));
    if (fs.existsSync(dest)) continue;
    await sharp(src).webp({ quality: 82 }).toFile(dest);
    console.log(dest);
  }
}

await convertDir(path.join(root, "city-service"));
await convertDir(path.join(root, "services"));
console.log("Done.");
