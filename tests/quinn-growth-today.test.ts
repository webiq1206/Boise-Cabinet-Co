import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { withBrandPageMetadata } from "../lib/brand-page-metadata.ts";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "../lib/schema.ts";
import { BUSINESS_INFO } from "../lib/seo.ts";
import { bot05Location } from "../shared/content/bot05PageCopy.ts";
import { LLMS_TXT } from "../shared/llmsTxt.ts";
import { P5_PARENT_SAME_AS } from "../shared/parentProfiles.ts";
import { HOMEPAGE_FAQS } from "../shared/homepageFaqs.ts";
import { ADA_COUNTY_CITY_LIST, SERVICE_AREA_CITY_NAMES } from "../shared/serviceArea.ts";
import { deployPingAllowed, submitDeployed, urlsForChangedFiles } from "../scripts/submit-indexnow.mjs";

const NINE = ["Boise", "Meridian", "Nampa", "Eagle", "Kuna", "Caldwell", "Star", "Middleton", "Garden City"];
const PARENT_SAME_AS = [
  "https://www.facebook.com/p5homeco",
  "https://www.instagram.com/p5_home_co",
  "https://www.google.com/search?kgmid=/g/11ntl1t7dc",
  "https://maps.google.com/?cid=11869148461693849141",
];

test("parent sameAs is the four-URL family list and the brand node has none of them", () => {
  assert.deepEqual([...P5_PARENT_SAME_AS], PARENT_SAME_AS);
  const home = generateLocalBusinessSchema();
  const parent = home.parentOrganization as { name: string; sameAs: readonly string[] };
  assert.equal(parent.name, "P5 Home Co");
  assert.deepEqual([...parent.sameAs], PARENT_SAME_AS);
  assert.equal(JSON.stringify(parent).includes("aggregateRating"), false);
  const own = JSON.stringify(home.sameAs);
  assert.equal(own.includes("bbb.org"), false);
  assert.equal(own.includes("maps.google.com"), false);
  assert.equal(generateOrganizationSchema().legalName, "P5 Home Co LLC");
  assert.equal(BUSINESS_INFO.legalName, "P5 Home Co LLC");
});

test("service-area lists that name seven or more cities name all nine", () => {
  assert.deepEqual([...SERVICE_AREA_CITY_NAMES], NINE);
  const install = HOMEPAGE_FAQS.find((faq) => faq.q === "Do you install cabinets or supply only?");
  const areas = HOMEPAGE_FAQS.find((faq) => faq.q === "What areas do you serve?");
  for (const answer of [install?.a, areas?.a]) {
    for (const city of NINE) assert.equal(answer?.includes(city), true, city);
  }
  assert.equal(ADA_COUNTY_CITY_LIST.includes("Garden City"), true);
  assert.equal(ADA_COUNTY_CITY_LIST.includes("Middleton"), false);
  const cost = readFileSync("shared/content/wave1/boiseRemodelingCostGuide.ts", "utf8");
  assert.equal(cost.includes("Caldwell, and Star"), false);
  assert.equal(cost.includes("CITIES_LIST"), true);
});

test("published titles and metas match the cabinet brief", () => {
  const home = withBrandPageMetadata(
    { title: "Home", description: "fallback", alternates: { canonical: "https://boisecabinet.co/" } },
    "/",
  );
  const about = withBrandPageMetadata(
    { title: "About", description: "fallback", alternates: { canonical: "https://boisecabinet.co/about" } },
    "/about",
  );
  const contact = withBrandPageMetadata(
    { title: "Contact", description: "fallback", alternates: { canonical: "https://boisecabinet.co/contact" } },
    "/contact",
  );
  const catalog = withBrandPageMetadata(
    { title: "Catalog", description: "fallback", alternates: { canonical: "https://boisecabinet.co/catalog" } },
    "/catalog",
  );
  assert.equal(home.title && typeof home.title === "object" && "absolute" in home.title ? home.title.absolute : "", "Custom Cabinets in Boise, ID | Boise Cabinet Co");
  assert.equal(String(home.description).length, 155);
  assert.equal(about.title && typeof about.title === "object" && "absolute" in about.title ? about.title.absolute : "", "About Our Cabinet Design Team | Boise Cabinet Co");
  assert.equal(contact.title && typeof contact.title === "object" && "absolute" in contact.title ? contact.title.absolute : "", "Contact Boise Cabinet Co | Call, Text or Book a Consult");
  assert.equal(String(contact.description).length, 152);
  assert.equal(catalog.description, "Browse door styles, finishes, cabinet layouts and hardware online before your design consult, so your Boise cabinet project starts with a clear direction.");
  assert.equal(String(catalog.description).length, 154);
  const kuna = bot05Location("kuna");
  assert.equal(kuna?.title, "Kuna Custom and Garage Cabinets");
  assert.equal(kuna?.description?.length, 153);
});

