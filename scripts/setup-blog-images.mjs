/**
 * Copies source PNGs into public/images/blog/ for slug-specific blog assets.
 * Run after generate-blog-image-registry.mjs: npm run images:blog
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogDir = path.join(root, "public", "images", "blog");

/** Parse BLOG_ASSET_COPY_MAP from generated registry without TypeScript */
const registryPath = path.join(root, "shared", "blogImageRegistry.ts");
const registrySrc = fs.readFileSync(registryPath, "utf8");
const mapMatch = registrySrc.match(
  /export const BLOG_ASSET_COPY_MAP: Record<string, string> = \{([\s\S]*?)\};/,
);
if (!mapMatch) {
  console.error("Could not parse BLOG_ASSET_COPY_MAP from blogImageRegistry.ts");
  process.exit(1);
}

const copyMap = {};
for (const line of mapMatch[1].split("\n")) {
  const m = line.match(/^\s*'([^']+)':\s*'([^']+)',?\s*$/);
  if (m) copyMap[m[1]] = m[2];
}

fs.mkdirSync(blogDir, { recursive: true });

let copied = 0;
let skipped = 0;

for (const [slug, sourcePath] of Object.entries(copyMap)) {
  const src = path.join(root, "public", sourcePath.replace(/^\//, ""));
  const dest = path.join(blogDir, `${slug}.png`);

  if (!fs.existsSync(src)) {
    console.error(`Missing source: ${sourcePath} for ${slug}`);
    process.exit(1);
  }

  if (fs.existsSync(dest)) {
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);
    if (srcStat.mtimeMs <= destStat.mtimeMs && srcStat.size === destStat.size) {
      skipped++;
      continue;
    }
  }

  fs.copyFileSync(src, dest);
  copied++;
}

console.log(`Blog images: ${copied} copied, ${skipped} up-to-date (${Object.keys(copyMap).length} total)`);
