import sharp from "sharp";
import fs from "fs";
import path from "path";

const baseDir = "public/images/catalog";
const dirs = ["rooms", "collections"];
const WIDTHS = [640, 1080, 1920];

for (const d of dirs) {
  const dir = path.join(baseDir, d);
  const slugs = [
    ...new Set(
      fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".png"))
        .map((f) => f.replace(/\.png$/, "")),
    ),
  ];
  for (const slug of slugs) {
    const png = path.join(dir, slug + ".png");
    const esc = slug.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const variantRe = new RegExp("^" + esc + "-(640|1080|1920)\\.webp$");
    for (const f of fs.readdirSync(dir)) {
      if (f === slug + ".webp" || variantRe.test(f)) {
        fs.rmSync(path.join(dir, f));
      }
    }
    const meta = await sharp(png).metadata();
    const maxW = meta.width ?? 1600;
    await sharp(png)
      .resize(Math.min(1600, maxW))
      .webp({ quality: 82 })
      .toFile(path.join(dir, slug + ".webp"));
    for (const w of WIDTHS) {
      if (w > maxW) continue;
      await sharp(png).resize(w).webp({ quality: 82 }).toFile(path.join(dir, slug + "-" + w + ".webp"));
    }
    console.log(`${d}/${slug} (${maxW}w)`);
  }
}
console.log("done");
