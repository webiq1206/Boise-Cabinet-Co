import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as esbuild from "esbuild";
import { GET as imageSitemap } from "../app/image-sitemap.xml/route.ts";
import { getAllSiteUrls } from "../lib/siteUrls.ts";
import { generateLocalBusinessSchema, generateReviewSchema } from "../lib/schema.ts";
import { ROOM_CATEGORIES } from "../shared/catalog/roomCategories.ts";
import { CITIES } from "../shared/contentData.ts";
import { LLMS_TXT } from "../shared/llmsTxt.ts";
import { SHOW_TESTIMONIALS, showTestimonials } from "../shared/siteConfig.ts";
import { TESTIMONIALS, visibleTestimonials } from "../shared/testimonialsData.ts";

const require = createRequire(import.meta.url);
const cssPlugin = {
  name: "css",
  setup(build: esbuild.PluginBuild) {
    build.onResolve({ filter: /\.css$/ }, (args) => ({ path: args.path, namespace: "css" }));
    build.onLoad({ filter: /.*/, namespace: "css" }, () => ({
      contents: "module.exports = new Proxy({}, { get: () => '' })",
      loader: "js",
    }));
  },
};

async function loadModule(entry: string): Promise<Record<string, any>> {
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    jsx: "automatic",
    external: ["react", "react-dom", "react/jsx-runtime", "next/image", "next/link", "next/navigation", "next/font/google", "server-only"],
    plugins: [cssPlugin],
    logLevel: "silent",
  });
  const mod = { exports: {} as Record<string, any> };
  const compiled = new Function("require", "module", "exports", result.outputFiles[0].text);
  compiled((id: string) => {
    if (id === "react") return React;
    if (id === "react/jsx-runtime" || id === "react/jsx-dev-runtime") return require(id);
    if (id === "next/image") return { __esModule: true, default: function Image() { return null; } };
    if (id === "next/link") {
      return {
        __esModule: true,
        default: function Link({ href, children, ...rest }: { href: string; children?: React.ReactNode }) {
          return React.createElement("a", { href, ...rest }, children);
        },
      };
    }
    if (id === "next/navigation") {
      return {
        usePathname: () => "/",
        useRouter: () => ({ push() {}, replace() {} }),
        useSearchParams: () => new URLSearchParams(),
        notFound: () => { throw new Error("notFound"); },
      };
    }
    if (id === "next/font/google") {
      return { Cormorant: () => ({ variable: "", className: "" }), Manrope: () => ({ variable: "", className: "" }) };
    }
    if (id === "server-only") return {};
    return require(id);
  }, mod, mod.exports);
  return mod.exports;
}

async function renderPage(entry: string, props?: Record<string, unknown>, exportName = "default"): Promise<string> {
  const loaded = await loadModule(entry);
  const component = loaded[exportName] ?? loaded.default;
  const passed = props ?? {};
  if (component.constructor?.name === "AsyncFunction") {
    return renderToStaticMarkup(await component(passed));
  }
  return renderToStaticMarkup(React.createElement(component, passed));
}

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

test("SHOW_TESTIMONIALS is a site-config constant that stays false", () => {
  const source = readFileSync("shared/siteConfig.ts", "utf8");
  assert.equal(SHOW_TESTIMONIALS, false);
  assert.equal(showTestimonials(), false);
  assert.match(source, /export const SHOW_TESTIMONIALS = false/);
  assert.equal(source.includes("process.env.SHOW_TESTIMONIALS"), false);
  assert.equal(source.includes("NEXT_PUBLIC_SHOW_TESTIMONIALS"), false);
  process.env.SHOW_TESTIMONIALS = "true";
  process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS = "true";
  process.env.NEXT_PUBLIC_REVIEW_RATING = "5";
  process.env.NEXT_PUBLIC_REVIEW_COUNT = "48";
  assert.equal(showTestimonials(), false);
});

