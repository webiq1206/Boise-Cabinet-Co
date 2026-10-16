import assert from "node:assert/strict";
import test from "node:test";
import {
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "../lib/schema";

const MERIDIAN_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Meridian",
  addressRegion: "ID",
  addressCountry: "US",
};

function assertMeridianAddress(address: unknown) {
  assert.deepEqual(address, MERIDIAN_ADDRESS);
  const record = address as Record<string, unknown>;
  assert.equal(record.streetAddress, undefined);
  assert.equal(record.postalCode, undefined);
}

test("every business postal address is the Meridian locality", () => {
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

test("area-page geo stays on the Meridian locality", () => {
  const home = generateLocalBusinessSchema();
  const area = generateLocalBusinessSchema("Boise");
  assert.deepEqual(area.geo, home.geo);
  const geo = area.geo as { latitude: number; longitude: number };
  assert.equal(geo.latitude, 43.6121);
  assert.equal(geo.longitude, -116.3915);
});
