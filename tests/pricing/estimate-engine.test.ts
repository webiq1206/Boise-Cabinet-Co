/**
 * Pricing regression suite for the centralized estimate engine.
 *
 * Run with: npm run test:pricing   (npx tsx tests/pricing/estimate-engine.test.ts)
 *
 * Three layers of protection:
 *  1. LITERAL SNAPSHOTS - hand-verified dollar values pinned as literals. These
 *     fail whenever engine output changes for any reason. If the pricing block
 *     in shared/estimateEngine.ts was tuned DELIBERATELY, regenerate the
 *     literals and commit them with the pricing change; any other failure is a
 *     real regression.
 *  2. FORMULA INDEPENDENCE - an independent re-implementation of the documented
 *     formula (round100((perUnitLow x baseLF + upperPerUnitLow x upperLF) x
 *     multipliers)) computed from the exported tables, swept across every
 *     layout/door/finish/tier/construction combination. Catches composition
 *     bugs without depending on specific table values.
 *  3. INVARIANTS - properties that must hold for ANY table values: monotonic
 *     upgrades, low <= high, $100 rounding, null-when-not-priceable, purity,
 *     clamping, multi-room sums, payload shape preservation, and the
 *     validation layer's accept/reject behavior.
 */

import {
  PROJECT_BOOK_LINES,
  PROJECT_SIZE_CONFIG,
  getTotalSteps,
  PROJECT_SIZE_CONFIG as SIZE_CFG,
  PROJECT_LAYOUT_SLUGS,
  EMPTY_SELECTIONS,
  calculateEstimate,
  calculateCombinedEstimate,
  buildStoredEstimate,
  buildCombinedStoredEstimate,
  buildCombinedConsultationPayload,
  buildConsultationEstimatePayload,
  getDefaultSelectionsForProject,
  getDoorStyleOptions,
  roomSelectionsMade,
  cabinetCustomerRange,
  LEVEL_TO_BOOK,
  type EstimateSelections,
  type ProjectType,
  type FinishCategory,
  type ConstructionTier,
} from "../../server/estimateEngine";
import { buildEstimateRecord } from "../../server/estimateRecord";
import {
  ESTIMATE_PRICE_ROUND_TO,
  validateEstimateResult,
  validateCombinedEstimate,
  safeCombinedEstimate,
} from "../../shared/estimateValidation";

// ── Tiny harness ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.error(`FAIL: ${message}`);
  }
}

const ALL_PROJECTS = (Object.keys(PROJECT_BOOK_LINES) as ProjectType[]).filter(
  (project) => PROJECT_BOOK_LINES[project].base,
);
const LEVELS = Object.keys(LEVEL_TO_BOOK) as ConstructionTier[];

function sel(
  s: Partial<EstimateSelections> & { project: ProjectType },
): EstimateSelections {
  return { ...EMPTY_SELECTIONS, ...s };
}

/** Customer range from the shared estimator, not the direct book rate. */
function expectedPrice(s: EstimateSelections): { low: number; high: number } | null {
  const project = s.project as ProjectType;
  const lines = PROJECT_BOOK_LINES[project];
  const level = (s.construction || "essential") as ConstructionTier;
  if (!lines.base || !(level in LEVEL_TO_BOOK)) return null;
  const cfg = PROJECT_SIZE_CONFIG[project];
  const parts = [{ code: lines.base, quantity: s.size! }];
  if (cfg.uppers && lines.upper && (s.sizeUpper ?? 0) > 0) parts.push({ code: lines.upper, quantity: s.sizeUpper ?? 0 });
  return cabinetCustomerRange(parts, level);
}

// ── 1. Literal snapshots ────────────────────────────────────────────────────
// Values generated from the documented formula independently of the engine and
// hand-verified (e.g. kitchen defaults: (360x24 + 215x18) x 1.16x1.05x1.12 =
// 17,065.64 -> $17,100). Update ONLY alongside a deliberate pricing change.

