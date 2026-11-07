import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePageSchema } from "../components/seo/HomePageSchema.tsx";
import {
  BUSINESS_ID,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateImageGallerySchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateSpeakableSchema,
  generateWebPageSchema,
  generateWebSiteSchema,
} from "../lib/schema.ts";
import { BUSINESS_INFO } from "../lib/seo.ts";
import { SITE_CONFIG } from "../shared/siteConfig.ts";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

/** Routes whose JSON-LD is built below and checked for unique entity @ids. */
const CHECKED_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/design-ideas",
  "/locations/boise",
  "/locations/caldwell",
  "/services/cabinet-installation",
  "/cabinets/kitchen",
  "/construction",
  "/shaker-cabinets",
  "/builders",
  "/guides/boise-cabinet-guide",
  "/blog/cabinet-installation-punch-list",
  "/kitchen-cabinets",
  "/catalog",
  "/warranty",
] as const;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(path);
  }
  return out;
}

/** @id values on entities (@type plus @id). A bare {@id} reference is not a second node. */
function entityIds(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) entityIds(item, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;
  const record = value as Record<string, unknown>;
  if (typeof record["@id"] === "string" && record["@type"] !== undefined) found.push(record["@id"]);
  for (const child of Object.values(record)) entityIds(child, found);
  return found;
}

const BUSINESS_TYPES = new Set(["HomeAndConstructionBusiness", "GeneralContractor", "LocalBusiness"]);

function businessTypedNodes(value: unknown, found: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value) businessTypedNodes(item, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;
  const record = value as Record<string, unknown>;
  const types = Array.isArray(record["@type"]) ? record["@type"] : record["@type"] ? [record["@type"]] : [];
  if (types.some((type) => BUSINESS_TYPES.has(String(type)))) found.push(record);
  for (const child of Object.values(record)) businessTypedNodes(child, found);
  return found;
}

function assertUniqueIds(route: string, nodes: unknown[]) {
  const ids = entityIds(nodes);
  const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual(dupes, [], `${route} repeats @id ${dupes.join(", ")}`);
}

const graphs: Record<(typeof CHECKED_ROUTES)[number], unknown[]> = {
  "/": [
    generateLocalBusinessSchema(),
    generateWebSiteSchema(),
    generateFAQSchema([{ question: "What areas do you serve?", answer: "The Treasure Valley." }]),
    generateSpeakableSchema({ path: "/", name: `${SITE_CONFIG.name}, Custom Cabinets in the Treasure Valley` }),
  ],
  "/about": [
    generateOrganizationSchema(),
    generateWebPageSchema({
      title: `About ${SITE_CONFIG.name}`,
      description: "Custom cabinet company in Meridian, Idaho.",
      url: "/about",
      aboutId: BUSINESS_ID,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Nick Perkins",
      jobTitle: "Founder",
      worksFor: { "@type": "Organization", name: SITE_CONFIG.name },
    },
    generateFAQSchema([{ question: "Who installs the cabinets?", answer: "Our crew." }]),
  ],
  "/contact": [
    generateLocalBusinessSchema(),
    generateWebPageSchema({ title: "Contact", description: "Contact the team.", url: "/contact" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ]),
    generateFAQSchema([{ question: "How do I reach you?", answer: "Call or text." }]),
  ],
  "/design-ideas": [
    generateImageGallerySchema({
      name: "Design ideas",
      description: "Cabinet ideas.",
      url: "/design-ideas",
      images: [{ url: "/images/marketing/og-default.webp", caption: "Kitchen" }],
    }),
    generateLocalBusinessSchema(),
  ],
  "/locations/boise": [
    generateWebPageSchema({ title: "Boise", description: "Cabinets in Boise.", url: "/locations/boise" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Boise, Idaho", url: "/locations/boise" },
    ]),
    generateLocalBusinessSchema("Boise"),
  ],
  "/locations/caldwell": [
    generateWebPageSchema({ title: "Caldwell", description: "Cabinets in Caldwell.", url: "/locations/caldwell" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Caldwell, Idaho", url: "/locations/caldwell" },
    ]),
    generateLocalBusinessSchema("Caldwell"),
  ],
  "/services/cabinet-installation": [
    generateWebPageSchema({
      title: "Cabinet installation",
      description: "Installation.",
      url: "/services/cabinet-installation",
    }),
    generateServiceSchema("Cabinet installation", "Cabinet installation for Treasure Valley homeowners."),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinet installation", url: "/services/cabinet-installation" },
    ]),
  ],
  "/cabinets/kitchen": [
    generateWebPageSchema({ title: "Kitchen", description: "Kitchen cabinets.", url: "/cabinets/kitchen" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
      { name: "Kitchen", url: "/cabinets/kitchen" },
    ]),
    generateServiceSchema("Kitchen cabinets", "Kitchen cabinets."),
    generateFAQSchema([{ question: "Do you install kitchens?", answer: "Yes." }]),
  ],
  "/construction": [
    generateWebPageSchema({ title: "Construction", description: "How cabinets are built.", url: "/construction" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Construction", url: "/construction" },
    ]),
    generateServiceSchema("Custom Cabinet Construction & Installation", "Cabinet boxes and installation."),
  ],
  "/shaker-cabinets": [
    generateWebPageSchema({ title: "Shaker", description: "Shaker cabinets.", url: "/shaker-cabinets" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Shaker Cabinets", url: "/shaker-cabinets" },
    ]),
    generateServiceSchema("Custom Shaker Cabinets", "Shaker cabinetry."),
  ],
  "/builders": [
    generateWebPageSchema({ title: "Builders", description: "Trade cabinetry.", url: "/builders" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "For Builders", url: "/builders" },
    ]),
    generateServiceSchema("Builder & Trade Cabinetry Program", "Cabinetry for builders."),
  ],
  "/guides/boise-cabinet-guide": [
    generateArticleSchema({
      title: "Boise custom cabinet guide",
      description: "Local guide.",
      publishedAt: "2026-01-01",
      slug: "boise-cabinet-guide",
      pathPrefix: "guides",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Guides", url: "/guides" },
      { name: "Boise", url: "/guides/boise-cabinet-guide" },
    ]),
    generateServiceSchema("Custom Cabinets in Boise, Idaho", "Custom cabinets for Boise homes.", "Boise"),
    generateSpeakableSchema({ name: "Boise custom cabinet guide", path: "/guides/boise-cabinet-guide" }),
  ],
  "/blog/cabinet-installation-punch-list": [
    generateArticleSchema({
      title: "Cabinet installation punch list",
      description: "Closeout.",
      publishedAt: "2026-01-01",
      slug: "cabinet-installation-punch-list",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: "Punch list", url: "/blog/cabinet-installation-punch-list" },
    ]),
    generateFAQSchema([{ question: "What is a punch list?", answer: "The closeout list." }]),
  ],
  "/kitchen-cabinets": [
    generateWebPageSchema({ title: "Kitchen cabinets", description: "Landing page.", url: "/kitchen-cabinets" }),
    generateFAQSchema([{ question: "Where do you work?", answer: "The Treasure Valley." }]),
  ],
  "/catalog": [
    generateWebPageSchema({ title: "Catalog", description: "The catalog.", url: "/catalog" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Catalog", url: "/catalog" },
    ]),
  ],
  "/warranty": [
    generateWebPageSchema({ title: "Warranty", description: "Warranty terms.", url: "/warranty" }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Warranty", url: "/warranty" },
    ]),
  ],
};

