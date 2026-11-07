import assert from "node:assert/strict";
import test from "node:test";
import { cabinetLeadTimeLine, cabinetPageFaqContent, cabinetPageInclusions } from "../lib/cabinetPageFaqs";
import { ROOM_CATEGORIES, getRoomBySlug } from "../shared/catalog";
import { BOT05_ROOMS, PANTRY_LEAD_TIME_LINE } from "../shared/content/bot05PageCopy";
import { STANDARD_INCLUSIONS } from "../shared/siteContent";

const WEEK_RANGE = /4-8 weeks|4\u20138 weeks/;
const WARRANTY_LINES = ["Written workmanship guarantee", "Warranty claims handled by us"];

function questions(slug: string): string[] {
  const room = getRoomBySlug(slug);
  assert.ok(room, slug);
  return cabinetPageFaqContent(room).visible.map((faq) => faq.question);
}

test("kitchen and pantry cabinet FAQs differ and match their slugs", () => {
  const kitchen = getRoomBySlug("kitchen");
  const pantry = getRoomBySlug("pantry");
  assert.ok(kitchen && pantry);

  const kitchenFaqs = cabinetPageFaqContent(kitchen);
  const pantryFaqs = cabinetPageFaqContent(pantry);

  assert.deepEqual(
    kitchenFaqs.roomFaqs.map((faq) => faq.question),
    BOT05_ROOMS.kitchen.faqs.map((faq) => faq.question),
  );
  assert.deepEqual(
    pantryFaqs.roomFaqs.map((faq) => faq.question),
    BOT05_ROOMS.pantry.faqs.map((faq) => faq.question),
  );
  assert.notDeepEqual(kitchenFaqs.visible, pantryFaqs.visible);

  assert.deepEqual(kitchenFaqs.visible[0], {
    question: "Can you plan cabinets around my existing kitchen layout?",
    answer:
      "Yes. Keep plumbing and appliances where they work for you, or explore a different layout. We plan cabinets around your room and how you cook and store.",
  });
  assert.deepEqual(kitchenFaqs.visible[1], {
    question: "Can you plan kitchen islands and cabinets for appliance panels?",
    answer:
      "Yes. Add seating and useful storage with an island plan, appliance panels, and tall pantry cabinets arranged around your kitchen.",
  });
  const kitchenSchema = kitchenFaqs.schema as {
    mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
  };
  assert.equal(kitchenSchema.mainEntity[0].name, kitchenFaqs.visible[0].question);
  assert.equal(kitchenSchema.mainEntity[0].acceptedAnswer.text, kitchenFaqs.visible[0].answer);
  assert.equal(kitchenSchema.mainEntity[1].name, kitchenFaqs.visible[1].question);
  assert.equal(kitchenSchema.mainEntity[1].acceptedAnswer.text, kitchenFaqs.visible[1].answer);
  assert.equal(kitchenFaqs.visible.some((faq) => /\bkitchen\b/i.test(faq.question)), true);
  assert.equal(pantryFaqs.visible.some((faq) => /\bpantry\b/i.test(faq.question)), true);
  assert.equal(
    kitchenFaqs.visible.some((faq) => faq.question === "What pantry options do you offer?"),
    false,
  );
  assert.equal(
    kitchenFaqs.visible.some((faq) => faq.question === "Can you design a walk-in pantry?"),
    false,
  );
  assert.equal(
    pantryFaqs.visible.some((faq) => faq.question === "What pantry options do you offer?"),
    true,
  );
  const walkIn = pantryFaqs.visible.find((faq) => faq.question === "Can you design a walk-in pantry?");
  assert.equal(
    walkIn?.answer,
    "Yes, when the room supports it. We plan the layout with you, then plan and install pantry cabinets sized to your space.",
  );

  for (const content of [kitchenFaqs, pantryFaqs]) {
    const schema = content.schema as {
      "@type": string;
      mainEntity: Array<{ name: string; acceptedAnswer: { "@type": string; text: string } }>;
    };
    assert.equal(schema["@type"], "FAQPage");
    assert.deepEqual(
      schema.mainEntity.map((item) => item.name),
      content.visible.map((faq) => faq.question),
    );
    assert.deepEqual(
      schema.mainEntity.map((item) => item.acceptedAnswer.text),
      content.visible.map((faq) => faq.answer),
    );
  }
});

test("other cabinet pages do not share the kitchen or pantry FAQ list", () => {
  const seen = new Map<string, string>();
  for (const room of ROOM_CATEGORIES) {
    const content = cabinetPageFaqContent(room);
    const joined = content.visible.map((faq) => faq.question).join("\n");
    for (const [slug, previous] of seen) {
      assert.notEqual(joined, previous, `${room.slug} renders the same FAQs as ${slug}`);
    }
    seen.set(room.slug, joined);

    const schema = content.schema as {
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>;
    };
    assert.deepEqual(
      schema.mainEntity.map((item) => item.name),
      content.visible.map((faq) => faq.question),
    );
    assert.deepEqual(
      schema.mainEntity.map((item) => item.acceptedAnswer.text),
      content.visible.map((faq) => faq.answer),
    );
  }

  assert.notDeepEqual(questions("kitchen"), questions("pantry"));
  for (const room of ROOM_CATEGORIES) {
    if (room.slug === "kitchen" || room.slug === "pantry") continue;
    assert.notDeepEqual(questions(room.slug), questions("kitchen"), room.slug);
    assert.notDeepEqual(questions(room.slug), questions("pantry"), room.slug);
  }
});

test("pantry lead time and warranty lines are removed only on the pantry page", () => {
  assert.equal(PANTRY_LEAD_TIME_LINE, "Your lead time is confirmed with your quote.");
  assert.equal(cabinetLeadTimeLine("pantry"), PANTRY_LEAD_TIME_LINE);

  const pantrySteps = BOT05_ROOMS.pantry.steps.map((step) => step.desc).join(" ");
  assert.match(pantrySteps, /Your lead time is confirmed with your quote/);
  assert.equal(WEEK_RANGE.test(pantrySteps), false);

  const pantryFaqs = cabinetPageFaqContent(getRoomBySlug("pantry")!);
  const pantryFaqText = pantryFaqs.visible.map((faq) => `${faq.question} ${faq.answer}`).join(" ");
  assert.equal(WEEK_RANGE.test(pantryFaqText), false);
  for (const line of WARRANTY_LINES) assert.equal(pantryFaqText.includes(line), false);

  const pantrySchema = JSON.stringify(pantryFaqs.schema);
  assert.equal(WEEK_RANGE.test(pantrySchema), false);
  for (const line of WARRANTY_LINES) assert.equal(pantrySchema.includes(line), false);

  const pantryInclusions = cabinetPageInclusions("pantry");
  assert.equal(pantryInclusions.length, STANDARD_INCLUSIONS.length - WARRANTY_LINES.length);
  for (const line of WARRANTY_LINES) assert.equal(pantryInclusions.includes(line), false);
  assert.equal(pantryInclusions.some((item) => /warrant/i.test(item)), false);
});
