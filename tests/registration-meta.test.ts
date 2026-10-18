import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateOrganizationSchema } from "../lib/schema";
import { BUSINESS_INFO, generateCityServiceDescription, generateMetaDescription, HOMEPAGE_DESCRIPTION } from "../lib/seo";
import { CLIENT_PRIORITIES } from "../shared/siteContent";
import {
  IDAHO_REGISTERED_CONTRACTOR,
  showUnprovenSatisfactionGuarantee,
} from "../shared/siteConfig";

const NUMBERED = "Idaho Registered Contractor #8381215";

test("the satisfaction guarantee stays hidden unless the flag is exactly true", () => {
  assert.equal(IDAHO_REGISTERED_CONTRACTOR, NUMBERED);
  assert.equal(showUnprovenSatisfactionGuarantee(undefined), false);
  assert.equal(showUnprovenSatisfactionGuarantee(""), false);
  assert.equal(showUnprovenSatisfactionGuarantee("false"), false);
  assert.equal(showUnprovenSatisfactionGuarantee("TRUE"), false);
  assert.equal(showUnprovenSatisfactionGuarantee("true"), true);
});

test("license meta and schema publish the registration number", () => {
  assert.equal(HOMEPAGE_DESCRIPTION.includes(`${NUMBERED} & insured`), true);
  assert.equal(HOMEPAGE_DESCRIPTION.includes("Licensed"), false);
  const city = generateMetaDescription({ serviceName: "", serviceSlug: "", city: "Boise" });
  assert.equal(city.includes(`${NUMBERED}, insured, locally owned`), true);
  const service = generateMetaDescription({ serviceName: "Kitchen Cabinets", serviceSlug: "kitchen-cabinets" });
  assert.equal(service.includes(`${NUMBERED}, insured.`), true);
  assert.equal(service.includes("satisfaction guaranteed"), false);
  const cityService = generateCityServiceDescription("Kitchen Cabinets", "Meridian");
  assert.match(cityService, /Idaho Registered Contractor #8381215/);
  assert.equal(BUSINESS_INFO.insurance, `${NUMBERED} & Insured`);
  const org = String(generateOrganizationSchema().description);
  assert.equal(org.includes(`${NUMBERED}, insured, and committed to quality workmanship.`), true);
  assert.equal(org.includes("craftsmanship"), false);
  assert.equal(org.includes("2020"), false);
  const priority = CLIENT_PRIORITIES.find((item) => item.title === "Trust and credibility");
  assert.equal(
    priority?.body,
    `${NUMBERED}, bonded and insured, with permits handled in-house and a written scope before work begins.`,
  );
});

test("satisfaction guaranteed stays in source and publishes only with the flag", () => {
  const source = readFileSync("lib/seo.ts", "utf8");
  assert.equal(source.includes(', satisfaction guaranteed'), true);
  const prior = process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE;
  process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE = "true";
  try {
    const shown = generateMetaDescription({ serviceName: "Kitchen Cabinets", serviceSlug: "kitchen-cabinets" });
    assert.equal(shown.includes(`${NUMBERED}, insured, satisfaction guaranteed.`), true);
  } finally {
    if (prior === undefined) delete process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE;
    else process.env.SHOW_UNPROVEN_SATISFACTION_GUARANTEE = prior;
  }
});
