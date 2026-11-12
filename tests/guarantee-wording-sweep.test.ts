import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DIFFERENTIATORS,
  HOW_WE_BUILD_STEPS,
  PRINCIPLES,
  PROMISE_ITEMS,
  STANDARD_INCLUSIONS,
  TRUST_ITEMS,
} from "../shared/siteContent.ts";
import { HOMEPAGE_FAQS_FOR_SCHEMA, SERVICE_SEO_CONTENT, getCityServiceIntro } from "../shared/seoContent.ts";

const LENGTH = /\b(\d+\s*-?\s*year|\d+\s*yr|lifetime)\b/i;

test("listed guarantee lines use warranty and no coverage length", () => {
  const bodies = [
    DIFFERENTIATORS.find((item) => item.title === "Confidence that outlasts the project")?.body,
    TRUST_ITEMS[3],
    PROMISE_ITEMS.find((item) => item.num === "04")?.title,
    PROMISE_ITEMS.find((item) => item.num === "04")?.body,
    HOW_WE_BUILD_STEPS.find((step) => step.number === "05")?.desc,
    PRINCIPLES.find((item) => item.title === "Workmanship warranty")?.desc,
    SERVICE_SEO_CONTENT["kitchen-remodel"].benefits[3],
    SERVICE_SEO_CONTENT["bathroom-remodel"].benefits[3],
    getCityServiceIntro(SERVICE_SEO_CONTENT["kitchen-remodel"], { name: "Boise", county: "ada", slug: "boise" } as never),
    HOMEPAGE_FAQS_FOR_SCHEMA.find((faq) => faq.question === "What is your workmanship warranty?")?.answer,
  ];
  for (const text of bodies) {
    assert.ok(text, "missing sweep string");
    assert.match(text, /warrant/i);
    assert.equal(/guarantee/i.test(text), false, text);
    assert.equal(LENGTH.test(text), false, text);
    assert.equal(text.includes("\u2014"), false);
    assert.equal(text.includes("\u2013"), false);
  }
  assert.equal(STANDARD_INCLUSIONS[5], "Warranty claims handled by us");
});
