import {
  calculateEstimate,
  getDefaultSelectionsForProject,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getTotalSteps,
  getLayoutOptions,
  CABINET_LINE_MULTIPLIER,
  DOOR_STYLE_MULTIPLIER,
  FINISH_CATEGORY_MULTIPLIER,
  FINISH_TIER_MULTIPLIER,
  CONSTRUCTION_MULTIPLIER,
  STORAGE_MULTIPLIER,
  LAYOUT_COMPLEXITY_MULTIPLIER,
  type EstimateSelections,
  type ProjectType,
  type FinishCategory,
  type FinishTier,
  type ConstructionTier,
  type StorageTier,
} from "../shared/estimateEngine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const projects: ProjectType[] = ["kitchen", "bathroom", "whole-home", "addition", "adu"];

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
  if (project === "whole-home") {
    assert(!vis.layout && !vis.doorStyle, "whole-home hides layout and door style");
    assert(!steps.includes("layout"), "whole-home has no layout step");
    assert(!steps.includes("doorStyle"), "whole-home has no door style step");
  } else {
    assert(vis.layout && vis.doorStyle, `${project} shows layout and door style`);
    assert(steps.includes("layout"), `${project} has a layout step`);
    assert(steps.includes("doorStyle"), `${project} has a door style step`);
    assert(steps.includes("finishColor"), `${project} has optional finish color step`);
    assert(getLayoutOptions(project).length > 0, `${project} offers layout options`);
  }
  assert(steps.includes("size") && steps.includes("line"), `${project} has size and line steps`);
  assert(
    steps.includes("finish") && steps.includes("construction") && steps.includes("storage"),
    `${project} has finish, construction, and storage steps`,
  );
}

// ── Monotonicity: every upgrade can only raise (never lower) the range ───────
// Use the largest size so each multiplier step clears the $100 rounding band and
// the strict end-to-end increase is unambiguous.
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
  // End-to-end the top option must cost strictly more than the bottom option.
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

const lineOrder = sortByMultiplier(CABINET_LINE_MULTIPLIER);
const doorOrder = sortByMultiplier(DOOR_STYLE_MULTIPLIER);
const finishCategoryOrder = sortByMultiplier(FINISH_CATEGORY_MULTIPLIER) as FinishCategory[];
const finishTierOrder = sortByMultiplier(FINISH_TIER_MULTIPLIER) as FinishTier[];
const constructionOrder = sortByMultiplier(CONSTRUCTION_MULTIPLIER) as ConstructionTier[];
const storageOrder = sortByMultiplier(STORAGE_MULTIPLIER) as StorageTier[];

for (const project of projects) {
  const vis = getStepVisibility(project);
  monotonicUpgrade(project, "cabinetLine", lineOrder, "cabinet line");
  monotonicUpgrade(project, "finishCategory", finishCategoryOrder, "finish category");
  monotonicUpgrade(project, "finishTier", finishTierOrder, "finish tier");
  monotonicUpgrade(project, "construction", constructionOrder, "construction");
  monotonicUpgrade(project, "storage", storageOrder, "storage");

  if (vis.doorStyle) {
    monotonicUpgrade(project, "doorStyle", doorOrder, "door style");
  }
  if (vis.layout) {
    const layoutOrder = getLayoutOptions(project)
      .map((o) => o.value)
      .sort((a, b) => (LAYOUT_COMPLEXITY_MULTIPLIER[a] ?? 1) - (LAYOUT_COMPLEXITY_MULTIPLIER[b] ?? 1));
    monotonicUpgrade(project, "layout", layoutOrder, "layout complexity");
  }
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
