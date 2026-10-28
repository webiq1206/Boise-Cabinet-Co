import assert from "node:assert/strict";
import test from "node:test";
import {
  BOT05_LOCATIONS,
  BOT05_ROOMS,
  BUILD_CABINETS_ANSWER,
  DEPOSIT_TO_LOCK_ORDER,
} from "../shared/content/bot05PageCopy";

const FORBIDDEN = [
  /\u2014/,
  new RegExp("&" + "mdash;|" + "&" + "#8212;", "i"),
  /lock production/i,
  /lifetime/i,
  /\blicensed\b/i,
  /founded in 2020/i,
  /\bwe source\b/i,
  /\bdo not fabricate\b/i,
  /ready-to-assemble/i,
  /near me/i,
  /bonded and insured/i,
  /Design Studio/i,
  /client portal/i,
];

function walk(value: unknown, found: string[]) {
  if (typeof value === "string") {
    for (const pattern of FORBIDDEN) {
      if (pattern.test(value)) found.push(`${pattern}: ${value}`);
    }
    if (/\bfabricat/i.test(value)) {
      found.push(`fabrication claim: ${value}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, found));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => walk(item, found));
  }
}

test("BOT-05 customer build answer is exact and deposit wording is locked", () => {
  assert.match(BUILD_CABINETS_ANSWER, /designs custom cabinets to your measurements/);
  for (const copy of Object.values(BOT05_ROOMS)) {
    const answer = copy.faqs.find((faq) => faq.question === "Do you build cabinets?")?.answer;
    assert.equal(answer, BUILD_CABINETS_ANSWER);
  }
  assert.equal(
    BOT05_LOCATIONS.boise.faqs?.find((faq) => faq.question === "Do you build cabinets?")?.answer,
    BUILD_CABINETS_ANSWER,
  );
  const steps = [
    ...(BOT05_LOCATIONS.boise.steps ?? []),
    ...BOT05_ROOMS.kitchen.steps,
    ...BOT05_ROOMS.pantry.steps,
  ].map((step) => step.desc).join(" ");
  assert.match(steps, new RegExp(DEPOSIT_TO_LOCK_ORDER));
  assert.equal(steps.includes("lock production"), false);
});

test("BOT-05 page copy stays inside D1 identity claims", () => {
  const hits: string[] = [];
  walk(BOT05_LOCATIONS, hits);
  walk(BOT05_ROOMS, hits);
  assert.deepEqual(hits, []);
});

test("BOT-05 meta descriptions sit in the click range", () => {
  const descriptions = [
    BOT05_LOCATIONS.boise.description,
    BOT05_LOCATIONS.meridian.description,
    BOT05_LOCATIONS.middleton.description,
    BOT05_LOCATIONS.kuna.description,
    BOT05_ROOMS.kitchen.description,
    BOT05_ROOMS.pantry.description,
  ];
  for (const description of descriptions) {
    assert.ok(description);
    assert.ok(description.length >= 150 && description.length <= 160, `${description.length} ${description}`);
  }
});
