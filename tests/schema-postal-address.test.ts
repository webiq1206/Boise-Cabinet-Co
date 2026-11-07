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

  assert.equal(organization["@type"], "Organization");
  assert.equal("address" in organization, false);
  assertMeridianAddress(home.address);
  assertMeridianAddress(area.address);
  assertMeridianAddress(provider.address);
});

test("area pages name the city in areaServed and use HomeAndConstructionBusiness", () => {
  const area = generateLocalBusinessSchema("Eagle");
  const areas = area.areaServed as Array<{ "@type": string; name: string }>;

  assert.deepEqual(area["@type"], ["HomeAndConstructionBusiness", "GeneralContractor"]);
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
  const areas = home.areaServed as Array<{ "@type": string; name: string }>;
  assert.deepEqual(areas.map((entry) => entry.name), [
    ...BUSINESS_INFO.serviceArea,
    "Ada County",
    "Canyon County",
  ]);
  assert.deepEqual(
    areas.filter((entry) => entry["@type"] === "City").map((entry) => entry.name),
    BUSINESS_INFO.serviceArea,
  );
  assert.deepEqual(
    areas.filter((entry) => entry["@type"] === "AdministrativeArea").map((entry) => entry.name),
    ["Ada County", "Canyon County"],
  );
  assert.equal(JSON.stringify(areas).includes("Garden City"), false);
  assert.equal(home["@id"], "https://boisecabinet.co/#business");
  assert.deepEqual(home["@type"], ["HomeAndConstructionBusiness", "GeneralContractor"]);
  assert.equal(home.telephone, "+1-208-477-1169");
  assert.equal("priceRange" in home, false);
  assert.equal("aggregateRating" in home, false);
  assert.deepEqual(Object.keys(home.address as object).sort(), [
    "@type",
    "addressCountry",
    "addressLocality",
    "addressRegion",
  ]);
  const catalog = home.hasOfferCatalog as {
    itemListElement: Array<{ url: string; itemOffered: { "@type": string } }>;
  };
  const offerUrls = catalog.itemListElement.map((item) => item.url);
  assert.ok(offerUrls.includes("https://boisecabinet.co/services/cabinet-installation"));
  assert.ok(offerUrls.includes("https://boisecabinet.co/cabinets/kitchen"));
  assert.equal(offerUrls.some((url) => url.includes("/catalog") || url.includes("/blog") || url.includes("/guides")), false);
  for (const item of catalog.itemListElement) {
    assert.equal(item.itemOffered["@type"], "Service");
  }
  assert.deepEqual(home.sameAs, BUSINESS_INFO.sameAs);
  assert.deepEqual(home.sameAs, ["https://p5homeco.com"]);
  assert.equal(JSON.stringify(home.sameAs).includes("yelp.com"), false);
  assert.equal(home.parentOrganization, organization.parentOrganization);
  const parent = home.parentOrganization as { "@id": string; name: string; url: string };
  assert.equal(parent["@id"], "https://p5homeco.com/#business");
  assert.equal(parent["@id"], P5_ORG_ID);
  assert.equal(parent.name, "P5 Home Co");
  assert.equal(parent.url, "https://p5homeco.com");
  // Verified P5 profiles, including the existing kgmid entry, stay on the parent.
  // This brand's sameAs is https://p5homeco.com.
  assert.deepEqual((parent as unknown as { sameAs: string[] }).sameAs, [
    "https://www.facebook.com/p5homeco",
    "https://nextdoor.com/pages/boise-remodeling-co-meridian-id/",
    "https://ezlocal.com/id/meridian/home-remodeling/0919899218",
    "https://www.cylex.us.com/company/p5-home-co--llc-40749871.html",
    "https://www.google.com/maps?cid=11869148461693849141",
    "https://www.google.com/search?kgmid=/g/11ntl1t7dc",
  ]);
  for (const own of [home.sameAs]) {
    const serialized = JSON.stringify(own);
    assert.equal(serialized.includes("facebook.com"), false);
    assert.equal(serialized.includes("kgmid"), false);
    assert.equal(serialized.includes("houzz"), false);
    assert.equal(serialized.includes("bbb.org"), false);
    assert.equal(serialized.includes("buildzoom"), false);
    assert.equal(serialized.includes("nextdoor.com"), false);
  }

  assert.deepEqual(Object.keys(organization).sort(), [
    "@context",
    "@type",
    "description",
    "logo",
    "name",
    "parentOrganization",
    "url",
  ]);
  assert.equal(JSON.stringify(organization["@type"]).includes("HomeAndConstructionBusiness"), false);
  assert.equal(JSON.stringify(organization["@type"]).includes("GeneralContractor"), false);

  for (const schema of [home]) {
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
    assert.deepEqual(employee.worksFor, { "@id": "https://p5homeco.com/#business" });
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
