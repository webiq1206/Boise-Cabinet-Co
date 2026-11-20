import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { SITE } from "../backlink-engine/config";
import { P5_ORG_ID, generateLocalBusinessSchema, generateOrganizationSchema, generateServiceSchema } from "../lib/schema";
import { buildBusinessVCard } from "../lib/vcard";
import { BUSINESS_INFO } from "../lib/seo";
import { SITE_CONFIG } from "../shared/siteConfig";

const MERIDIAN_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Meridian",
  addressRegion: "ID",
  postalCode: "83646",
  addressCountry: "US",
};

function assertMeridianAddress(address: unknown) {
  assert.deepEqual(address, MERIDIAN_ADDRESS);
}

test("public business schema contains only the Meridian locality", () => {
  const organization = generateOrganizationSchema();
  const home = generateLocalBusinessSchema();
  const area = generateLocalBusinessSchema("Eagle");
  const service = generateServiceSchema("Custom Cabinets", "Built to order.", "Eagle");
  const provider = service.provider as { "@type": string[]; address: unknown };

  assertMeridianAddress(organization.address);
  assertMeridianAddress(home.address);
  assertMeridianAddress(area.address);
  assertMeridianAddress(provider.address);
});

test("area pages name the city in areaServed and use HomeAndConstructionBusiness", () => {
  const area = generateLocalBusinessSchema("Eagle");
  const areas = area.areaServed as Array<{ "@type": string; name: string }>;

  assert.deepEqual(area["@type"], ["LocalBusiness", "HomeAndConstructionBusiness"]);
  assert.ok(areas.some((entry) => entry["@type"] === "City" && entry.name === "Eagle"));
  assert.equal(JSON.stringify(area.address).includes("Eagle"), false);

  const service = generateServiceSchema("Custom Cabinets", "Built to order.", "Nampa");
  assert.deepEqual(service.areaServed, { "@type": "City", name: "Nampa" });
  const provider = service.provider as { address: { addressLocality: string } };
  assert.equal(provider.address.addressLocality, "Meridian");
});

test("public contacts retain locality facts and do not keep a street", () => {
  assert.equal("street" in SITE.address, false);
  const citation = JSON.stringify(SITE);
  assert.equal(/streetAddress/i.test(citation), false);
  assert.equal(citation.toLowerCase().includes(["wa", "poot"].join("")), false);
  assert.equal(SITE.address.city, MERIDIAN_ADDRESS.addressLocality);
  assert.equal(SITE.address.region, MERIDIAN_ADDRESS.addressRegion);
  assert.equal(SITE.address.postalCode, "83646");
  assert.equal(SITE.address.country, MERIDIAN_ADDRESS.addressCountry);
  assert.equal(SITE.phone, "(208) 477-1169");
  assert.equal(SITE_CONFIG.phone, SITE.phone);
  assert.equal(SITE_CONFIG.email, "hello@boisecabinet.co");
  assert.equal(BUSINESS_INFO.phone, SITE.phone);
  assert.equal(BUSINESS_INFO.email, SITE_CONFIG.email);
  assert.deepEqual(BUSINESS_INFO.serviceArea, [
    "Boise",
    "Meridian",
    "Nampa",
    "Eagle",
    "Kuna",
    "Caldwell",
    "Star",
    // Owner decision, 20 November 2026 (SEO audit): Middleton has a published
    // page and is on the P5 Home Co profile, so it is in the service area.
    "Middleton",
  ]);
  assert.equal(SITE_CONFIG.owner.name, "Nick");

  const home = generateLocalBusinessSchema();
  const organization = generateOrganizationSchema();
  const areas = home.areaServed as Array<{ "@type": string; name: string }>;
  assert.deepEqual(areas, [
    ...BUSINESS_INFO.serviceArea.map((name) => ({ "@type": "City", name })),
    { "@type": "AdministrativeArea", name: "Ada County" },
    { "@type": "AdministrativeArea", name: "Canyon County" },
  ]);
  assert.deepEqual(organization.areaServed, areas);
  assert.equal(JSON.stringify(areas).includes("Garden City"), false);
  assert.equal(JSON.stringify(areas).includes("Middleton"), true);
  assert.equal(home.telephone, "+1-208-477-1169");
  assert.deepEqual(home.sameAs, BUSINESS_INFO.sameAs);
  assert.equal(home.parentOrganization, organization.parentOrganization);
  const parent = home.parentOrganization as { "@id": string; url: string };
  assert.equal(parent["@id"], "https://p5homeco.com/#organization");
  assert.equal(parent["@id"], P5_ORG_ID);
  assert.equal(parent.url, "https://p5homeco.com");
  // The family's profiles are P5 Home Co's Facebook page and its Google
  // Business Profile (owner call A): on the parent node only, never in this
  // brand's own sameAs.
  assert.deepEqual((parent as unknown as { sameAs: string[] }).sameAs, [
    "https://www.facebook.com/1228704823655951",
    "https://www.google.com/search?kgmid=/g/11ntl1t7dc",
  ]);
  for (const own of [home.sameAs, organization.sameAs ?? []]) {
    assert.equal(JSON.stringify(own).includes("facebook.com"), false);
    assert.equal(JSON.stringify(own).includes("kgmid"), false);
  }

  for (const schema of [home, organization]) {
    const contact = schema.contactPoint as {
      name: string;
      contactType: string;
      telephone: string;
      email: string;
    };
    const employee = schema.employee as { "@type": string; "@id": string; name: string; jobTitle: string; worksFor: { "@id": string } };
    assert.equal(contact.name, "Nick Perkins");
    assert.equal("founder" in schema, false);
    assert.equal(employee["@type"], "Person");
    assert.equal(employee["@id"], "https://p5homeco.com/#nick-perkins");
    assert.equal(employee.name, "Nick Perkins");
    assert.equal(employee.jobTitle, "Founder");
    assert.deepEqual(employee.worksFor, { "@id": "https://p5homeco.com/#organization" });
    assert.equal(contact.contactType, "customer service");
    assert.equal(contact.telephone, "+1-208-477-1169");
    assert.equal(contact.email, "hello@boisecabinet.co");
    assert.equal(schema.email, "hello@boisecabinet.co");
    const json = JSON.stringify(schema);
    assert.equal(json.includes("Jared"), false);
    assert.equal(json.includes("Garden City"), false);
    assert.equal(json.includes('"founder"'), false);
  }

  const provider = generateServiceSchema("Custom Cabinets", "Built to order.").provider as {
    founder?: unknown;
    employee: { name: string; jobTitle: string };
    contactPoint: { name: string; contactType: string };
  };
  assert.equal(provider.founder, undefined);
  assert.equal(provider.employee.name, "Nick Perkins");
  assert.equal(provider.employee.jobTitle, "Founder");
  assert.equal(provider.contactPoint.name, "Nick Perkins");
  assert.equal(provider.contactPoint.contactType, "customer service");
});

