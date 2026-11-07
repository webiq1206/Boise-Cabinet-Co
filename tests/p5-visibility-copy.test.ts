import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { KITCHEN_CABINETS_LANDING_TRUST, REGISTERED_BONDED_INSURED } from "../shared/claims";
import { BOT05_LOCATIONS, BOT05_ROOMS, LEAD_TIME_LINE } from "../shared/content/bot05PageCopy";
import { HOMEPAGE_FAQS } from "../shared/homepageFaqs";
import { PHASE1_DESCRIPTIONS } from "../lib/phase1SearchCopy";
import { ROOM_SEO } from "../shared/catalog/roomSeo";

const BRAND = " | Boise Cabinet Co";
const QUOTE_LEAD =
  "Your cabinets are built to order, so your lead time is confirmed with your quote. Scope, elevations and finish selections are documented in writing before production starts.";

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

test("visibility titles, metas and answer blocks use the reviewed wording", () => {
  assert.equal(ROOM_SEO.kitchen.title + BRAND, "Custom Kitchen Cabinets in Boise | Boise Cabinet Co");
  assert.equal(ROOM_SEO.kitchen.description, BOT05_ROOMS.kitchen.description);
  assert.equal(ROOM_SEO.pantry.title + BRAND, "Custom Pantry Cabinets in Boise | Boise Cabinet Co");
  assert.equal(PHASE1_DESCRIPTIONS["/cabinets/pantry"], BOT05_ROOMS.pantry.description);
  assert.equal(BOT05_LOCATIONS.boise.title, "Custom Cabinets in Boise, ID, Installed by Our Crew");
  assert.equal(BOT05_LOCATIONS.kuna.title + BRAND, "Kitchen and Garage Cabinets in Kuna, ID | Boise Cabinet Co");
  assert.equal(BOT05_LOCATIONS.middleton.title + BRAND, "Garage Cabinets and Pantries in Middleton | Boise Cabinet Co");
  assert.equal(BOT05_LOCATIONS.meridian.title + BRAND, "Custom Cabinet Company in Meridian, ID | Boise Cabinet Co");

  const answers = [
    BOT05_LOCATIONS.boise.answer,
    BOT05_LOCATIONS.kuna.answer,
    BOT05_LOCATIONS.middleton.answer,
    BOT05_LOCATIONS.meridian.answer,
    BOT05_ROOMS.kitchen.answer,
    BOT05_ROOMS.pantry.answer,
  ];
  for (const answer of answers) {
    assert.ok(answer);
    const count = words(answer);
    assert.ok(count >= 40 && count <= 60, `${count} ${answer}`);
    assert.equal(answer.includes("\u2014"), false);
    assert.equal(answer.includes("\u2013"), false);
    assert.equal(/bonded/i.test(answer), false);
    assert.equal(answer.includes("8381215"), false);
  }
});

test("homepage drops the finish and door-count tiles from the FAQ wording", () => {
  const joined = HOMEPAGE_FAQS.map((faq) => `${faq.q} ${faq.a}`).join(" ");
  assert.equal(joined.includes("299 finishes"), false);
  assert.equal(joined.includes("six door styles"), false);
  assert.equal(joined.includes("6 door styles"), false);
  assert.equal(
    HOMEPAGE_FAQS.find((faq) => faq.q === "Do you work with builders and contractors?")?.a,
    "Yes. Builders and contractors can send plans for kitchens, vanities and built-ins, and we return a written proposal with drawings before anything is ordered.",
  );
  assert.equal(HOMEPAGE_FAQS.find((faq) => faq.q === "When will my cabinets be ready?")?.a, QUOTE_LEAD);
});

test("kitchen FAQs stay on the existing list and pantry only appends", () => {
  assert.equal(BOT05_ROOMS.kitchen.faqs[0]?.question, "What pantry options do you offer?");
  assert.equal(BOT05_ROOMS.kitchen.faqs.some((faq) => faq.question === "Can you replace builder-grade kitchen cabinets?"), false);
  assert.equal(
    BOT05_ROOMS.pantry.faqs.at(-2)?.question,
    "Can you design a pantry with floor-to-ceiling storage?",
  );
  assert.equal(BOT05_ROOMS.pantry.faqs.at(-1)?.answer, QUOTE_LEAD);
  assert.equal(LEAD_TIME_LINE, "Lead time from approved design is typically 4-8 weeks.");
  assert.match(BOT05_ROOMS.pantry.steps.map((step) => step.desc).join(" "), /4-8 weeks/);
});

test("ad landing trust line is separate from the numbered registration line", () => {
  assert.equal(
    KITCHEN_CABINETS_LANDING_TRUST,
    "P5 Home Co LLC, an Idaho registered contractor. Insured; certificate on request.",
  );
  assert.equal(KITCHEN_CABINETS_LANDING_TRUST.includes("8381215"), false);
  assert.equal(/bonded/i.test(KITCHEN_CABINETS_LANDING_TRUST), false);
  assert.match(REGISTERED_BONDED_INSURED, /#8381215/);
  const landing = readFileSync("app/kitchen-cabinets/page.tsx", "utf8");
  assert.equal(landing.includes("REGISTERED_BONDED_INSURED"), false);
  assert.match(landing, /KITCHEN_CABINETS_LANDING_TRUST/);
  assert.match(landing, /Yes\. \$\{KITCHEN_CABINETS_LANDING_TRUST\}/);
});