test("Garden City page copy, FAQ and llms entry", () => {
  const page = bot05Location("garden-city");
  assert.ok(page);
  assert.equal(page.description?.length, 155);
  assert.equal(page.faqs?.length, 7);
  assert.equal(page.faqs?.[0].question, "Do you build custom cabinets in Garden City?");
  assert.equal(page.faqs?.[6].question, "Is Garden City part of Boise?");
  const joined = JSON.stringify(page);
  assert.equal(/visit|showroom|\bshop\b|straightforward|Perkins 5|streetAddress|Wapoot/i.test(joined), false);
  assert.equal(LLMS_TXT.includes("Last updated: 2026-11-21"), true);
  assert.equal(LLMS_TXT.includes("P5 Home Co, Meridian, ID 83646 (service-area business, no public street). Phone (208) 477-1169. Web https://p5homeco.com."), true);
  assert.equal(LLMS_TXT.includes("bbb.org"), false);
  assert.equal(LLMS_TXT.includes("[Custom cabinets in Garden City, Idaho](https://boisecabinet.co/locations/garden-city)"), true);
  assert.equal(LLMS_TXT.includes("hello@boisecabinet.co"), true);
  const local = generateLocalBusinessSchema("Garden City");
  assert.equal(local.description, "Custom cabinet company serving Garden City and the Treasure Valley, Idaho. Kitchen cabinets, bathroom vanities, closet systems, and built-in storage.");
  assert.equal(local["@id"], "https://boisecabinet.co/#localbusiness");
});

test("IndexNow posts only after a deployment and includes Garden City when that page changes", async () => {
  assert.equal(deployPingAllowed({ NODE_ENV: "production", CI: "true", REPLIT_DEPLOYMENT: "1" }), false);
  assert.equal(deployPingAllowed({ NODE_ENV: "production", GITHUB_ACTIONS: "true", REPLIT_DEPLOYMENT: "1" }), false);
  assert.equal(deployPingAllowed({ NODE_ENV: "production", GITHUB_EVENT_NAME: "pull_request", REPLIT_DEPLOYMENT: "1" }), false);
  assert.equal(deployPingAllowed({ NODE_ENV: "test", REPLIT_DEPLOYMENT: "1" }), false);
  assert.equal(deployPingAllowed({ NODE_ENV: "production", REPLIT_DEPLOYMENT: "1" }), true);
  const urls = urlsForChangedFiles(["shared/content/cityCabinetGuides.ts"]);
  assert.equal(urls.includes("https://boisecabinet.co/locations/garden-city"), true);
  let called = 0;
  const logs: string[] = [];
  const original = console.log;
  console.log = (...parts: unknown[]) => {
    logs.push(parts.join(" "));
  };
  try {
    const skipped = await submitDeployed({
      env: { NODE_ENV: "production", CI: "true", REPLIT_DEPLOYMENT: "1" },
      fetchImpl: async () => {
        called += 1;
        return { status: 200 };
      },
    });
    assert.equal(called, 0);
    assert.equal(skipped.status, "skipped");
    const posted = await submitDeployed({
      env: { NODE_ENV: "production", REPLIT_DEPLOYMENT: "1" },
      manifest: { sha: "abc123", urls: ["https://boisecabinet.co/locations/garden-city"] },
      alreadySubmitted: async () => false,
      recordSubmitted: async () => {},
      fetchImpl: async () => {
        called += 1;
        return { status: 202 };
      },
    });
    assert.equal(called, 1);
    assert.equal(posted.submitted, 1);
    assert.equal(posted.status, 202);
    assert.equal(logs.some((line) => line === "[IndexNow] sha=abc123 submitted=1 status=202"), true);
  } finally {
    console.log = original;
  }
});
