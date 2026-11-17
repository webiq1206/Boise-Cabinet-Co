/**
 * The planning range as a structured `estimate` for p5 (owner decision, 13
 * and 17 November 2026): p5 creates the QuickBooks customer and an UNSENT
 * estimate from it.
 *
 * This site's range comes from the visitor's browser and is not recomputed on
 * the server, so the field is never marked verified, carries customer amounts
 * only, and is not sent at all when the numbers do not hold up. Nothing here
 * posts to the live form or the live p5 intake.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSTRUCTION_MULTIPLIER,
  DOOR_STYLE_MULTIPLIER,
  FINISH_CATEGORY_MULTIPLIER,
  FINISH_TIER_MULTIPLIER,
  PROJECT_PRICING,
  PROJECT_SIZE_CONFIG,
  buildCombinedConsultationPayload,
  buildCombinedStoredEstimate,
  buildConsultationEstimatePayload,
  buildStoredEstimate,
  getDefaultSelectionsForProject,
  type ConstructionTier,
  type EstimateSelections,
  type FinishCategory,
  type FinishTier,
  type ProjectType,
} from "../shared/estimateEngine";
import { buildP5DetailsBody, buildP5IntakeBody, type P5SiteEstimate } from "../server/services/p5IntakeBridge";
import {
  MAX_SITE_ESTIMATE_LINES,
  SITE_ESTIMATE_UNVERIFIED_CEILING,
  consultationSiteEstimate,
} from "../server/services/teamEmail";

const INTERNAL_WORDS = /cost|margin|mark[- ]?up|profit|contingenc|overhead/i;
const ALLOWED_KEYS = new Set(["kind", "low", "high", "label", "lines"]);
const ALLOWED_LINE_KEYS = new Set(["title", "description", "amount"]);

const TWO_ROOMS = {
  project: "Kitchen, Primary bath vanity",
  finish: "Kitchen: Modern Shaker · Matte finish ($$) · Better construction · Primary bath vanity: Slab · Stained oak ($$$) · Best construction",
  priceLow: 21400,
  priceHigh: 33900,
  roi: 0,
  sizeLabel: "Kitchen 22 linear ft · Primary bath vanity 6 linear ft",
  confidenceLabel: "Planning range, 2 rooms",
  rooms: [
    { project: "Kitchen", finish: "Modern Shaker · Matte finish ($$) · Better construction", sizeLabel: "22 linear ft", priceLow: 16800, priceHigh: 26200 },
    { project: "Primary bath vanity", finish: "Slab · Stained oak ($$$) · Best construction", sizeLabel: "6 linear ft", priceLow: 4600, priceHigh: 7700 },
  ],
};

/** What p5 does with the field (docs/lead-intake-contract.md there), as far as this site must build to it. */
function assertAcceptedByP5(estimate: P5SiteEstimate, context: string) {
  for (const key of Object.keys(estimate)) assert.ok(ALLOWED_KEYS.has(key), `${context}: unexpected key ${key}`);
  assert.equal(estimate.kind, "planning-range", context);
  assert.equal("verified" in estimate, false, `${context}: this site never claims the figures were verified`);
  assert.equal("base" in estimate, false, context);
  assert.ok(Number.isFinite(estimate.low) && estimate.low > 0, context);
  assert.ok(Number.isFinite(estimate.high) && estimate.high >= estimate.low, context);
  assert.ok(typeof estimate.label === "string" && estimate.label.length > 0 && estimate.label.length <= 200, context);
  assert.doesNotMatch(estimate.label!, /[\r\n\t]/, context);
  let total = (estimate.low + estimate.high) / 2;
  if (estimate.lines) {
    assert.ok(estimate.lines.length > 1 && estimate.lines.length <= MAX_SITE_ESTIMATE_LINES, context);
    for (const line of estimate.lines) {
      for (const key of Object.keys(line)) assert.ok(ALLOWED_LINE_KEYS.has(key), `${context}: unexpected line key ${key}`);
      assert.ok(line.title.length > 0 && line.title.length <= 200, context);
      assert.ok(Number.isFinite(line.amount) && line.amount > 0, context);
      assert.equal(Math.round(line.amount * 100) / 100, line.amount, `${context}: amounts are in cents`);
      assert.match(line.description ?? "", /^Planning range \$[\d,]+ to \$[\d,]+\./, context);
      assert.ok((line.description ?? "").length <= 1000, context);
    }
    total = estimate.lines.reduce((sum, line) => sum + line.amount, 0);
  }
  assert.ok(total >= estimate.low / 2 && total <= estimate.high * 2, `${context}: the total belongs to its range`);
  assert.ok(total <= SITE_ESTIMATE_UNVERIFIED_CEILING, `${context}: under the ceiling for an unverified estimate`);
  assert.doesNotMatch(JSON.stringify(estimate), INTERNAL_WORDS, `${context}: customer amounts only`);
  return total;
}

