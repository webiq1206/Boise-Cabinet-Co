import assert from "node:assert/strict";
import test from "node:test";
import { generateFAQSchema } from "../lib/schema";
import { getRoomFaqs } from "../shared/catalog/roomFaqs";
import { getRoomBySlug } from "../shared/catalog";
import { formatTypicalRoomRange, getTypicalRoomRange } from "../shared/typicalRoomRange";
import { readFileSync } from "node:fs";

const KITCHEN_QUESTION = "How much do custom kitchen cabinets cost in Boise?";
const RANGE = "$17k to $29k";
const RANGE_PHRASE = `${RANGE} installed, based on a typical size and Better-tier construction`;
const OLD_RANGE = "$15,000 to $45,000";

test("the kitchen FAQ, FAQPage schema, and cost card share one typical range", () => {
  const room = getRoomBySlug("kitchen");
  assert.ok(room);
  const faqs = getRoomFaqs(room);
  const kitchen = faqs.find((faq) => faq.question === KITCHEN_QUESTION);
  assert.ok(kitchen);

  const range = getTypicalRoomRange("kitchen");
  assert.ok(range);
  assert.equal(formatTypicalRoomRange("kitchen"), RANGE);
  assert.equal(kitchen.answer.includes(RANGE_PHRASE), true);
  assert.equal(kitchen.answer.includes(OLD_RANGE), false);
  assert.equal(
    kitchen.answer,
    `Most Treasure Valley kitchen cabinet packages plan from roughly ${RANGE_PHRASE}, depending on linear footage, door style, finish tier, and interior accessories. See our Boise Cabinet Cost Guide for detailed planning bands.`,
  );

  const schema = generateFAQSchema(faqs);
  const entity = schema.mainEntity.find((item) => item.name === KITCHEN_QUESTION);
  assert.ok(entity);
  assert.equal(entity.acceptedAnswer.text, kitchen.answer);
  assert.equal(entity.acceptedAnswer.text.includes(RANGE), true);
  assert.equal(entity.acceptedAnswer.text.includes(OLD_RANGE), false);

  const page = readFileSync("app/cabinets/[room]/page.tsx", "utf8");
  assert.equal(page.includes("formatTypicalRoomRange(room.slug)"), true);
  assert.equal(page.includes("{typicalRange}"), true);
  assert.equal(page.includes("installed, based on a typical size and Better-tier construction."), true);
  assert.equal(page.includes(OLD_RANGE), false);
  assert.equal(page.includes("function getTypicalRoomRange"), false);

  const bathroom = getRoomFaqs(getRoomBySlug("bathroom")!);
  const vanity = bathroom.find((faq) => faq.question === "How much does a custom bathroom vanity cost in Boise?");
  assert.equal(
    vanity?.answer,
    "Single-vanity packages often plan from roughly $2,500 to $8,000+; double vanities and linen towers increase the investment. Finish tier and drawer interiors matter more than width alone.",
  );
});