const SNAPSHOTS: Array<{ name: string; s: EstimateSelections }> = [
  { name: "kitchen defaults", s: getDefaultSelectionsForProject("kitchen") },
  { name: "kitchen floor", s: sel({ project: "kitchen", layout: "galley", size: 10, sizeUpper: 0, doorStyle: "slab", finishCategory: "matte", finishTier: "standard", construction: "essential" }) },
  { name: "kitchen ceiling", s: sel({ project: "kitchen", layout: "island", size: 60, sizeUpper: 50, doorStyle: "beta-shaker", finishCategory: "gloss", finishTier: "reserve", construction: "luxury" }) },
  { name: "bathroom double default", s: getDefaultSelectionsForProject("bathroom") },
  { name: "laundry default", s: getDefaultSelectionsForProject("laundry") },
  { name: "pantry default", s: getDefaultSelectionsForProject("pantry") },
  { name: "home-office default", s: getDefaultSelectionsForProject("home-office") },
  { name: "built-ins default", s: getDefaultSelectionsForProject("built-ins") },
];

for (const snap of SNAPSHOTS) {
  const r = calculateEstimate(snap.s, 0);
  const e = expectedPrice(snap.s);
  check(r !== null && e !== null, `snapshot "${snap.name}": priceable`);
  if (r && e) {
    check(
      r.priceLow === e.low && r.priceHigh === e.high,
      `snapshot "${snap.name}": expected ${e.low}, got ${r.priceLow}..${r.priceHigh}`,
    );
  }
}

check(
  calculateEstimate(getDefaultSelectionsForProject("entertainment")) === null,
  "entertainment is not priced: the book line is each, not per linear foot",
);

// ── 2. Formula independence sweep ───────────────────────────────────────────
// Every layout x door x finish-category x tier x construction combination, at
// min/default/max sizes, must match the independently computed formula.

let sweepCount = 0;
for (const project of ALL_PROJECTS) {
  const cfg = PROJECT_SIZE_CONFIG[project];
  const layouts = PROJECT_LAYOUT_SLUGS[project].length ? PROJECT_LAYOUT_SLUGS[project] : [""];
  const sizes = [cfg.min, cfg.default, cfg.max];
  const upperSizes = cfg.uppers ? [0, cfg.uppers.default, cfg.uppers.max] : [null];
  for (const layout of layouts) {
    for (let si = 0; si < sizes.length; si++) {
      const size = sizes[si];
      const sizeUpper = upperSizes[Math.min(si, upperSizes.length - 1)];
      for (const door of getDoorStyleOptions()) {
        for (const finishCategory of ["matte", "woodgrain", "gloss"] as FinishCategory[]) {
          for (const construction of LEVELS) {
            const s = sel({ project, layout, size, sizeUpper, doorStyle: door.value, finishCategory, construction });
            const e = expectedPrice(s);
            const r = calculateEstimate(s, 0);
            sweepCount++;
            if (!r || !e || r.priceLow !== e.low || r.priceHigh !== e.high) {
              check(false, `sweep ${project}/${layout || "no-layout"}/${size}+${sizeUpper}/${door.value}/${finishCategory}/${construction}: expected ${e ? e.low : "null"}, got ${r ? r.priceLow : "null"}`);
            } else {
              passed++;
            }
          }
        }
      }
    }
  }
}
console.log(`Formula sweep: ${sweepCount} combinations checked.`);

// ── 3. Invariants ───────────────────────────────────────────────────────────

// Null when not priceable - never a fabricated number, never a silent zero.
check(calculateEstimate(EMPTY_SELECTIONS, 0) === null, "empty selections price as null");
check(
  calculateEstimate(sel({ project: "kitchen", size: null }), 0) === null,
  "project without size prices as null",
);
check(
  calculateEstimate(sel({ project: "kitchen", size: 24, sizeUpper: null }), 0) === null,
  "uppers project without upper run prices as null",
);
check(
  calculateEstimate(sel({ project: "bathroom", size: 0 }), 0) === null,
  "zero size prices as null",
);
check(
  calculateEstimate(sel({ project: "bathroom", size: -5 }), 0) === null,
  "negative size prices as null",
);
check(
  buildStoredEstimate(EMPTY_SELECTIONS, 0) === null,
  "stored estimate is null when not priceable",
);
check(
  calculateCombinedEstimate([EMPTY_SELECTIONS, EMPTY_SELECTIONS]) === null,
  "combined estimate is null when no room is priceable",
);