test("several rooms: the range shown, one line per room at the middle of its range, and no verified flag", () => {
  const estimate = consultationSiteEstimate({ estimate: TWO_ROOMS, requestKind: "request" });
  assert.deepEqual(estimate, {
    kind: "planning-range",
    low: 21400,
    high: 33900,
    label: "Cabinets for 2 rooms: Kitchen, Primary bath vanity",
    lines: [
      {
        title: "Kitchen",
        description: "Planning range $16,800 to $26,200. 22 linear ft, Modern Shaker · Matte finish ($$) · Better construction",
        amount: 21500,
      },
      {
        title: "Primary bath vanity",
        description: "Planning range $4,600 to $7,700. 6 linear ft, Slab · Stained oak ($$$) · Best construction",
        amount: 6150,
      },
    ],
  });
  const total = assertAcceptedByP5(estimate!, "two rooms");
  assert.equal(total, 27650, "the lines add up to the middle of the range the customer was shown, to the cent");
  assert.equal(total, (21400 + 33900) / 2);
});

test("one room, or no room split: the range and a label, no lines", () => {
  const single = { project: "Kitchen Cabinets", finish: "Modern Shaker · Matte finish ($$) · Better construction", priceLow: 17100, priceHigh: 28600, roi: 72, sizeLabel: "24 ft base · 18 ft uppers", confidenceLabel: "Detailed" };
  const expected = {
    kind: "planning-range",
    low: 17100,
    high: 28600,
    label: "Kitchen Cabinets, 24 ft base · 18 ft uppers, Modern Shaker · Matte finish ($$) · Better construction",
  };
  assert.deepEqual(consultationSiteEstimate({ estimate: single }), expected);
  // The wizard's combined payload with one room names that room in every field; the room's own words are used once.
  const oneRoom = {
    ...single,
    project: "Kitchen Cabinets",
    sizeLabel: "Kitchen Cabinets 24 ft base · 18 ft uppers",
    finish: "Kitchen Cabinets: Modern Shaker · Matte finish ($$) · Better construction",
    rooms: [{ project: "Kitchen Cabinets", finish: single.finish, sizeLabel: single.sizeLabel, priceLow: 17100, priceHigh: 28600 }],
  };
  assert.deepEqual(consultationSiteEstimate({ estimate: oneRoom }), expected);
  assertAcceptedByP5(consultationSiteEstimate({ estimate: single })!, "single room");
  // A firm figure (low equals high) and cents are fine.
  assert.deepEqual(consultationSiteEstimate({ estimate: { project: "Pantry", finish: "", priceLow: 4200.456, priceHigh: 4200.456, roi: 0 } }), {
    kind: "planning-range",
    low: 4200.46,
    high: 4200.46,
    label: "Pantry",
  });
  assert.equal(consultationSiteEstimate({ estimate: { priceLow: 4000, priceHigh: 5000 } })?.label, "Cabinet planning range");
});

test("nothing for a request without a range, and nothing for a callback", () => {
  assert.equal(consultationSiteEstimate({ estimate: null }), null);
  assert.equal(consultationSiteEstimate({ estimate: undefined }), null);
  assert.equal(consultationSiteEstimate({}), null);
  assert.equal(consultationSiteEstimate({ estimate: TWO_ROOMS, requestKind: "callback" }), null);
});