const RATING_CLAIM = /AggregateRating|reviewBody|reviewCount|"@type":"Review"|out of 5|rated by homeowner|homeowner reviews|\d-star|five-star|five star|Projects & Reviews|Projects and reviews|projects and reviews|star rating/i;

function assertNoReviewClaims(label: string, text: string) {
  for (const name of NAMES) assert.equal(text.includes(name), false, `${label} name ${name}`);
  for (const quote of QUOTES) assert.equal(text.includes(quote), false, label);
  const claim = text.match(RATING_CLAIM);
  assert.equal(claim, null, `${label} rating claim ${claim?.[0]}`);
}

test("public pages render no seed names or rating claims while the flag is false", async () => {
  const pages: Array<[string, string]> = [
    ["home", await renderPage("components/approved/ApprovedHome.tsx", {}, "ApprovedHome")],
    ["home schema", await renderPage("components/seo/HomePageSchema.tsx", {}, "HomePageSchema")],
    ["footer", await renderPage("components/Footer.tsx", {}, "Footer")],
    ["testimonials", await renderPage("app/testimonials/page.tsx")],
    ["featured project", await renderPage("components/sections/FeaturedProjectSection.tsx", {}, "FeaturedProjectSection")],
    ["project gallery", await renderPage("components/sections/ProjectGallerySection.tsx", { limit: 6, showViewAll: true }, "ProjectGallerySection")],
  ];
  const roomPage = await loadModule("app/cabinets/[room]/page.tsx");
  for (const room of ROOM_CATEGORIES) {
    const element = await roomPage.default({ params: Promise.resolve({ room: room.slug }) });
    pages.push([`/cabinets/${room.slug}`, renderToStaticMarkup(element)]);
  }
  const cityPage = await loadModule("app/locations/[city]/page.tsx");
  for (const city of CITIES) {
    const element = await cityPage.default({ params: Promise.resolve({ city: city.slug }) });
    pages.push([`/locations/${city.slug}`, renderToStaticMarkup(element)]);
  }

  const testimonialsMeta = (await loadModule("app/testimonials/page.tsx")).metadata;
  pages.push(["testimonials metadata", JSON.stringify(testimonialsMeta)]);
  pages.push(["local business schema", JSON.stringify(generateLocalBusinessSchema())]);
  pages.push(["review schema", JSON.stringify(generateReviewSchema(TESTIMONIALS.map((item) => ({
    author: item.customerName,
    rating: Number(item.rating),
    text: item.testimonial,
    date: "2020-01-01",
  }))))]);
  pages.push(["llms.txt", LLMS_TXT]);
  pages.push(["sitemap", getAllSiteUrls().map((entry) => `${entry.path} ${entry.label}`).join("\n")]);
  pages.push(["image sitemap", await (await imageSitemap()).text()]);

  for (const [label, text] of pages) assertNoReviewClaims(label, text);

  assert.equal(getAllSiteUrls().some((entry) => entry.path === "/testimonials"), false);
  assert.equal(LLMS_TXT.includes("/testimonials"), false);
  assert.equal((await (await imageSitemap()).text()).includes("/testimonials"), false);
  assert.equal(pages.find(([label]) => label === "testimonials")?.[1].includes("Design ideas"), true);
  assert.equal(pages.find(([label]) => label === "testimonials")?.[1].includes("They are not photographs of completed client projects."), true);
  assert.equal(pages.find(([label]) => label === "footer")?.[1].includes("/testimonials"), false);
  assert.match(JSON.stringify(testimonialsMeta), /noindex|index":false/);
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
  const nav = readFileSync("shared/cabinetNav.ts", "utf8");
  const footer = readFileSync("components/Footer.tsx", "utf8");
  assert.equal(nav.includes('showTestimonials() ? [{ label: "Projects & reviews", href: "/testimonials" }]'), true);
  assert.equal(footer.includes('showTestimonials() ? [{ label: "Projects & Reviews", href: "/testimonials" }]'), true);
});
