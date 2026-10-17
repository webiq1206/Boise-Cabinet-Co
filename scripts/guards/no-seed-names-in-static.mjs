/**
 * Fails the build when a seed review name is present in the client bundle.
 * Names are read from the #81 test so this file does not repeat them.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATIC = path.join(ROOT, ".next", "static");

function loadSeedNames() {
  const source = fs.readFileSync(path.join(ROOT, "tests/hide-seed-testimonials.test.ts"), "utf8");
  const match = source.match(/const NAMES = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("tests/hide-seed-testimonials.test.ts is missing const NAMES");
  const names = JSON.parse(match[1]);
  if (!Array.isArray(names) || names.length !== 4) {
    throw new Error("seed name list is not the four expected names");
  }
  return names;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

const names = loadSeedNames();
if (!fs.existsSync(STATIC)) {
  console.error("no-seed-names-in-static");
  console.error("missing .next/static");
  process.exit(1);
}

const hits = [];
for (const file of walk(STATIC)) {
  const text = fs.readFileSync(file);
  const decoded = text.toString("utf8");
  for (const name of names) {
    if (decoded.includes(name)) {
      hits.push(`${path.relative(ROOT, file)} ${name}`);
    }
  }
}

if (hits.length) {
  console.error("no-seed-names-in-static");
  for (const hit of hits) console.error(hit);
  process.exit(1);
}

console.log("no-seed-names-in-static");
console.log("0 hits");
