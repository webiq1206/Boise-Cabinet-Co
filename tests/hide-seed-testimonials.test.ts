import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { GET as imageSitemap } from "../app/image-sitemap.xml/route.ts";
import { getAllSiteUrls, getSiteUrlGroups } from "../lib/siteUrls.ts";
import { generateLocalBusinessSchema, generateReviewSchema } from "../lib/schema.ts";
import { showTestimonials } from "../shared/siteConfig.ts";
import { TESTIMONIALS, visibleTestimonials } from "../shared/testimonialsData.ts";

const NAMES = ["Sarah M.", "Mike R.", "Jennifer K.", "David L."];
const QUOTES = TESTIMONIALS.map((item) => item.testimonial);

test("the effective npm postbuild preserves both public-output guards", () => {
  const source = readFileSync("package.json", "utf8");
  assert.equal([...source.matchAll(/"postbuild"\s*:/g)].length, 1,
    "duplicate JSON keys silently replace an earlier build guard");
  const command = JSON.parse(source).scripts.postbuild;
  assert.deepEqual(command.split(/\s*&&\s*/), [
    "node scripts/verify-no-seed-reviews-client.mjs",
    "node scripts/guards/no-public-supplier-names.mjs",
  ]);
});

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
    "scripts/verify-no-seed-reviews-client.mjs",
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
  assert.equal(page.includes("Design concepts illustrate possible layouts and finishes."), true);
  assert.equal(page.includes("They are not photographs of completed client projects."), true);
  assert.equal(page.includes("noindex: !showTestimonials()"), true);
  assert.equal(page.includes("Explore kitchen, bathroom, and built-in cabinet ideas for Treasure Valley homes."), true);
  assert.equal(page.includes("Explore cabinet design concepts for Treasure Valley homes."), false);
  const nav = readFileSync("shared/cabinetNav.ts", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");
  const navigation = readFileSync("components/Navigation.tsx", "utf8");
  const home = readFileSync("components/approved/ApprovedHome.tsx", "utf8");
  const layout = readFileSync("app/layout.tsx", "utf8");
  const gallery = readFileSync("components/sections/ProjectGallerySection.tsx", "utf8");
  const redirects = readFileSync("next.config.js", "utf8");
  const imageSitemap = readFileSync("app/image-sitemap.xml/route.ts", "utf8");
  assert.equal(nav.includes("Projects & reviews"), false);
  assert.equal(footer.includes("Projects & Reviews"), false);
  assert.equal(navigation.includes("Projects & reviews"), false);
  assert.equal(home.includes("TestimonialsSection"), false);
  assert.equal(home.includes("testimonialsData"), false);
  assert.equal(readFileSync("app/page.tsx", "utf8").includes("<HomeTestimonials />"), true);
  assert.equal(layout.includes('process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true"'), true);
  assert.equal(redirects.includes("'/projects': '/cabinets'"), true);
  assert.equal(redirects.includes("'/projects': '/testimonials'"), false);
  assert.equal(imageSitemap.includes("cabinets in Meridian, Idaho"), true);
  assert.equal(imageSitemap.includes("cabinets built by Boise Cabinet Co in Meridian, Idaho"), false);
  assert.equal(gallery.includes("showViewAll && showTestimonials()"), true);
  assert.equal(gallery.includes(">See more design ideas<"), true);
  assert.equal(gallery.includes("See more projects and reviews"), false);
});

test("testimonials drops out of both sitemaps while the flag is off", async () => {
  delete process.env.SHOW_TESTIMONIALS;
  delete process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS;

  assert.equal(getAllSiteUrls().some((entry) => entry.path === "/testimonials"), false);
  assert.equal(
    getSiteUrlGroups().some((group) => group.entries.some((entry) => entry.label === "Testimonials")),
    false,
  );
  const hiddenXml = await (await imageSitemap()).text();
  assert.equal(hiddenXml.includes("/testimonials</loc>"), false);

  process.env.SHOW_TESTIMONIALS = "true";
  assert.equal(getAllSiteUrls().some((entry) => entry.path === "/testimonials" && entry.label === "Testimonials"), true);
  assert.equal(
    getSiteUrlGroups().some((group) => group.entries.some((entry) => entry.path === "/testimonials" && entry.label === "Testimonials")),
    true,
  );
  const shownXml = await (await imageSitemap()).text();
  assert.equal(shownXml.includes("/testimonials</loc>"), true);

  delete process.env.SHOW_TESTIMONIALS;
  delete process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS;
});