test("numbers that do not hold up send no estimate at all, and never throw", () => {
  const room = TWO_ROOMS.rooms[0];
  const other = TWO_ROOMS.rooms[1];
  const bad: Array<[string, unknown]> = [
    ["low is NaN", { ...TWO_ROOMS, priceLow: Number.NaN }],
    ["high is Infinity", { ...TWO_ROOMS, priceHigh: Number.POSITIVE_INFINITY }],
    ["low is zero", { ...TWO_ROOMS, priceLow: 0 }],
    ["low is negative", { ...TWO_ROOMS, priceLow: -21400 }],
    ["high is negative", { ...TWO_ROOMS, priceHigh: -1 }],
    ["low above high", { ...TWO_ROOMS, priceLow: 40000 }],
    ["low is a string", { ...TWO_ROOMS, priceLow: "21400" }],
    ["high is missing", { ...TWO_ROOMS, priceHigh: undefined }],
    ["high is null", { ...TWO_ROOMS, priceHigh: null }],
    ["a room's low above its high", { ...TWO_ROOMS, rooms: [{ ...room, priceLow: 30000 }, other] }],
    ["a room's low is NaN", { ...TWO_ROOMS, rooms: [{ ...room, priceLow: Number.NaN }, other] }],
    ["a room's high is Infinity", { ...TWO_ROOMS, rooms: [room, { ...other, priceHigh: Number.POSITIVE_INFINITY }] }],
    ["a room's low is zero", { ...TWO_ROOMS, rooms: [{ ...room, priceLow: 0 }, other] }],
    ["a room's high is negative", { ...TWO_ROOMS, rooms: [room, { ...other, priceHigh: -7700 }] }],
    ["a room has no prices", { ...TWO_ROOMS, rooms: [{ project: "Kitchen" }, other] }],
    ["a room is not an object", { ...TWO_ROOMS, rooms: [room, "Primary bath vanity"] }],
    ["a room is null", { ...TWO_ROOMS, rooms: [room, null] }],
    ["rooms is not a list", { ...TWO_ROOMS, rooms: { 0: room } }],
    ["a single bad room", { ...TWO_ROOMS, rooms: [{ ...room, priceLow: 30000 }] }],
    ["rooms that do not add up to the total (low)", { ...TWO_ROOMS, priceLow: 9000 }],
    ["rooms that do not add up to the total (high)", { ...TWO_ROOMS, priceHigh: 90000 }],
    ["rooms far above the total", { ...TWO_ROOMS, rooms: [{ ...room, priceLow: 168000, priceHigh: 262000 }, other] }],
    ["more rooms than p5 takes lines", { ...TWO_ROOMS, rooms: Array.from({ length: MAX_SITE_ESTIMATE_LINES + 1 }, () => ({ ...other })) }],
    ["a total above the ceiling for an unverified estimate", { project: "Whole home", finish: "", priceLow: 480000, priceHigh: 620000 }],
    ["rooms that total above the ceiling", { project: "Two", finish: "", priceLow: 500000, priceHigh: 700000, rooms: [{ ...room, priceLow: 250000, priceHigh: 350000 }, { ...other, priceLow: 250000, priceHigh: 350000 }] }],
    ["a string", "21400 to 33900"],
    ["a number", 21400],
    ["a list", [TWO_ROOMS]],
    ["an empty object", {}],
  ];
  for (const [name, estimate] of bad) {
    assert.doesNotThrow(() => consultationSiteEstimate({ estimate }), name);
    assert.equal(consultationSiteEstimate({ estimate }), null, name);
  }

  // A value that throws when read still sends nothing rather than failing the request.
  const hostile = new Proxy({}, { get: () => { throw new Error("boom"); } });
  const { error } = console;
  console.error = () => {};
  try {
    assert.equal(consultationSiteEstimate({ estimate: hostile }), null);
  } finally {
    console.error = error;
  }

  // The checks are not so tight that honest rounding is refused: the wizard rounds the total to $100.
  const rounded = consultationSiteEstimate({ estimate: { ...TWO_ROOMS, priceLow: 21450, priceHigh: 33850 } });
  assert.equal(rounded?.lines?.length, 2);
  // A total just under the ceiling still goes.
  assert.notEqual(consultationSiteEstimate({ estimate: { project: "Whole home", finish: "", priceLow: 400000, priceHigh: 590000 } }), null);
});

