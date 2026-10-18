import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PHASE1_ANSWERS } from "../lib/phase1Answers";
import { generateLocalBusinessSchema, generateOrganizationSchema } from "../lib/schema";
import { foundingYearCopy, showFoundingYear } from "../shared/siteConfig";

test("founding year stays hidden unless the flag is exactly true", () => {
  assert.equal(showFoundingYear(undefined), false);
  assert.equal(showFoundingYear(""), false);
  assert.equal(showFoundingYear("false"), false);
  assert.equal(showFoundingYear("TRUE"), false);
  assert.equal(showFoundingYear("true"), true);
  assert.equal(foundingYearCopy("since 2020", "serving the valley"), "serving the valley");
});

test("published answers and schema omit the 2020 years-in-business claim", () => {
  const org = generateOrganizationSchema();
  const local = generateLocalBusinessSchema();
  assert.equal("foundingDate" in org, false);
  assert.equal("foundingDate" in local, false);
  assert.equal(String(org.description).includes("2020"), false);
  const published = PHASE1_ANSWERS.map((block) =>
    `${block.paragraph} ${block.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(" ")}`,
  ).join("\n");
  assert.equal(published.includes("2020"), false);
  assert.equal(published.includes("founded"), false);
  assert.equal(published.includes("Founded"), false);
});

test("the 2020 wording stays in source", () => {
  const files = [
    "lib/seo.ts",
    "lib/schema.ts",
    "lib/phase1Answers.ts",
    "app/about/page.tsx",
    "components/marketing/GuidePageLayout.tsx",
  ];
  const combined = files.map((file) => readFileSync(file, "utf8")).join("\n");
  for (const phrase of [
    "founded: '2020'",
    "since 2020",
    "Founded in 2020",
    "founded in 2020",
    "Treasure Valley cabinet designers since 2020",
  ]) {
    assert.equal(combined.includes(phrase), true, phrase);
  }
  assert.equal(readFileSync("lib/seo.ts", "utf8").includes("founded: '2020'"), true);
  assert.equal(
    readFileSync("components/marketing/GuidePageLayout.tsx", "utf8").includes("showFoundingYear()"),
    true,
  );
});