test("schema pages do not emit both the organization node and the business node", () => {
  const both: string[] = [];
  for (const file of [...walk("app"), ...walk("components")]) {
    const source = readFileSync(file, "utf8");
    if (source.includes("generateOrganizationSchema") && source.includes("generateLocalBusinessSchema")) {
      both.push(file);
    }
  }
  assert.deepEqual(both, []);
  assert.equal(readFileSync("app/about/page.tsx", "utf8").includes("generateLocalBusinessSchema"), false);
  assert.equal(readFileSync("components/seo/HomePageSchema.tsx", "utf8").includes("generateOrganizationSchema"), false);
});

test("each checked route has unique entity @ids", () => {
  assert.deepEqual(Object.keys(graphs), [...CHECKED_ROUTES]);
  for (const route of CHECKED_ROUTES) assertUniqueIds(route, graphs[route]);

  const home = generateLocalBusinessSchema();
  const organization = generateOrganizationSchema();
  assert.equal(home["@id"], "https://boisecabinet.co/#business");
  assert.equal(organization["@type"], "Organization");
  assert.equal(businessTypedNodes(organization).length, 0);
  const aboutPage = graphs["/about"].find((node) => (node as { "@type"?: string })["@type"] === "WebPage") as {
    about: { "@id": string };
  };
  assert.deepEqual(aboutPage.about, { "@id": "https://boisecabinet.co/#business" });
  assert.equal(businessTypedNodes(graphs["/about"]).length, 0);

  const html = renderToStaticMarkup(React.createElement(HomePageSchema));
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&")),
  );
  assertUniqueIds("/", scripts);
});

test("exactly one business-typed node across all routes", () => {
  const ids = new Set<string>();
  for (const route of CHECKED_ROUTES) {
    for (const node of businessTypedNodes(graphs[route])) {
      assert.equal(node["@id"], BUSINESS_ID, `${route} business node`);
      ids.add(String(node["@id"]));
    }
  }
  assert.deepEqual([...ids], [BUSINESS_ID]);
  assert.equal(businessTypedNodes(graphs["/about"]).length, 0);
  assert.equal(businessTypedNodes(graphs["/"]).length, 1);
});

test("offers are name and url only, and the slogan and organization description stay plain", () => {
  const home = generateLocalBusinessSchema();
  assert.equal(home.slogan, "Custom cabinets planned around your home");
  const catalog = home.hasOfferCatalog as {
    itemListElement: Array<{ url: string; itemOffered: { name: string; description?: string } }>;
  };
  for (const offer of catalog.itemListElement) {
    assert.equal(typeof offer.url, "string");
    assert.equal(typeof offer.itemOffered.name, "string");
    assert.equal("description" in offer.itemOffered, false);
  }
  const catalogJson = JSON.stringify(catalog);
  assert.equal(catalogJson.includes("marine-grade"), false);
  assert.equal(catalogJson.includes("plywood"), false);
  assert.equal(catalogJson.includes("engineered"), false);

  const organization = generateOrganizationSchema();
  assert.equal(
    organization.description,
    "Custom cabinet design and installation for Treasure Valley homes, from kitchens and vanities to pantries and built-ins. Work by P5 Home Co LLC, an Idaho registered contractor, insured with proof on request.",
  );
  assert.equal(String(organization.description).includes("8381215"), false);
  assert.equal(String(organization.description).includes("2020"), false);
  assert.deepEqual(home.sameAs, BUSINESS_INFO.sameAs);
  assert.deepEqual(home.sameAs, ["https://p5homeco.com"]);
  assert.equal(JSON.stringify(home.sameAs).includes("yelp.com"), false);
  const credential = home.hasCredential as { identifier: string; name: string };
  assert.equal(credential.identifier, "8381215");
  assert.equal(credential.name, "Idaho Registered Contractor");
  assert.equal("hasCredential" in organization, false);
});
