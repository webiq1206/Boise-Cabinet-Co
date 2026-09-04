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
  PROJECT_PRICING,
  PROJECT_SIZE_CONFIG,
  DOOR_STYLE_MULTIPLIER,
  FINISH_CATEGORY_MULTIPLIER,
  FINISH_TIER_MULTIPLIER,
  FINISH_MARKER_MULTIPLIER,
  DETAIL_TIGHTENING,
  getTotalSteps,
  finishMarkerToTier,
  CONSTRUCTION_MULTIPLIER,
  LAYOUT_COMPLEXITY_MULTIPLIER,
  PROJECT_NO_LAYOUT_COMPLEXITY,
  PROJECT_LAYOUT_SLUGS,
  EMPTY_SELECTIONS,
  calculateEstimate,
  calculateCombinedEstimate,
  buildStoredEstimate,
  buildCombinedStoredEstimate,
  buildCombinedConsultationPayload,
  buildConsultationEstimatePayload,
  getDefaultSelectionsForProject,
  roomSelectionsMade,
  isPriceable,
  type EstimateSelections,
  type ProjectType,
  type FinishCategory,
  type FinishTier,
  type ConstructionTier,
} from "../../shared/estimateEngine";
import { buildEstimateRecord } from "../../shared/estimateRecord";
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

const ALL_PROJECTS = Object.keys(PROJECT_PRICING) as ProjectType[];

function sel(
  s: Partial<EstimateSelections> & { project: ProjectType },
): EstimateSelections {
  return { ...EMPTY_SELECTIONS, ...s };
}

/** Independent implementation of the documented pricing formula. */
function expectedPrice(s: EstimateSelections): { low: number; high: number } {
  const p = s.project as ProjectType;
  const pricing = PROJECT_PRICING[p];
  const cfg = PROJECT_SIZE_CONFIG[p];
  const hasLayout = PROJECT_LAYOUT_SLUGS[p].length > 0;
  let mult = hasLayout
    ? (LAYOUT_COMPLEXITY_MULTIPLIER[s.layout] ?? 1)
    : (PROJECT_NO_LAYOUT_COMPLEXITY[p] ?? 1);
  mult *= DOOR_STYLE_MULTIPLIER[s.doorStyle] ?? 1;
  mult *= FINISH_CATEGORY_MULTIPLIER[s.finishCategory as FinishCategory] ?? 1;
  mult *= FINISH_TIER_MULTIPLIER[s.finishTier as FinishTier] ?? 1;
  mult *= CONSTRUCTION_MULTIPLIER[s.construction as ConstructionTier] ?? 1;
  const upper = cfg.uppers ? (s.sizeUpper ?? 0) : 0;
  const round100 = (n: number) =>
    Math.round(n / ESTIMATE_PRICE_ROUND_TO) * ESTIMATE_PRICE_ROUND_TO;
  return {
    low: round100((pricing.perUnitLow * s.size! + pricing.upperPerUnitLow * upper) * mult),
    high: round100((pricing.perUnitHigh * s.size! + pricing.upperPerUnitHigh * upper) * mult),
  };
}

// ── 1. Literal snapshots ────────────────────────────────────────────────────
// Values generated from the documented formula independently of the engine and
// hand-verified (e.g. kitchen defaults: (360x24 + 215x18) x 1.16x1.05x1.12 =
// 17,065.64 -> $17,100). Update ONLY alongside a deliberate pricing change.