test("customer amounts only: no internal figure or word can reach any field", () => {
  // Internal numbers attached to every object the builder is handed: it reads
  // only the customer-facing fields, so none can appear whatever they are called.
  const internal = { cost: 9137, costLow: 9137, costHigh: 14853, margin: 0.3417, marginPercent: 34.17, markup: 1.5231, grossProfit: 7719, profit: 7719, contingency: 0.0817, overhead: 0.1217, roi: 71.3 };
  const loaded = consultationSiteEstimate({
    estimate: { ...TWO_ROOMS, ...internal, rooms: TWO_ROOMS.rooms.map((room) => ({ ...room, ...internal })) },
    ...internal,
  } as Parameters<typeof consultationSiteEstimate>[0]);
  assert.deepEqual(loaded, consultationSiteEstimate({ estimate: TWO_ROOMS }), "internal fields change nothing");
  const json = JSON.stringify(loaded);
  assert.doesNotMatch(json, INTERNAL_WORDS);
  assert.doesNotMatch(json, /9,?137|14,?853|7,?719|3417|34\.17|5231|0817|1217|71\.3/, "none of the internal numbers appear");

  // Free text that names one is left out; the customer's range and amount stay.
  const wordy = consultationSiteEstimate({
    estimate: {
      ...TWO_ROOMS,
      rooms: [
        { ...TWO_ROOMS.rooms[0], project: "Kitchen at cost", finish: "Shaker, our cost $9,137, margin 34%", sizeLabel: "22 linear ft" },
        { ...TWO_ROOMS.rooms[1], sizeLabel: "6 ft plus 8% contingency" },
      ],
    },
  });
  assert.deepEqual(wordy?.lines, [
    { title: "Room 1", description: "Planning range $16,800 to $26,200. 22 linear ft", amount: 21500 },
    { title: "Primary bath vanity", description: "Planning range $4,600 to $7,700. Slab · Stained oak ($$$) · Best construction", amount: 6150 },
  ]);
  assert.equal(wordy?.label, "Cabinets for 2 rooms: Room 1, Primary bath vanity");
  assert.doesNotMatch(JSON.stringify(wordy), INTERNAL_WORDS);
  assert.doesNotMatch(JSON.stringify(wordy), /9,?137|34%|8%/);

  const single = consultationSiteEstimate({ estimate: { project: "Kitchen", finish: "Gross profit 40%", sizeLabel: "Overhead run 12 ft", priceLow: 10000, priceHigh: 14000 } });
  assert.deepEqual(single, { kind: "planning-range", low: 10000, high: 14000, label: "Kitchen" });
});

const ALL_PROJECTS = Object.keys(PROJECT_PRICING) as ProjectType[];
const DOORS = Object.keys(DOOR_STYLE_MULTIPLIER);
const CATEGORIES = Object.keys(FINISH_CATEGORY_MULTIPLIER) as FinishCategory[];
const TIERS = Object.keys(FINISH_TIER_MULTIPLIER) as FinishTier[];
const CONSTRUCTIONS = Object.keys(CONSTRUCTION_MULTIPLIER) as ConstructionTier[];

/** Every project at its smallest, usual and largest size, in every finish and construction. */
function everySelection(): EstimateSelections[] {
  const out: EstimateSelections[] = [];
  for (const project of ALL_PROJECTS) {
    const cfg = PROJECT_SIZE_CONFIG[project];
    const sizes: Array<[number, number | null]> = [
      [cfg.min, cfg.uppers ? 0 : null],
      [cfg.default, cfg.uppers ? cfg.uppers.default : null],
      [cfg.max, cfg.uppers ? cfg.uppers.max : null],
    ];
    for (const [size, sizeUpper] of sizes) {
      for (const finishCategory of CATEGORIES) {
        for (const finishTier of TIERS) {
          for (const construction of CONSTRUCTIONS) {
            const doorStyle = DOORS[out.length % DOORS.length];
            out.push({ ...getDefaultSelectionsForProject(project), size, sizeUpper, doorStyle, finishCategory, finishTier, construction });
          }
        }
      }
    }
  }
  return out;
}

test("the real wizard, every project, finish and size: one room sends its range, with no lines", () => {
  const selections = everySelection();
  assert.ok(selections.length >= ALL_PROJECTS.length * 3 * CATEGORIES.length * TIERS.length * CONSTRUCTIONS.length);
  let checked = 0;
  for (const selection of selections) {
    const payload = buildConsultationEstimatePayload(buildStoredEstimate(selection, 6));
    assert.ok(payload, `${selection.project} prices`);
    const context = `${selection.project} ${selection.size} ${selection.finishCategory} ${selection.finishTier} ${selection.construction}`;
    const estimate = consultationSiteEstimate({ estimate: payload, requestKind: "request" });
    assert.ok(estimate, `${context}: an estimate is sent`);
    assert.equal(estimate.low, payload.priceLow, context);
    assert.equal(estimate.high, payload.priceHigh, context);
    assert.equal(estimate.lines, undefined, context);
    assert.ok(estimate.label!.startsWith(payload.project), context);
    assertAcceptedByP5(estimate, context);
    checked++;
  }
  assert.equal(checked, selections.length);
});

