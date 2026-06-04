import {
  calculateEstimate,
  getDefaultSelectionsForProject,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getTotalSteps,
  getLayoutOptions,
  ACCESSORY_OPTIONS,
  ACCESSORY_PREMIUM_PER,
  DOOR_STYLE_MULTIPLIER,
  FINISH_CATEGORY_MULTIPLIER,
  FINISH_TIER_MULTIPLIER,
  CONSTRUCTION_MULTIPLIER,
  LAYOUT_COMPLEXITY_MULTIPLIER,
  type EstimateSelections,
  type ProjectType,
  type FinishCategory,
  type FinishTier,
  type ConstructionTier,
} from "../shared/estimateEngine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const projects: ProjectType[] = [
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
];

/** Order option keys ascending by their multiplier so we can assert monotonicity. */
function sortByMultiplier<T extends string>(map: Record<T, number>): T[] {
  return (Object.keys(map) as T[]).sort((a, b) => map[a] - map[b]);
}

// ── Valid ranges per project type ───────────────────────────────────────────
for (const project of projects) {
  const base = getDefaultSelectionsForProject(project);
  const cfg = getProjectSizeConfig(project);
  const total = getTotalSteps(project);

  const result = calculateEstimate(base, total);
  assert(result.priceLow > 0, `${project}: priceLow is positive`);
  assert(result.priceHigh > result.priceLow, `${project}: priceHigh exceeds priceLow`);
  assert(result.roi > 0 && result.roi <= 100, `${project}: roi within (0, 100]`);
  assert(result.priceLow >= 1000, `${project}: priceLow is a realistic planning figure`);
  assert(result.included.length > 0, `${project}: included scope is populated`);
  assert(
    result.scopeSummary.length > 0 && result.scopeSummary.includes("·"),
    `${project}: scope summary names products`,
  );

  // No supplier/brand or removed-tier language should ever surface in the scope.
  for (const banned of ["Reserve", "OSC", "Standard", "Premium", "Luxury", "Cabinet line", " line"]) {
    assert(
      !result.scopeSummary.includes(banned),
      `${project}: scope summary must not contain "${banned}"`,
    );
  }

  // Size scales the range up monotonically.
  const small = calculateEstimate({ ...base, size: cfg.min }, total);
  const large = calculateEstimate({ ...base, size: cfg.max }, total);
  assert(large.priceLow > small.priceLow, `${project}: larger size raises priceLow`);
  assert(large.priceHigh > small.priceHigh, `${project}: larger size raises priceHigh`);
}

// ── Per-project step visibility ─────────────────────────────────────────────
for (const project of projects) {
  const vis = getStepVisibility(project);
  const steps = getVisibleSteps(project);
  assert(vis.doorStyle, `${project} shows door style`);
  assert(steps.includes("doorStyle"), `${project} has a door style step`);
  if (vis.layout) {
    assert(steps.includes("layout"), `${project} has a layout step`);
    assert(getLayoutOptions(project).length > 0, `${project} offers layout options`);
  }
  assert(steps.includes("size"), `${project} has a size step`);
  assert(!steps.includes("line" as never), `${project} has no cabinet line step`);
  assert(
    steps.includes("finish") && steps.includes("construction") && steps.includes("accessories"),
    `${project} has finish, construction, and accessories steps`,
  );
}

// ── Exactly the six catalog accessory families are offered ───────────────────
assert(ACCESSORY_OPTIONS.length === 6, `estimator offers exactly 6 catalog accessories (got ${ACCESSORY_OPTIONS.length})`);
assert(ACCESSORY_PREMIUM_PER > 0, "each accessory adds a positive premium");

// ── Monotonicity: every upgrade can only raise (never lower) the range ───────
function monotonicUpgrade<T extends string>(
  project: ProjectType,
  field: keyof EstimateSelections,
  order: T[],
  label: string,
) {
  const cfg = getProjectSizeConfig(project);
  const base = { ...getDefaultSelectionsForProject(project), size: cfg.max };
  let prevLow = -1;
  let prevHigh = -1;
  for (const value of order) {
    const r = calculateEstimate({ ...base, [field]: value } as EstimateSelections, 0);
    assert(r.priceLow >= prevLow, `${project} ${label}: priceLow non-decreasing at "${value}"`);
    assert(r.priceHigh >= prevHigh, `${project} ${label}: priceHigh non-decreasing at "${value}"`);
    prevLow = r.priceLow;
    prevHigh = r.priceHigh;
  }
  const lowest = calculateEstimate({ ...base, [field]: order[0] } as EstimateSelections, 0);
  const highest = calculateEstimate(
    { ...base, [field]: order[order.length - 1] } as EstimateSelections,
    0,
  );
  if (order.length > 1) {
    assert(
      highest.priceHigh > lowest.priceHigh,
      `${project} ${label}: top option costs more than the base option`,
    );
  }
}

const doorOrder = sortByMultiplier(DOOR_STYLE_MULTIPLIER);
const finishCategoryOrder = sortByMultiplier(FINISH_CATEGORY_MULTIPLIER) as FinishCategory[];
const finishTierOrder = sortByMultiplier(FINISH_TIER_MULTIPLIER) as FinishTier[];
const constructionOrder = sortByMultiplier(CONSTRUCTION_MULTIPLIER) as ConstructionTier[];

for (const project of projects) {
  const vis = getStepVisibility(project);
  monotonicUpgrade(project, "finishCategory", finishCategoryOrder, "finish category");
  monotonicUpgrade(project, "finishTier", finishTierOrder, "finish tier");
  monotonicUpgrade(project, "construction", constructionOrder, "construction");

  if (vis.doorStyle) {
    monotonicUpgrade(project, "doorStyle", doorOrder, "door style");
  }
  if (vis.layout) {
    const layoutOrder = getLayoutOptions(project)
      .map((o) => o.value)
      .sort((a, b) => (LAYOUT_COMPLEXITY_MULTIPLIER[a] ?? 1) - (LAYOUT_COMPLEXITY_MULTIPLIER[b] ?? 1));
    monotonicUpgrade(project, "layout", layoutOrder, "layout complexity");
  }

  // Adding more accessories raises the range.
  const cfg = getProjectSizeConfig(project);
  const base = { ...getDefaultSelectionsForProject(project), size: cfg.max };
  const slugs = ACCESSORY_OPTIONS.map((o) => o.value);
  let prevHigh = -1;
  for (let i = 0; i <= slugs.length; i++) {
    const r = calculateEstimate({ ...base, accessories: slugs.slice(0, i) }, 0);
    assert(r.priceHigh >= prevHigh, `${project} accessories: priceHigh non-decreasing at ${i} add-ons`);
    prevHigh = r.priceHigh;
  }
  const none = calculateEstimate({ ...base, accessories: [] }, 0);
  const all = calculateEstimate({ ...base, accessories: slugs }, 0);
  assert(all.priceHigh > none.priceHigh, `${project} accessories: selecting add-ons raises the range`);
}

// ── Confidence climbs as more steps are touched ─────────────────────────────
for (const project of projects) {
  const base = getDefaultSelectionsForProject(project);
  const total = getTotalSteps(project);
  const starting = calculateEstimate(base, 0);
  const detailed = calculateEstimate(base, total);
  assert(starting.confidence === "starting", `${project}: zero selections is "starting"`);
  assert(detailed.confidence === "detailed", `${project}: all selections reaches "detailed"`);
  assert(
    detailed.confidencePercent > starting.confidencePercent,
    `${project}: confidence percent increases with selections`,
  );
}

console.log("All estimate engine checks passed.");
