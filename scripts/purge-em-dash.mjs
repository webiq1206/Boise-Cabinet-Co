/**
 * Replaces Unicode em dashes in user-facing source trees.
 * Run: node scripts/purge-em-dash.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DIRS = ["app", "components", "shared", "lib", "server"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name === "node_modules" || name === ".next") continue;
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXT.has(path.extname(name))) files.push(full);
  }
  return files;
}

function fixContent(text) {
  let out = text;
  out = out.replace(/\?\? "—"/g, '?? "N/A"');
  out = out.replace(/\?\? '—'/g, "?? 'N/A'");
  out = out.replace(/return "—"/g, 'return "N/A"');
  out = out.replace(/return '—'/g, "return 'N/A'");
  out = out.replace(/: "—"/g, ': "N/A"');
  out = out.replace(/ — /g, ", ");
  out = out.replace(/—/g, ", ");
  return out;
}

let changed = 0;
for (const dir of DIRS) {
  for (const file of walk(path.join(root, dir))) {
    const raw = fs.readFileSync(file, "utf8");
    if (!raw.includes("—")) continue;
    const next = fixContent(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next);
      changed++;
    }
  }
}
console.log(`Updated ${changed} files.`);
