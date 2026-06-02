/**
 * Rewrites alt strings in blogImageRegistry.ts (alt field values only).
 * Run: node scripts/migrate-blog-alts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(__dirname, "..", "shared", "blogImageRegistry.ts");

let content = fs.readFileSync(registryPath, "utf8");

function rewriteAlt(alt) {
  return alt
    .replace(/remodel/gi, (m) => (m[0] === m[0].toUpperCase() ? "Cabinet project" : "cabinet project"))
    .replace(/renovation/gi, "cabinet installation")
    .replace(/Boise Remodeling Co/g, "Boise Cabinet Co")
    .replace(/remodeling/gi, "custom cabinetry")
    .replace(/design-build team reviewing remodel plans/gi, "cabinet design team reviewing layout plans");
}

content = content.replace(/alt: '([^']+)'/g, (_, alt) => `alt: '${rewriteAlt(alt).replace(/'/g, "\\'")}'`);

fs.writeFileSync(registryPath, content);
console.log("Updated alt strings in blogImageRegistry.ts");
