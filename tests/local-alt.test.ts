import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { BLOG_IMAGE_REGISTRY } from "../shared/blogImageRegistry.ts";
import { CITY_HERO_IMAGES, getCityServiceImageAlt } from "../shared/cityServiceImages.ts";
import { CITIES } from "../shared/contentData.ts";
import { localAlt, subjectFromDescription } from "../shared/localAlt.ts";

// Owner, 19 November 2026: every image names the work and the place, with no
// qualifier such as "idea", "concept" or "inspiration" in the description.
const QUALIFIER = /\b(idea|ideas|concept|representative|inspiration|rendering)\b/i;

test("a local alt names the work, the city and Idaho, then the picture", () => {
  assert.equal(
    localAlt("White oak kitchen with flat-panel cabinets", { city: "Meridian" }),
    "Kitchen cabinets in Meridian, Idaho: white oak kitchen with flat-panel cabinets",
  );
  assert.equal(localAlt("Macaron Green finish swatch"), "Cabinet finishes in Boise, Idaho: Macaron Green finish swatch");
  assert.equal(localAlt("Modern Shaker door profile"), "Cabinet door styles in Boise, Idaho: Modern Shaker door profile");
  // The older "| Boise Cabinet Co" tail and "in <city>" tail fold into the one form.
  assert.equal(
    localAlt("Pearl Black matte cabinet finish in Kuna | Boise Cabinet Co"),
    "Cabinet finishes in Kuna, Idaho: Pearl Black matte cabinet finish",
  );
  // Already local, or empty: left as written.
  assert.equal(localAlt("Custom cabinets in Eagle, Idaho"), "Custom cabinets in Eagle, Idaho");
  assert.equal(localAlt(""), "");
  assert.equal(subjectFromDescription("Bathroom with a walnut floating double vanity"), "bathroom vanities");
});

test("every city photograph has its own local alt", () => {
  const seen = new Set<string>();
  for (const city of CITIES) {
    if (!CITY_HERO_IMAGES[city.slug]) continue;
    const alt = getCityServiceImageAlt(`/locations/${city.slug}`);
    assert.ok(alt, city.slug);
    assert.match(alt, new RegExp(` in ${city.name}, Idaho: `), `${city.slug}: ${alt}`);
    assert.ok(!QUALIFIER.test(alt), `${city.slug}: ${alt}`);
    const picture = alt.split(": ")[1];
    assert.ok(!seen.has(picture), `${city.slug} repeats another city's picture`);
    seen.add(picture);
  }
});

test("every blog and guide photograph gets a local alt with no qualifier", () => {
  for (const [slug, entry] of Object.entries(BLOG_IMAGE_REGISTRY)) {
    const alt = localAlt(entry.alt);
    assert.match(alt, /, Idaho/, `${slug}: ${alt}`);
    assert.ok(!QUALIFIER.test(entry.alt), `${slug}: ${entry.alt}`);
  }
});

test("FAQ questions keep their spaces: the trigger wraps head and tail in one element", () => {
  const source = readFileSync("components/ui/accordion.tsx", "utf8");
  assert.match(source, /<span className="min-w-0">\s*\{head\} <span className="mobile-keep">\{tail\}<\/span>\s*<\/span>/);
});

test("article headings are not clipped: only the direct hint span is hidden when a section is open", () => {
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.guide-section-details\[open\] \.guide-section-summary > span \{/);
});
