import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const ABOUT_ALT =
  "Cabinet door samples and finish swatches laid out for a kitchen design | Boise Cabinet Co";

test("the /about IMG-4 alt skips the location suffix and keeps the brand", () => {
  const source = readFileSync("scripts/build-site-image-manifest.mjs", "utf8");
  assert.match(
    source,
    /id: "process-about"[\s\S]*?noLocationSuffix: true/,
  );

  const manifest = JSON.parse(readFileSync("scripts/site-image-manifest.json", "utf8")) as {
    entries: Array<{ outputPath: string; pages: string[]; alt: string }>;
  };
  const about = manifest.entries.find(
    (entry) =>
      entry.outputPath === "/images/marketing/cabinet-door-samples.webp" &&
      entry.pages.includes("/about"),
  );
  assert.ok(about);
  assert.equal(about.alt, ABOUT_ALT);
  assert.equal(about.alt.includes("in the Treasure Valley, Idaho"), false);
});
