import assert from "node:assert/strict";
import test from "node:test";
import { phase1Description } from "../lib/phase1SearchCopy";
import { PHASE1_ANSWERS } from "../lib/phase1Answers";
import { generateOrganizationSchema } from "../lib/schema";
import { GBP_BUSINESS_DESCRIPTION } from "../shared/gbpConfig";
import { LLMS_TXT } from "../shared/llmsTxt";
import { HERO_STATS, SITE_TAGLINE } from "../shared/siteContent";
import { getRoomFaqs } from "../shared/catalog/roomFaqs";
import { ROOM_BY_SLUG } from "../shared/catalog/roomCategories";
import {
  IDAHO_REGISTERED_CONTRACTOR,
  publishTrustText,
  showBuildClaims,
  showFinishCounts,
  showFoundingYear,
  showLegacyLicenseWording,
  showLifetimeWarranty,
  showPremierClaim,
  showTestimonials,
} from "../shared/trustFlags";

const FORBIDDEN = [
  /299 finishes/i,
  /hundreds of finishes/i,
  /lifetime warranty/i,
  /lifetime workmanship/i,
  /Licensed, insured/,
  /Idaho's premier/i,
  /Built to order in Meridian/i,
  /fabrication by our own team/i,
  /founded in 2020/i,
  /since 2020/,
  /"foundingDate"/,
  /CNC-routed/,
  /written workmanship guarantee/i,
];

test("trust flags default to hidden and keep the registration wording", () => {
  assert.equal(showFinishCounts(), false);
  assert.equal(showLifetimeWarranty(), false);
  assert.equal(showFoundingYear(), false);
  assert.equal(showBuildClaims(), false);
  assert.equal(showPremierClaim(), false);
  assert.equal(showTestimonials(), false);
  assert.equal(showLegacyLicenseWording(), false);
  assert.equal(IDAHO_REGISTERED_CONTRACTOR, "Idaho Registered Contractor #8381215");
  assert.equal(HERO_STATS.some((stat) => stat.num === "299" || stat.num === "Lifetime"), false);
  assert.equal(/premier/i.test(SITE_TAGLINE), false);
});

test("published cabinet claims omit the unproven phrases", () => {
  const bathroom = getRoomFaqs(ROOM_BY_SLUG.bathroom).map((faq) => `${faq.question} ${faq.answer}`).join(" ");
  const blobs = [
    LLMS_TXT,
    GBP_BUSINESS_DESCRIPTION,
    JSON.stringify(generateOrganizationSchema()),
    JSON.stringify(PHASE1_ANSWERS),
    bathroom,
    publishTrustText("Doors are CNC-routed and hand-finished in our Meridian shop. Hinge boring, overlay, and reveal tolerances are verified against your approved shop drawings before assembly."),
    phase1Description("/catalog") ?? "",
    phase1Description("/shaker-cabinets") ?? "",
    phase1Description("/builders") ?? "",
  ];
  for (const text of blobs) {
    for (const pattern of FORBIDDEN) {
      assert.equal(pattern.test(text), false, `${pattern} in ${text.slice(0, 180)}`);
    }
  }
  const org = JSON.stringify(generateOrganizationSchema());
  assert.equal(org.includes(IDAHO_REGISTERED_CONTRACTOR), true);
  assert.equal(bathroom.includes("installed") || bathroom.includes("installation"), true);
  assert.equal(GBP_BUSINESS_DESCRIPTION.length <= 750, true);
});
