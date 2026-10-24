import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_CONFIG } from "../shared/siteConfig.ts";
import {
  BUILT_INS_CABINETS_HEADLINE,
  CABINETS_HUB_HEADLINE,
  ESTIMATE_HEADLINE,
  KITCHEN_CABINETS_HEADLINE,
} from "../lib/aboveFoldHeadlines.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("each first-screen page has one swappable headline and the existing wording", () => {
  assert.equal(CABINETS_HUB_HEADLINE, "Cabinets by room");
  assert.equal(KITCHEN_CABINETS_HEADLINE, "Kitchen cabinets");
  assert.equal(BUILT_INS_CABINETS_HEADLINE, "Built-In cabinets");
  assert.equal(ESTIMATE_HEADLINE, "Get an Estimate");

  const headlines = read("lib/aboveFoldHeadlines.ts");
  assert.equal(headlines.match(/export const /g)?.length, 4);

  assert.match(read("app/cabinets/page.tsx"), /title=\{CABINETS_HUB_HEADLINE\}/);
  assert.match(read("app/cabinets/[room]/page.tsx"), /roomCopy.h1Lead/);
  assert.match(read("app/cabinets/[room]/page.tsx"), /roomCopy.h1Accent/);
  assert.match(read("app/estimate/page.tsx"), /Get an Estimate<\/h1>/);
  assert.match(read("app/estimate/page.tsx"), /KitchenCabinetsQuoteForm/);
  assert.match(read("app/estimate/page.tsx"), /Prefer the guided project flow/);
});

test("call and text links are the site E.164 phone, rendered on each first-screen page", () => {
  assert.equal(SITE_CONFIG.phoneHref, "tel:+12084771169");
  assert.equal(SITE_CONFIG.phoneSmsHref, "sms:+12084771169");
  const actions = read("components/marketing/AboveFoldActions.tsx");
  assert.match(actions, /href=\{SITE_CONFIG\.phoneHref\}/);
  assert.match(actions, /href=\{SITE_CONFIG\.phoneSmsHref\}/);
  assert.match(actions, />\s*Call\s*</);
  assert.match(actions, />\s*Text\s*</);
  for (const path of ["app/cabinets/page.tsx", "app/cabinets/[room]/page.tsx", "app/estimate/page.tsx"]) {
    assert.match(read(path), /AboveFoldActions/);
  }
});
