import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import type { Manifest } from "./lib";

const ORPHAN_THRESHOLD = 1;
const WEAK_THRESHOLD = 3;

function main() {
  const path = resolve(process.cwd(), "data/internal-links.json");
  if (!existsSync(path)) {
    console.warn("[audit:links] WARN data/internal-links.json not found. Run the generator first. Skipping audit.");
    return;
  }

  const manifest: Manifest = JSON.parse(readFileSync(path, "utf8"));
  const pageUrls = new Set(Object.keys(manifest.pages));

  const orphans: string[] = [];
  const weak: Array<{ url: string; incoming: number }> = [];
  const broken: Array<{ from: string; to: string }> = [];

  for (const [url, count] of Object.entries(manifest.incoming)) {
    if (count < ORPHAN_THRESHOLD) orphans.push(url);
    else if (count < WEAK_THRESHOLD) weak.push({ url, incoming: count });
  }

  for (const [from, page] of Object.entries(manifest.pages)) {
    for (const link of page.links) {
      if (!pageUrls.has(link.url)) broken.push({ from, to: link.url });
    }
  }

  const totalIncoming = Object.values(manifest.incoming).reduce((a, b) => a + b, 0);
  const avg = totalIncoming / Math.max(1, Object.keys(manifest.incoming).length);

  console.log("[audit:links] ----- Internal link audit -----");
  console.log(`[audit:links] Pages: ${Object.keys(manifest.pages).length}`);
  console.log(`[audit:links] Total outbound links: ${totalIncoming}`);
  console.log(`[audit:links] Average incoming per page: ${avg.toFixed(2)}`);

  if (orphans.length > 0) {
    console.warn(`[audit:links] WARN ${orphans.length} orphan page(s) with 0 incoming links:`);
    for (const url of orphans.slice(0, 25)) console.warn(`  - ${url}`);
    if (orphans.length > 25) console.warn(`  ... and ${orphans.length - 25} more`);
  } else {
    console.log("[audit:links] OK no orphan pages.");
  }

  if (weak.length > 0) {
    console.warn(`[audit:links] WARN ${weak.length} weak page(s) (< ${WEAK_THRESHOLD} incoming):`);
    for (const w of weak.slice(0, 25)) console.warn(`  - ${w.url} (incoming=${w.incoming})`);
    if (weak.length > 25) console.warn(`  ... and ${weak.length - 25} more`);
  } else {
    console.log("[audit:links] OK no weak-equity pages.");
  }

  if (broken.length > 0) {
    console.warn(`[audit:links] WARN ${broken.length} broken internal link(s):`);
    for (const b of broken.slice(0, 25)) console.warn(`  - ${b.from} -> ${b.to}`);
    if (broken.length > 25) console.warn(`  ... and ${broken.length - 25} more`);
  } else {
    console.log("[audit:links] OK no broken internal links.");
  }

  console.log("[audit:links] ----- Done (warn-only, build never fails) -----");
}

main();