test("the real wizard, rooms combined: the lines add up to the customer's price to the cent", () => {
  const selections = everySelection();
  // Two, three, five and eight rooms, walking the whole list so every selection lands in several mixes.
  const groups: EstimateSelections[][] = [];
  for (const size of [2, 3, 5, 8]) {
    for (let start = 0; start < selections.length; start += 7) {
      groups.push(Array.from({ length: size }, (_, i) => selections[(start + i * 31) % selections.length]));
    }
  }
  let sent = 0;
  let overCeiling = 0;
  for (const [index, rooms] of groups.entries()) {
    const stored = buildCombinedStoredEstimate(rooms);
    const payload = buildCombinedConsultationPayload(stored);
    assert.ok(stored && payload, `group ${index} prices`);
    const context = `group ${index} (${rooms.map((room) => room.project).join(" + ")})`;
    const estimate = consultationSiteEstimate({ estimate: payload, requestKind: "request" });
    const middle = stored.rooms.reduce((sum, room) => sum + (room.priceLow + room.priceHigh) / 2, 0);
    if (middle > SITE_ESTIMATE_UNVERIFIED_CEILING) {
      assert.equal(estimate, null, `${context}: above what p5 takes unverified, so nothing is sent`);
      overCeiling++;
      continue;
    }
    assert.ok(estimate, `${context}: an estimate is sent`);
    assert.equal(estimate.low, payload.priceLow, context);
    assert.equal(estimate.high, payload.priceHigh, context);
    assert.equal(estimate.lines?.length, rooms.length, context);
    const total = assertAcceptedByP5(estimate, context);
    // To the cent: the lines are each room's middle, and they sum to the middle of all rooms.
    assert.equal(Math.round(total * 100), Math.round(middle * 100), context);
    estimate.lines!.forEach((line, i) => {
      const room = stored.rooms[i];
      assert.equal(line.title, room.projectLabel, context);
      assert.equal(line.amount, (room.priceLow + room.priceHigh) / 2, context);
      assert.ok(line.description!.startsWith(`Planning range $${room.priceLow.toLocaleString("en-US")} to $${room.priceHigh.toLocaleString("en-US")}. ${room.sizeLabel}, `), context);
    });
    // And that is the middle of the range the customer was shown (the wizard rounds its total to $100).
    assert.ok(Math.abs(total - (payload.priceLow + payload.priceHigh) / 2) <= 50, context);
    assert.ok(total >= payload.priceLow - 50 && total <= payload.priceHigh + 50, context);
    sent++;
  }
  assert.ok(sent > 200, `checked ${sent} combined estimates`);
  assert.ok(sent + overCeiling === groups.length);
});

test("the bridge body carries the estimate with a Step 1 request only", () => {
  const estimate = consultationSiteEstimate({ estimate: TWO_ROOMS, requestKind: "request" })!;
  const base = { name: "Ada Example", email: "ada@example.com", projectType: "kitchen", inquiryId: "11111111-1111-4111-8111-111111111111" };

  const request = buildP5IntakeBody({ ...base, requestKind: "request", submissionKind: "initial", estimate });
  assert.deepEqual(request.estimate, estimate);
  assert.equal((request.estimate as Record<string, unknown>).verified, undefined);
  assert.equal(request.team_alert, "confirm", "the one-email contract is unchanged");
  assert.deepEqual(buildP5IntakeBody({ ...base, estimate }).estimate, estimate, "an older client with no request kind is a request");

  assert.equal("estimate" in buildP5IntakeBody({ ...base, requestKind: "request" }), false, "no range, no field");
  assert.equal("estimate" in buildP5IntakeBody({ ...base, estimate: null }), false);
  assert.equal("estimate" in buildP5IntakeBody({ ...base, requestKind: "callback", estimate }), false, "never with a callback");
  assert.equal("estimate" in buildP5IntakeBody({ ...base, submissionKind: "details", estimate }), false, "never with Step 2");
  const details = buildP5DetailsBody({ name: "Ada Example", phone: "(208) 555-0100", inquiryId: base.inquiryId, lines: ["Timing: Soon"] });
  assert.equal("estimate" in details, false);

  // Adding the field changes nothing else in the body.
  const { estimate: _sent, ...withField } = request;
  assert.deepEqual(withField, buildP5IntakeBody({ ...base, requestKind: "request", submissionKind: "initial" }));
});
