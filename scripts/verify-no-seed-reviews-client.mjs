/**
 * After `next build`, the client bundles in .next/static must not contain the
 * seed review names while SHOW_TESTIMONIALS is off. A build with the flag
 * exactly "true" may ship them.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NAMES = ["Sarah M.", "Mike R.", "Jennifer K.", "David L."];
const flag = process.env.SHOW_TESTIMONIALS ?? process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS;

if (flag === "true") {
  console.log("SHOW_TESTIMONIALS is true; seed names may ship in the client bundle.");
  process.exit(0);
}

const root = ".next/static";
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(js|css|html|json|txt|map)$/.test(name)) continue;
    const text = readFileSync(path, "utf8");
    for (const banned of NAMES) {
      if (text.includes(banned)) hits.push(`${path}: ${banned}`);
    }
  }
}

walk(root);

if (hits.length) {
  console.error(hits.join("\n"));
  console.error(`seed review names found in ${root}: ${hits.length}`);
  process.exit(1);
}

console.log(`seed review names absent from ${root}`);
