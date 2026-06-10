/**
 * Auto-converts Unicode em dashes (—) to ASCII hyphens (-) across source.
 * Mirrors the scope of scripts/verify-no-em-dash.ts so a run here always
 * satisfies that gate. Safe to run repeatedly (idempotent).
 *
 * Run: npx tsx scripts/fix-em-dash.ts        (rewrites files in place)
 *      npx tsx scripts/fix-em-dash.ts --check (report only, non-zero if any)
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");
const DIRS = ["app", "components", "shared", "lib", "server"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const EM_DASH = "\u2014";

const checkOnly = process.argv.includes("--check");

function walk(dir: string, files: string[] = []): string[] {
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

let filesChanged = 0;
let dashesReplaced = 0;

for (const dir of DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const original = fs.readFileSync(file, "utf8");
    if (!original.includes(EM_DASH)) continue;
    const count = original.split(EM_DASH).length - 1;
    dashesReplaced += count;
    filesChanged += 1;
    const rel = path.relative(ROOT, file);
    if (checkOnly) {
      console.log(`  ${rel} (${count})`);
    } else {
      fs.writeFileSync(file, original.split(EM_DASH).join("-"), "utf8");
      console.log(`  fixed ${rel} (${count})`);
    }
  }
}

if (dashesReplaced === 0) {
  console.log("fix-em-dash: OK (no em dashes found)");
  process.exit(0);
}

if (checkOnly) {
  console.error(
    `fix-em-dash --check: ${dashesReplaced} em dash(es) in ${filesChanged} file(s). Run "npx tsx scripts/fix-em-dash.ts" to fix.`,
  );
  process.exit(1);
}

console.log(
  `fix-em-dash: replaced ${dashesReplaced} em dash(es) in ${filesChanged} file(s).`,
);