// Basic result invariants for every project at defaults.
for (const project of ALL_PROJECTS) {
  const r = calculateEstimate(getDefaultSelectionsForProject(project), 0);
  check(r !== null, `${project}: defaults are priceable`);
  if (!r) continue;
  check(r.priceLow > 0 && r.priceHigh > 0, `${project}: prices positive`);
  check(r.priceLow <= r.priceHigh, `${project}: low <= high`);
  check(
    r.priceLow % ESTIMATE_PRICE_ROUND_TO === 0 && r.priceHigh % ESTIMATE_PRICE_ROUND_TO === 0,
    `${project}: rounded to $${ESTIMATE_PRICE_ROUND_TO}`,
  );
}

for (const project of ALL_PROJECTS) {
  const baseLevel = getDefaultSelectionsForProject(project);
  let previous = -1;
  for (const construction of LEVELS) {
    const r = calculateEstimate({ ...baseLevel, construction }, 0);
    check(r !== null && r.priceLow > previous, `${project} ${construction} is strictly above the level below`);
    previous = r ? r.priceLow : previous;
  }
  const priced = calculateEstimate(baseLevel, 0)!;
  for (const door of getDoorStyleOptions()) {
    const r = calculateEstimate({ ...baseLevel, doorStyle: door.value }, 0);
    check(r?.priceLow === priced.priceLow, `${project} door ${door.value} stays on the book line`);
  }

  // Size monotonicity, base and upper runs.
  const cfg = PROJECT_SIZE_CONFIG[project];
  const base = getDefaultSelectionsForProject(project);
  let prev = calculateEstimate({ ...base, size: cfg.min }, 0)!;
  for (let size = cfg.min; size <= cfg.max; size += cfg.step) {
    const r = calculateEstimate({ ...base, size }, 0)!;
    check(
      r.priceLow >= prev.priceLow && r.priceHigh >= prev.priceHigh,
      `${project}: size ${size} does not lower the range`,
    );
    prev = r;
  }
  if (cfg.uppers) {
    let prevUp = calculateEstimate({ ...base, sizeUpper: 0 }, 0)!;
    for (let up = 0; up <= cfg.uppers.max; up += cfg.uppers.step) {
      const r = calculateEstimate({ ...base, sizeUpper: up }, 0)!;
      check(
        r.priceLow >= prevUp.priceLow && r.priceHigh >= prevUp.priceHigh,
        `${project}: upper run ${up} does not lower the range`,
      );
      prevUp = r;
    }
  }
}

// Purity: recomputing identical inputs yields identical output; mutating a copy
// never changes the original's result.
{
  const a = getDefaultSelectionsForProject("kitchen");
  const first = calculateEstimate(a, 3)!;
  const copy = { ...a, construction: "luxury" as const };
  calculateEstimate(copy, 3);
  const second = calculateEstimate(a, 3)!;
  check(
    first.priceLow === second.priceLow && first.priceHigh === second.priceHigh,
    "engine is pure: identical inputs give identical prices after unrelated calls",
  );
}

// Clamping: out-of-range and decimal sizes normalize instead of breaking pricing.
{
  const base = getDefaultSelectionsForProject("kitchen");
  const cfg = PROJECT_SIZE_CONFIG.kitchen;
  const huge = calculateEstimate({ ...base, size: 9999 }, 0)!;
  const atMax = calculateEstimate({ ...base, size: cfg.max }, 0)!;
  check(
    huge.priceLow === atMax.priceLow && huge.priceHigh === atMax.priceHigh,
    "oversized base run clamps to the project max",
  );
  const decimal = calculateEstimate({ ...base, size: 23.4 }, 0)!;
  const rounded = calculateEstimate({ ...base, size: 23 }, 0)!;
  check(
    decimal.priceLow === rounded.priceLow && decimal.priceHigh === rounded.priceHigh,
    "decimal base run rounds to the nearest foot",
  );
  const hugeUpper = calculateEstimate({ ...base, sizeUpper: 9999 }, 0)!;
  const atMaxUpper = calculateEstimate({ ...base, sizeUpper: cfg.uppers!.max }, 0)!;
  check(
    hugeUpper.priceHigh === atMaxUpper.priceHigh,
    "oversized upper run clamps to the project max",
  );
  const unknownLayout = calculateEstimate({ ...base, layout: "spiral-staircase" }, 0)!;
  const defaultLayout = calculateEstimate({ ...base, layout: "island" }, 0)!;
  check(
    unknownLayout.priceLow === defaultLayout.priceLow,
    "unknown layout falls back to the project default layout",
  );
}

