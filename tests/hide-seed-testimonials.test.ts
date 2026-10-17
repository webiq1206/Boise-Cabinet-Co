import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { generateLocalBusinessSchema, generateReviewSchema } from "../lib/schema.ts";
import { showTestimonials } from "../shared/siteConfig.ts";
import { TESTIMONIALS, visibleTestimonials } from "../shared/testimonialsData.ts";

const NAMES = ["Sarah M.", "Mike R.", "Jennifer K.", "David L."];
const QUOTES = TESTIMONIALS.map((item) => item.testimonial);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|js|mjs|txt)$/.test(name)) out.push(path);
  }
  return out;
}

test("SHOW_TESTIMONIALS renders only when the value is exactly true", () => {
  assert.equal(showTestimonials(undefined), false);
  assert.equal(showTestimonials(""), false);
  assert.equal(showTestimonials("TRUE"), false);
  assert.equal(showTestimonials("True"), false);
  assert.equal(showTestimonials("1"), false);
  assert.equal(showTestimonials("false"), false);
  assert.equal(showTestimonials("true"), true);
  delete process.env.SHOW_TESTIMONIALS;
  delete process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS;
  assert.equal(showTestimonials(), false);
});

test("seed review text and rating schema stay out of public output while the flag is unset", () => {
  for (const name of NAMES) {
    assert.equal(TESTIMONIALS.some((item) => item.customerName === name), true, name);
  }
  assert.deepEqual(visibleTestimonials(), []);

  const local = JSON.stringify(generateLocalBusinessSchema());
  assert.equal(local.includes("AggregateRating"), false);
  assert.equal(local.includes("aggregateRating"), false);
  for (const name of NAMES) assert.equal(local.includes(name), false);

  const review = JSON.stringify(generateReviewSchema(TESTIMONIALS.map((item) => ({
    author: item.customerName,
    rating: Number(item.rating),
    text: item.testimonial,
    date: "2020-01-01",
  }))));
  assert.equal(review.includes("AggregateRating"), false);
  assert.equal(review.includes('"Review"'), false);
  assert.equal(review.includes("reviewBody"), false);
  for (const name of NAMES) assert.equal(review.includes(name), false);
  for (const quote of QUOTES) assert.equal(review.includes(quote), false);

  const kept = new Set([
    "shared/testimonialsData.ts",
    "server/storage.ts",
    "tests/hide-seed-testimonials.test.ts",
    "e2e/hide-seed-testimonials.spec.ts",
  ]);
  const hits: string[] = [];
  for (const file of walk(".")) {
    const rel = file.replace(/\\/g, "/").replace(/^\.\//, "");
    if (kept.has(rel) || rel.startsWith("node_modules/") || rel.startsWith(".next/")) continue;
    const text = readFileSync(file, "utf8");
    for (const name of NAMES) {
      if (text.includes(name)) hits.push(`${rel} name ${name}`);
    }
    for (const quote of QUOTES) {
      if (text.includes(quote)) hits.push(`${rel} quote`);
    }
    if (text.includes("AggregateRating") && !rel.endsWith("lib/schema.ts") && !rel.endsWith("components/marketing/AggregateRating.tsx") && !rel.endsWith("components/marketing/index.ts") && !rel.endsWith("components/sections/HeroSection.tsx") && !rel.endsWith("components/sections/TestimonialsSection.tsx")) {
      hits.push(`${rel} AggregateRating`);
    }
  }
  assert.deepEqual(hits, []);

  const schema = readFileSync("lib/schema.ts", "utf8");
  assert.equal(schema.includes("showTestimonials() && BUSINESS_INFO.reviewCount > 0"), true);
  assert.equal(schema.includes("if (!showTestimonials())"), true);
  assert.equal(readFileSync("components/sections/TestimonialsSection.tsx", "utf8").includes("if (!showTestimonials()) return null;"), true);
  assert.equal(readFileSync("components/marketing/AggregateRating.tsx", "utf8").includes("if (!showTestimonials()) return null;"), true);
  assert.equal(readFileSync("app/api/testimonials/route.ts", "utf8").includes("if (!showTestimonials()) return NextResponse.json([]);"), true);
  assert.equal(readFileSync("app/locations/[city]/page.tsx", "utf8").includes("visibleTestimonials()"), true);
  assert.equal(readFileSync("app/cabinets/[room]/page.tsx", "utf8").includes("visibleTestimonials()"), true);
  const page = readFileSync("app/testimonials/page.tsx", "utf8");
  assert.equal(page.includes("Concept imagery illustrates design options and is not evidence of completed Boise projects."), true);
  assert.equal(page.includes("They are not photographs of completed client projects."), true);
  assert.equal(page.includes("noindex: !showTestimonials()"), true);
  assert.equal(page.includes("Explore kitchen, bathroom, and built-in cabinet ideas for Treasure Valley homes."), true);
  assert.equal(page.includes("Explore cabinet design concepts for Treasure Valley homes."), false);
  const nav = readFileSync("shared/cabinetNav.ts", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");
  const gallery = readFileSync("components/sections/ProjectGallerySection.tsx", "utf8");
  assert.equal(nav.includes('showTestimonials() ? [{ label: "Projects & reviews", href: "/testimonials" }]'), true);
  assert.equal(footer.includes('showTestimonials() ? [{ label: "Projects & Reviews", href: "/testimonials" }]'), true);
  assert.equal(gallery.includes(">See more design ideas<"), true);
  assert.equal(gallery.includes("See more projects and reviews"), false);
});
