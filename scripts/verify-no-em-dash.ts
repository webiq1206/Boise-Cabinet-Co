/**
 * Fails if Unicode em dash appears in user-facing source.
 * Run: npx tsx scripts/verify-no-em-dash.ts
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");
const DIRS = ["app", "components", "shared", "lib", "server"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

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

const violations: { file: string; line: number; text: string }[] = [];

for (const dir of DIRS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.includes("—")) {
        violations.push({
          file: path.relative(ROOT, file),
          line: i + 1,
          text: line.trim().slice(0, 120),
        });
      }
    });
  }
}

if (violations.length > 0) {
  console.error(`Em dash violations: ${violations.length}`);
  for (const v of violations.slice(0, 40)) {
    console.error(`  ${v.file}:${v.line}  ${v.text}`);
  }
  if (violations.length > 40) {
    console.error(`  ... and ${violations.length - 40} more`);
  }
  process.exit(1);
}

console.log("verify-no-em-dash: OK");