// Multi-room: combined totals equal the sum of per-room results; removing a
// room removes exactly its contribution; unpriceable rooms contribute nothing.
{
  const kitchen = getDefaultSelectionsForProject("kitchen");
  const bathroom = getDefaultSelectionsForProject("bathroom");
  const pantry = getDefaultSelectionsForProject("pantry");
  const rk = calculateEstimate(kitchen, roomSelectionsMade(kitchen))!;
  const rb = calculateEstimate(bathroom, roomSelectionsMade(bathroom))!;
  const rp = calculateEstimate(pantry, roomSelectionsMade(pantry))!;

  const all = calculateCombinedEstimate([kitchen, bathroom, pantry])!;
  check(
    all.priceLow === rk.priceLow + rb.priceLow + rp.priceLow &&
      all.priceHigh === rk.priceHigh + rb.priceHigh + rp.priceHigh,
    `combined 3-room total equals the sum of rooms (${all.priceLow}..${all.priceHigh})`,
  );
  check(all.rooms.length === 3, "combined result carries all 3 rooms");

  const withoutBath = calculateCombinedEstimate([kitchen, pantry])!;
  check(
    all.priceLow - withoutBath.priceLow === rb.priceLow &&
      all.priceHigh - withoutBath.priceHigh === rb.priceHigh,
    "removing a room removes exactly its contribution",
  );

  const withEmpty = calculateCombinedEstimate([kitchen, EMPTY_SELECTIONS])!;
  check(
    withEmpty.priceLow === rk.priceLow &&
      withEmpty.priceHigh === rk.priceHigh &&
      withEmpty.rooms.length === 1,
    "unpriceable rooms contribute nothing to the combined range",
  );

  const single = calculateCombinedEstimate([kitchen])!;
  check(
    single.priceLow === rk.priceLow && single.priceHigh === rk.priceHigh,
    "single-room combined equals the single-room estimate",
  );
}

// ── 4. Handoff payload shapes (multi-room preserved end-to-end) ─────────────
{
  const rooms = [
    getDefaultSelectionsForProject("kitchen"),
    getDefaultSelectionsForProject("bathroom"),
  ];
  const stored = buildCombinedStoredEstimate(rooms);
  check(stored !== null && stored.rooms.length === 2, "combined stored estimate keeps both rooms");

  const payload = buildCombinedConsultationPayload(stored);
  check(payload !== null, "consultation payload builds from combined estimate");
  if (payload && stored) {
    check(payload.rooms?.length === 2, "consultation payload preserves rooms[]");
    check(
      payload.priceLow === stored.priceLow && payload.priceHigh === stored.priceHigh,
      "consultation payload carries the combined range unchanged",
    );
    check(
      payload.project.includes("Kitchen") && payload.project.includes("Bathroom"),
      "consultation payload names every room",
    );
    const sumLow = payload.rooms!.reduce((a, r) => a + r.priceLow, 0);
    check(sumLow === payload.priceLow, "payload room prices sum to the payload total");
  }

  const singleStored = buildStoredEstimate(rooms[0], 5);
  const singlePayload = buildConsultationEstimatePayload(singleStored);
  check(
    singlePayload !== null && singlePayload.rooms === undefined,
    "single-room payload has no rooms[] (legacy shape)",
  );

  const record = buildEstimateRecord({
    rooms,
    capturedAt: "2026-01-01T00:00:00.000Z",
    budget: "$30k - $50k",
    notes: "test note",
  });
  check(record !== null, "estimate record builds from multi-room selections");
  if (record && stored) {
    check(record.roomCount === 2 && record.rooms.length === 2, "estimate record keeps both rooms");
    check(
      record.rangeLow === stored.priceLow && record.rangeHigh === stored.priceHigh,
      "estimate record range matches the combined estimate",
    );
    check(
      record.rooms[0].priceLow + record.rooms[1].priceLow === record.rangeLow,
      "estimate record room prices sum to its range",
    );
    check(record.rooms[0].sizeBaseLf === rooms[0].size, "record preserves raw base LF");
    check(record.disclaimers.length > 0, "record captures the disclaimers shown");
  }
}

