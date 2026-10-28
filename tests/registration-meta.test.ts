import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateOrganizationSchema } from "../lib/schema";
import { BUSINESS_INFO, generateCityServiceDescription, generateMetaDescription, HOMEPAGE_DESCRIPTION } from "../lib/seo";
import { CLIENT_PRIORITIES } from "../shared/siteContent";
import {
  IDAHO_REGISTERED_CONTRACTOR,
  REGISTERED_BONDED_INSURED,
} from "../shared/claims";

test("license meta and schema publish the registration number", () => {
  assert.match(HOMEPAGE_DESCRIPTION, /P5 Home Co LLC, Idaho Registered Contractor #8381215/);
  assert.ok(HOMEPAGE_DESCRIPTION.length <= 160);
  assert.equal(HOMEPAGE_DESCRIPTION.includes("Licensed"), false);
  const city = generateMetaDescription({ serviceName: "", serviceSlug: "", city: "Boise" });
  assert.equal(city.includes(REGISTERED_BONDED_INSURED), true);
  const service = generateMetaDescription({ serviceName: "Kitchen Cabinets", serviceSlug: "kitchen-cabinets" });
  assert.equal(service.includes(`${REGISTERED_BONDED_INSURED}.`), true);
  assert.equal(service.includes("satisfaction guaranteed"), false);
  const cityService = generateCityServiceDescription("Kitchen Cabinets", "Meridian");
  assert.match(cityService, /Idaho Registered Contractor #8381215/);
  assert.equal(BUSINESS_INFO.insurance, REGISTERED_BONDED_INSURED);
  const org = String(generateOrganizationSchema().description);
  assert.equal(org.includes(`${REGISTERED_BONDED_INSURED}.`), true);
  assert.equal(org.includes("craftsmanship"), false);
  assert.equal(org.includes("2020"), false);
  const priority = CLIENT_PRIORITIES.find((item) => item.title === "Trust and credibility");
  assert.equal(
    priority?.body,
    `${REGISTERED_BONDED_INSURED}, with permits handled in-house and a written scope before work begins.`,
  );
  assert.equal(IDAHO_REGISTERED_CONTRACTOR, "P5 Home Co LLC, Idaho Registered Contractor #8381215");
});

test("current main metadata never restores unapproved satisfaction claims", () => {
 const prior = process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE;
 try {
  for (const flag of [undefined, "false", "true"]) {
   if (flag === undefined) delete process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE;
   else process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE = flag;
   for (const city of [undefined, "Star", "Meridian"]) {
    const description = generateMetaDescription({ serviceName: "Kitchen Cabinets", serviceSlug: "kitchen-cabinets", city });
    assert.match(description, /Idaho Registered Contractor #8381215/);
    assert.doesNotMatch(description, /satisfaction guaranteed|shop-built/i);
    assert.ok(description.length <= 160);
   }
  }
 } finally {
  if (prior === undefined) delete process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE;
  else process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE = prior;
 }
});
