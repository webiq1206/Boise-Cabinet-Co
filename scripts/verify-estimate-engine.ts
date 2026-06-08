import {
  calculateEstimate,
  getDefaultSelectionsForProject,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getTotalSteps,
  getLayoutOptions,
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

// calculateEstimate now returns null for unpriceable selections. Every check
// below feeds a fully-built (priceable) selection, so assert non-null here.
const calc = calculateEstimate;
function priced(sel: EstimateSelections, made = 0) {
  const r = calc(sel, made);
  if (!r) throw new Error("verification expected a priceable selection");
  return r;
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

  const result = priced(base, total);
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
  const small = priced({ ...base, size: cfg.min }, total);
  const large = priced({ ...base, size: cfg.max }, total);
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
    steps.includes("finish") && steps.includes("construction"),
    `${project} has finish and construction steps`,
  );
  assert(!steps.includes("accessories" as never), `${project} no longer surfaces a smart-storage step`);
}

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
    const r = priced({ ...base, [field]: value } as EstimateSelections, 0);
    assert(r.priceLow >= prevLow, `${project} ${label}: priceLow non-decreasing at "${value}"`);
    assert(r.priceHigh >= prevHigh, `${project} ${label}: priceHigh non-decreasing at "${value}"`);
    prevLow = r.priceLow;
    prevHigh = r.priceHigh;
  }
  const lowest = priced({ ...base, [field]: order[0] } as EstimateSelections, 0);
  const highest = priced(
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

  // Projects with wall cabinets: a larger upper run raises the range.
  const sizeCfg = getProjectSizeConfig(project);
  if (sizeCfg.uppers) {
    const b = { ...getDefaultSelectionsForProject(project), size: sizeCfg.max };
    const noUppers = priced({ ...b, sizeUpper: 0 }, 0);
    const maxUppers = priced({ ...b, sizeUpper: sizeCfg.uppers.max }, 0);
    assert(
      maxUppers.priceHigh > noUppers.priceHigh,
      `${project} uppers: more wall cabinets raise the range`,
    );
  }
}

// ── Confidence climbs as more steps are touched ─────────────────────────────
for (const project of projects) {
  const base = getDefaultSelectionsForProject(project);
  const total = getTotalSteps(project);
  const starting = priced(base, 0);
  const detailed = priced(base, total);
  assert(starting.confidence === "starting", `${project}: zero selections is "starting"`);
  assert(detailed.confidence === "detailed", `${project}: all selections reaches "detailed"`);
  assert(
    detailed.confidencePercent > starting.confidencePercent,
    `${project}: confidence percent increases with selections`,
  );
}

console.log("All estimate engine checks passed.");
