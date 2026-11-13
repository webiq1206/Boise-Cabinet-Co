import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const ABOUT_ALT =
  "Cabinet door samples and finish swatches laid out for a kitchen design | Boise Cabinet Co";
const CONSTRUCTION_ALT =
  "White oak kitchen with flat-panel cabinets, black bar pulls and a long waterfall island, with tall windows facing the foothills | Boise Cabinet Co";

test("the /about IMG-4 alt skips the location suffix and keeps the brand", () => {
  const source = readFileSync("scripts/build-site-image-manifest.mjs", "utf8");
  assert.match(
    source,
    /id: "process-about"[\s\S]*?noLocationSuffix: true/,
  );

  const manifest = JSON.parse(readFileSync("scripts/site-image-manifest.json", "utf8")) as {
    entries: Array<{ outputPath: string; pages: string[]; alt: string; caption?: string }>;
  };
  const about = manifest.entries.find(
    (entry) =>
      entry.outputPath === "/images/marketing/cabinet-door-samples.webp" &&
      entry.pages.includes("/about"),
  );
  assert.ok(about);
  assert.equal(about.alt, ABOUT_ALT.replace(" | Boise", " for Treasure Valley design inspiration | Boise"));
  assert.equal(about.alt.includes("in the Treasure Valley, Idaho"), false);
});

test("the /construction IMG-1 alt skips the location suffix and keeps the brand", () => {
  const source = readFileSync("scripts/build-site-image-manifest.mjs", "utf8");
  assert.match(
    source,
    /id: "hero-construction"[\s\S]*?noLocationSuffix: true/,
  );

  const images = readFileSync("shared/siteImages.ts", "utf8");
  assert.match(images, /construction:\s*"\/images\/marketing\/kitchen-wood-island\.webp"/);
  const page = readFileSync("app/construction/page.tsx", "utf8");
  assert.match(page, /image=\{MARKETING_IMAGES\.construction\}/);
  assert.ok(page.includes(CONSTRUCTION_ALT));
  assert.equal(/our work|projects/i.test(page), false);
  const layout = readFileSync("components/approved/InteriorLayout.tsx", "utf8");
  assert.match(layout, /\/images\/marketing\/kitchen-wood-island\.webp/);

  const manifest = JSON.parse(readFileSync("scripts/site-image-manifest.json", "utf8")) as {
    entries: Array<{ outputPath: string; pages: string[]; alt: string; caption?: string }>;
  };
  const construction = manifest.entries.find(
    (entry) =>
      entry.outputPath === "/images/marketing/kitchen-wood-island.webp" &&
      entry.pages.includes("/construction"),
  );
  assert.ok(construction);
  assert.equal(construction.alt, CONSTRUCTION_ALT.replace(" | Boise", " for Treasure Valley design inspiration | Boise"));
  assert.equal(construction.alt.includes("in the Treasure Valley, Idaho"), false);
  assert.equal(construction.caption ?? "", "");

  const shas: Record<string, string> = {
    "public/images/marketing/kitchen-wood-island.webp": "aaa8ac61827a9218",
    "public/images/marketing/kitchen-wood-island-1280.webp": "a64d428f605584de",
    "public/images/marketing/kitchen-wood-island-768.webp": "a8bfe9a14cac4db0",
  };
  for (const [file, prefix] of Object.entries(shas)) {
    const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(digest.startsWith(prefix), true, `${file} sha256 ${digest}`);
  }
});
