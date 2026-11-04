import assert from "node:assert/strict";
import test from "node:test";
import { SITE } from "../backlink-engine/config";
import { P5_ORG_ID, generateLocalBusinessSchema, generateOrganizationSchema, generateServiceSchema } from "../lib/schema";
import { BUSINESS_INFO } from "../lib/seo";
import { SITE_CONFIG } from "../shared/siteConfig";

const MERIDIAN_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Meridian",
  addressRegion: "ID",
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

test("public contacts retain facts while verification records keep the address", () => {
  assert.equal(SITE.address.street, "4031 W Wapoot St");
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
    "Eagle",
    "Nampa",
    "Kuna",
    "Star",
    "Middleton",
    "Caldwell",
  ]);
  assert.equal(SITE_CONFIG.owner.name, "Nick");

  const home = generateLocalBusinessSchema();
  const organization = generateOrganizationSchema();
  const areas = home.areaServed as Array<{ name: string }>;
  assert.deepEqual(areas.map((entry) => entry.name), BUSINESS_INFO.serviceArea);
  assert.equal(JSON.stringify(areas).includes("Garden City"), false);
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

test("public business schema does not expose a private street or home coordinates", () => {
  const home = generateLocalBusinessSchema();
  const area = generateLocalBusinessSchema("Boise");
  assert.equal(area.geo, undefined);
  assert.equal(home.geo, undefined);
  for (const schema of [home, area, generateOrganizationSchema(), generateServiceSchema("Cabinets", "Built to order.")]) {
    assert.equal(/Wapoot|4031|streetAddress|43\.6515|-116\.4444|Public representative/.test(JSON.stringify(schema)), false);
  }
});