const SNAPSHOTS: Array<{ name: string; s: EstimateSelections; low: number; high: number }> = [
  { name: "kitchen defaults", s: sel({ project: "kitchen", layout: "island", size: 24, sizeUpper: 18, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 17100, high: 28600 },
  { name: "kitchen floor", s: sel({ project: "kitchen", layout: "galley", size: 10, sizeUpper: 0, doorStyle: "slab", finishCategory: "matte", finishTier: "standard", construction: "good" }), low: 3600, high: 6100 },
  { name: "kitchen ceiling", s: sel({ project: "kitchen", layout: "island", size: 60, sizeUpper: 50, doorStyle: "beta-shaker", finishCategory: "gloss", finishTier: "reserve", construction: "best" }), low: 83400, high: 140000 },
  { name: "kitchen u-shape mid", s: sel({ project: "kitchen", layout: "u-shape", size: 30, sizeUpper: 22, doorStyle: "thin-shaker", finishCategory: "woodgrain", finishTier: "premium", construction: "better" }), low: 26400, high: 44300 },
  { name: "kitchen peninsula", s: sel({ project: "kitchen", layout: "peninsula", size: 24, sizeUpper: 18, doorStyle: "three-piece", finishCategory: "matte", finishTier: "premium", construction: "good" }), low: 16300, high: 27400 },
  { name: "kitchen size-only", s: sel({ project: "kitchen", layout: "l-shape", size: 40, sizeUpper: 0 }), low: 15100, high: 25400 },
  { name: "bathroom single min", s: sel({ project: "bathroom", layout: "single-vanity", size: 3, doorStyle: "slab", finishCategory: "matte", finishTier: "standard", construction: "good" }), low: 1400, high: 2500 },
  { name: "bathroom double default", s: sel({ project: "bathroom", layout: "double-vanity", size: 6, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 3600, high: 6500 },
  { name: "bathroom max", s: sel({ project: "bathroom", layout: "double-vanity", size: 16, doorStyle: "beta-shaker", finishCategory: "gloss", finishTier: "reserve", construction: "best" }), low: 18300, high: 32700 },
  { name: "laundry default", s: sel({ project: "laundry", size: 8, sizeUpper: 6, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 3500, high: 6400 },
  { name: "laundry max", s: sel({ project: "laundry", size: 20, sizeUpper: 16, doorStyle: "beta-shaker", finishCategory: "gloss", finishTier: "reserve", construction: "best" }), low: 17100, high: 30900 },
  { name: "mudroom default", s: sel({ project: "mudroom", size: 8, sizeUpper: 6, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 3400, high: 6000 },
  { name: "home-office default", s: sel({ project: "home-office", size: 10, sizeUpper: 7, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 4600, high: 8200 },
  { name: "entertainment default", s: sel({ project: "entertainment", size: 12, sizeUpper: 9, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 5900, high: 10700 },
  { name: "built-ins default", s: sel({ project: "built-ins", size: 10, sizeUpper: 7, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 4300, high: 8000 },
  { name: "built-ins slab woodgrain", s: sel({ project: "built-ins", size: 10, sizeUpper: 7, doorStyle: "slab", finishCategory: "woodgrain", finishTier: "standard", construction: "good" }), low: 4100, high: 7500 },
  { name: "pantry default", s: sel({ project: "pantry", size: 8, doorStyle: "modern-shaker", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 3000, high: 5600 },
  { name: "pantry max", s: sel({ project: "pantry", size: 16, doorStyle: "beta-shaker", finishCategory: "gloss", finishTier: "reserve", construction: "best" }), low: 11400, high: 21300 },
  { name: "kitchen alpha premium", s: sel({ project: "kitchen", layout: "galley", size: 20, sizeUpper: 14, doorStyle: "alpha-shaker", finishCategory: "matte", finishTier: "premium", construction: "better" }), low: 14300, high: 24100 },
  { name: "bathroom slab better", s: sel({ project: "bathroom", layout: "single-vanity", size: 8, doorStyle: "slab", finishCategory: "matte", finishTier: "standard", construction: "better" }), low: 4100, high: 7300 },
];

for (const snap of SNAPSHOTS) {
  const r = calculateEstimate(snap.s, 0);
  check(r !== null, `snapshot "${snap.name}": priceable`);
  if (r) {
    check(
      r.priceLow === snap.low && r.priceHigh === snap.high,
      `snapshot "${snap.name}": expected ${snap.low}..${snap.high}, got ${r.priceLow}..${r.priceHigh}`,
    );
  }
}

// ── 2. Formula independence sweep ───────────────────────────────────────────
// Every layout x door x finish-category x tier x construction combination, at
// min/default/max sizes, must match the independently computed formula.

let sweepCount = 0;
for (const project of ALL_PROJECTS) {
  const cfg = PROJECT_SIZE_CONFIG[project];
  const layouts = PROJECT_LAYOUT_SLUGS[project].length
    ? PROJECT_LAYOUT_SLUGS[project]
    : [""];
  const sizes = [cfg.min, cfg.default, cfg.max];
  const upperSizes = cfg.uppers ? [0, cfg.uppers.default, cfg.uppers.max] : [null];
  for (const layout of layouts) {
    for (let si = 0; si < sizes.length; si++) {
      const size = sizes[si];
      const sizeUpper = upperSizes[Math.min(si, upperSizes.length - 1)];
      for (const doorStyle of Object.keys(DOOR_STYLE_MULTIPLIER)) {
        for (const finishCategory of Object.keys(FINISH_CATEGORY_MULTIPLIER) as FinishCategory[]) {
          for (const finishTier of Object.keys(FINISH_TIER_MULTIPLIER) as FinishTier[]) {
            for (const construction of Object.keys(CONSTRUCTION_MULTIPLIER) as ConstructionTier[]) {
              const s = sel({ project, layout, size, sizeUpper, doorStyle, finishCategory, finishTier, construction });
              const e = expectedPrice(s);
              const r = calculateEstimate(s, 0);
              sweepCount++;
              if (!r || r.priceLow !== e.low || r.priceHigh !== e.high) {
                check(
                  false,
                  `sweep ${project}/${layout || "no-layout"}/${size}+${sizeUpper}/${doorStyle}/${finishCategory}/${finishTier}/${construction}: expected ${e.low}..${e.high}, got ${r ? `${r.priceLow}..${r.priceHigh}` : "null"}`,
                );
              } else {
                passed++;
              }
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

// Monotonicity: upgrading any dimension never lowers the range.
function assertMonotonic<T extends string>(
  project: ProjectType,
  field: keyof EstimateSelections,
  map: Record<T, number>,
  values: T[],
) {
  const ordered = [...values].sort((a, b) => map[a] - map[b]);
  const base = getDefaultSelectionsForProject(project);
  let prevLow = -1;
  let prevHigh = -1;
  for (const value of ordered) {
    const r = calculateEstimate({ ...base, [field]: value } as EstimateSelections, 0);
    check(r !== null, `${project} ${String(field)}=${value}: priceable`);
    if (!r) return;
    check(
      r.priceLow >= prevLow && r.priceHigh >= prevHigh,
      `${project} ${String(field)}: non-decreasing at "${value}"`,
    );
    prevLow = r.priceLow;
    prevHigh = r.priceHigh;
  }
}

for (const project of ALL_PROJECTS) {
  assertMonotonic(project, "doorStyle", DOOR_STYLE_MULTIPLIER, Object.keys(DOOR_STYLE_MULTIPLIER));
  assertMonotonic(project, "finishCategory", FINISH_CATEGORY_MULTIPLIER, Object.keys(FINISH_CATEGORY_MULTIPLIER) as FinishCategory[]);
  assertMonotonic(project, "finishTier", FINISH_TIER_MULTIPLIER, Object.keys(FINISH_TIER_MULTIPLIER) as FinishTier[]);
  assertMonotonic(project, "construction", CONSTRUCTION_MULTIPLIER, Object.keys(CONSTRUCTION_MULTIPLIER) as ConstructionTier[]);
  if (PROJECT_LAYOUT_SLUGS[project].length) {
    assertMonotonic(project, "layout", LAYOUT_COMPLEXITY_MULTIPLIER, PROJECT_LAYOUT_SLUGS[project]);
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
  const copy = { ...a, construction: "best" as const };
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
    !validateEstimateResult({ ...good!, priceLow: good!.priceLow + 37 }, kitchen).ok,
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

// ── The range must tighten as a room is specified ───────────────────────────
// The engine computes how completely a room has been specified and used to
// spend that signal purely on a "95% detailed" label while quoting the same
// band it quoted at 51%. Detail must narrow the range, and must do so WITHOUT
// moving its centre - this sharpens an estimate, it does not reprice one.
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
    construction: "good",
  };
  const total = getTotalSteps("kitchen");
  const at = (n: number) => calculateEstimate(room, n)!;

  const none = at(0);
  const full = at(total);

  check(
    full.priceHigh / full.priceLow < none.priceHigh / none.priceLow,
    `a fully specified room is quoted tighter than an unspecified one (${(none.priceHigh / none.priceLow).toFixed(3)}x -> ${(full.priceHigh / full.priceLow).toFixed(3)}x)`,
  );

  // Monotonic: every extra answer narrows the band, never widens it.
  let monotonic = true;
  let prev = Infinity;
  for (let n = 0; n <= total; n++) {
    const r = at(n);
    const spread = r.priceHigh / r.priceLow;
    if (spread > prev + 1e-9) monotonic = false;
    prev = spread;
  }
  check(monotonic, "each additional selection narrows the range, never widens it");

  // The centre must not drift by more than the $100 rounding increment.
  const centre = (r: { priceLow: number; priceHigh: number }) =>
    Math.sqrt(r.priceLow * r.priceHigh);
  check(
    Math.abs(centre(full) - centre(none)) <= 100,
    `tightening leaves the centre of the range alone (${Math.round(centre(none))} vs ${Math.round(centre(full))})`,
  );

  // An unspecified room must return exactly what the rate band says, so the
  // tightening cannot quietly reprice the entry point.
  const mult =
    (LAYOUT_COMPLEXITY_MULTIPLIER["galley"] ?? 1) *
    (DOOR_STYLE_MULTIPLIER["slab"] ?? 1) *
    FINISH_CATEGORY_MULTIPLIER.matte *
    FINISH_TIER_MULTIPLIER.standard *
    CONSTRUCTION_MULTIPLIER.good;
  const p = PROJECT_PRICING.kitchen;
  check(
    none.priceLow === Math.round((p.perUnitLow * 20 + p.upperPerUnitLow * 15) * mult / 100) * 100 &&
      none.priceHigh === Math.round((p.perUnitHigh * 20 + p.upperPerUnitHigh * 15) * mult / 100) * 100,
    "an unspecified room still returns the rate band exactly",
  );

  check(DETAIL_TIGHTENING > 0 && DETAIL_TIGHTENING < 1, "DETAIL_TIGHTENING stays a proper fraction");
}

// ── Named finishes must price by the catalog's own price marker ─────────────
// The catalog carries a 5-level price marker per finish; finishMarkerToTier
// buckets it into 3, sending markers 1, 2 AND 3 to "standard" at 1.0. That put
// 204 of 299 finishes at an identical price while the swatch beside the number
// advertised different tiers. Pricing reads the marker directly now.
{
  check(
    new Set(Object.values(FINISH_MARKER_MULTIPLIER)).size === 5,
    "all five catalog price markers price distinctly",
  );
  let ascending = true;
  for (let m = 2; m <= 5; m++) {
    if (FINISH_MARKER_MULTIPLIER[m] <= FINISH_MARKER_MULTIPLIER[m - 1]) ascending = false;
  }
  check(ascending, "the finish ladder rises monotonically with the catalog marker");

  // Markers already priced distinctly by the old 3-way bucket must not move.
  check(
    FINISH_MARKER_MULTIPLIER[4] === FINISH_TIER_MULTIPLIER[finishMarkerToTier(4)] &&
      FINISH_MARKER_MULTIPLIER[5] === FINISH_TIER_MULTIPLIER[finishMarkerToTier(5)],
    "markers 4 and 5 keep the exact multiplier they had before",
  );
  check(
    FINISH_MARKER_MULTIPLIER[2] === FINISH_TIER_MULTIPLIER.standard,
    "the middle of the collapsed bucket keeps today's price",
  );
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} checks passed, ${failed} failed.`);
if (failed > 0) {
  console.error("\nPricing regression suite FAILED:");
  failures.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log("Pricing regression suite passed.");