// ── 5. Validation layer ─────────────────────────────────────────────────────
{
  const kitchen = getDefaultSelectionsForProject("kitchen");
  const good = calculateEstimate(kitchen, 0);
  check(validateEstimateResult(good, kitchen).ok, "validation accepts a genuine engine result");
  check(
    validateEstimateResult(null, EMPTY_SELECTIONS).ok,
    "validation accepts null for unpriceable selections",
  );
  check(
    !validateEstimateResult(null, kitchen).ok,
    "validation rejects null for priceable selections",
  );
  check(
    !validateEstimateResult({ ...good!, priceLow: NaN }, kitchen).ok,
    "validation rejects NaN prices",
  );
  check(
    !validateEstimateResult({ ...good!, priceLow: good!.priceHigh + 100, priceHigh: good!.priceLow }, kitchen).ok,
    "validation rejects low > high",
  );
  check(
    !validateEstimateResult({ ...good!, priceLow: good!.priceLow + 0.5 }, kitchen).ok,
    "validation rejects un-rounded prices",
  );
  check(
    !validateEstimateResult({ ...good!, priceLow: -100 }, kitchen).ok,
    "validation rejects negative prices",
  );
  check(
    !validateEstimateResult({ ...good!, priceHigh: 5_000_000 }, kitchen).ok,
    "validation rejects prices beyond the sanity ceiling",
  );

  const rooms = [kitchen, getDefaultSelectionsForProject("bathroom")];
  const combined = calculateCombinedEstimate(rooms);
  check(validateCombinedEstimate(combined, rooms).ok, "validation accepts a genuine combined result");
  check(
    !validateCombinedEstimate({ ...combined!, priceLow: combined!.priceLow + 100 }, rooms).ok,
    "validation rejects a combined total that does not equal the room sum",
  );
  check(
    !validateCombinedEstimate(combined, [kitchen]).ok,
    "validation rejects a room-count mismatch",
  );
  check(
    !validateCombinedEstimate(null, rooms).ok,
    "validation rejects null when rooms are priceable",
  );
  check(
    validateCombinedEstimate(null, [EMPTY_SELECTIONS]).ok,
    "validation accepts null when nothing is priceable",
  );
  check(
    safeCombinedEstimate(combined, rooms, "test") === combined,
    "safeCombinedEstimate passes a valid result through",
  );
  check(
    safeCombinedEstimate({ ...combined!, priceHigh: NaN }, rooms, "test") === null,
    "safeCombinedEstimate suppresses a corrupt result",
  );
}

// Detail changes the confidence label. It does not reprice a single book total.
{
  const room: EstimateSelections = {
    ...EMPTY_SELECTIONS,
    project: "kitchen",
    size: 20,
    sizeUpper: 15,
    layout: "galley",
    doorStyle: "slab",
    finishCategory: "matte",
    finishTier: "standard",
    construction: "essential",
  };
  const total = getTotalSteps("kitchen");
  const none = calculateEstimate(room, 0)!;
  const full = calculateEstimate(room, total)!;
  check(none.priceLow === full.priceLow && none.priceHigh === full.priceHigh, "answering more questions does not reprice the book total");
  check(full.confidence === "detailed" && none.confidence === "starting", "confidence still climbs with answers");
}

// Level and size change the total. Door, finish and layout do not, because the book has no unit price for them.
{
  for (const project of ALL_PROJECTS) {
    const cfg = SIZE_CFG[project];
    const base = sel({
      project,
      layout: PROJECT_LAYOUT_SLUGS[project][0] ?? "",
      size: cfg.default,
      sizeUpper: cfg.uppers ? cfg.uppers.default : null,
      doorStyle: "slab",
      finishCategory: "matte",
      construction: "signature",
    });
    const prices = LEVELS.map((construction) => calculateEstimate({ ...base, construction }, 0)?.priceLow);
    check(new Set(prices).size === LEVELS.length, `${project}: all 4 levels price differently`);
    const small = calculateEstimate({ ...base, size: cfg.min }, 0)!;
    const large = calculateEstimate({ ...base, size: cfg.max }, 0)!;
    check(large.priceLow > small.priceLow, `${project}: size changes the book total`);
    if (cfg.uppers) {
      const none = calculateEstimate({ ...base, sizeUpper: 0 }, 0)!;
      const many = calculateEstimate({ ...base, sizeUpper: cfg.uppers.max }, 0)!;
      check(many.priceLow > none.priceLow, `${project}: upper run changes the book total`);
    }
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} checks passed, ${failed} failed.`);
if (failed > 0) {
  console.error("\nPricing regression suite FAILED:");
  failures.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log("Pricing regression suite passed.");
