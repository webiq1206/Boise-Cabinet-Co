import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { buildManifest, buildPages } from "./lib";

function main() {
  const pages = buildPages();
  const manifest = buildManifest(pages);
  const outPath = resolve(process.cwd(), "data/internal-links.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const totalLinks = Object.values(manifest.pages).reduce(
    (acc, p) => acc + p.links.length,
    0,
  );
  console.log(
    `[internal-links] Wrote ${Object.keys(manifest.pages).length} pages, ${totalLinks} links to ${outPath}`,
  );
}

main();