test("contact card publishes the Meridian locality and direct line, with no street", () => {
  const card = buildBusinessVCard();
  assert.match(card, /^ORG:Boise Cabinet Co\r?$/m);
  assert.match(card, /^FN:Nick Perkins\r?$/m);
  assert.match(card, /^TEL;TYPE=WORK,VOICE:\+12084771169\r?$/m);
  assert.match(card, /^ADR;TYPE=WORK:;;;Meridian;ID;83646;USA\r?$/m);
  assert.equal(new RegExp(`${["wa", "poot"].join("")}|streetAddress`, "i").test(card), false);
});

test("public name, phone, and email stay aligned with the parent profile", () => {
  const home = generateLocalBusinessSchema();
  const organization = generateOrganizationSchema();
  const brandHost = new URL(SITE_CONFIG.siteUrl).hostname;
  assert.equal(SITE_CONFIG.phone, "(208) 477-1169");
  assert.equal(home.telephone, "+1-208-477-1169");
  assert.equal(home.email, `hello@${brandHost}`);
  assert.equal(organization.email, `hello@${brandHost}`);
  assert.equal(home.legalName, "P5 Home Co LLC");
  assert.equal(organization.legalName, "P5 Home Co LLC");
  const description = String(organization.description);
  assert.equal(description.includes("P5 Home Co LLC"), false);
  assert.match(description, /P5 Home Co, Idaho Registered Contractor #8381215/);
  for (const schema of [home, organization]) {
    assert.equal(/P5 Home Co\.(?:[ \t]+LLC\b|[ \t]+[a-z])/.test(JSON.stringify(schema)), false);
  }
});

test("site pages do not abbreviate the parent name with a period", () => {
  const abbreviated = /P5 Home Co\.(?:[ \t]+LLC\b|[ \t]+[a-z])/;
  const roots = ["app", "components", "lib", "server", "shared"];
  const hits: string[] = [];
  const skip = (rel: string) =>
    rel === "lib/p5" ||
    rel.startsWith("lib/p5/") ||
    rel.startsWith("components/P5");
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (skip(rel)) continue;
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(rel);
      } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && abbreviated.test(readFileSync(rel, "utf8"))) {
        hits.push(rel);
      }
    }
  };
  for (const root of roots) walk(root);
  assert.deepEqual(hits, []);
});

test("public business schema does not expose a private street or home coordinates", () => {
  const home = generateLocalBusinessSchema();
  const area = generateLocalBusinessSchema("Boise");
  assert.equal(area.geo, undefined);
  assert.equal(home.geo, undefined);
  for (const schema of [home, area, generateOrganizationSchema(), generateServiceSchema("Cabinets", "Built to order.")]) {
    assert.equal(new RegExp(`${["wa", "poot"].join("")}|streetAddress|43\\.6515|-116\\.4444|Public representative`, "i").test(JSON.stringify(schema)), false);
  }
});
