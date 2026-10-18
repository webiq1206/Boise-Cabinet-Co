import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PHASE1_ANSWERS } from "../lib/phase1Answers";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "../lib/schema";
import { GBP_BUSINESS_DESCRIPTION, GBP_COMPLETENESS_CHECKLIST } from "../shared/gbpConfig";
import { LLMS_TXT } from "../shared/llmsTxt";
import { foundingYearCopy, showFoundingYear } from "../shared/siteConfig";

test("founding year stays hidden unless the flag is exactly true", () => {
  assert.equal(showFoundingYear(undefined), false);
  assert.equal(showFoundingYear(""), false);
  assert.equal(showFoundingYear("false"), false);
  assert.equal(showFoundingYear("TRUE"), false);
  assert.equal(showFoundingYear("true"), true);
  assert.equal(foundingYearCopy("since 2020", "serving the valley"), "serving the valley");
});

test("published pages and schema omit the 2020 years-in-business claim", () => {
  const org = generateOrganizationSchema();
  const local = generateLocalBusinessSchema();
  assert.equal("foundingDate" in org, false);
  assert.equal("foundingDate" in local, false);
  assert.equal(String(org.description).includes("2020"), false);
  assert.equal(LLMS_TXT.includes("Founded: 2020"), false);
  assert.equal(GBP_BUSINESS_DESCRIPTION.includes("Founded in 2020"), false);
  assert.equal(GBP_COMPLETENESS_CHECKLIST.includes("Opening date: 2020"), false);
  const published = PHASE1_ANSWERS.map((block) =>
    `${block.paragraph} ${block.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ")}`,
  ).join("\n");
  assert.equal(published.includes("2020"), false);
  assert.equal(published.includes("founded"), false);
});

test("the 2020 wording stays in source", () => {
  const files = [
    "lib/seo.ts",
    "lib/schema.ts",
    "lib/phase1Answers.ts",
    "shared/llmsTxt.ts",
    "shared/gbpConfig.ts",
    "shared/siteContent.ts",
    "shared/foundingYearSource.ts",
    "app/about/page.tsx",
    "components/marketing/GuidePageLayout.tsx",
  ];
  const combined = files.map((file) => readFileSync(file, "utf8")).join("\n");
  for (const phrase of [
    "founded: '2020'",
    "since 2020",
    "Founded: 2020",
    "Founded in 2020",
    "Opening date: 2020",
    "openingDate: \"2020\"",
    "Founded Boise Cabinet Co in 2020",
    "Est. 2020",
    "EST 2020",
    "Treasure Valley cabinet designers since 2020",
  ]) {
    assert.equal(combined.includes(phrase), true, phrase);
  }
  assert.equal(readFileSync("public/brand/BRAND.md", "utf8").includes("2020"), false);
  assert.equal(readFileSync("public/brand/brand-kit.html", "utf8").includes("2020"), false);
});
