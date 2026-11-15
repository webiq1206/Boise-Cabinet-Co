import {
  calculateEstimate,
  getDefaultSelectionsForProject,
  getProjectSizeConfig,
  getStepVisibility,
  getVisibleSteps,
  getTotalSteps,
  getLayoutOptions,
  getDoorStyleOptions,
  PROJECT_BOOK_LINES,
  type EstimateSelections,
  type ProjectType,
  type FinishCategory,
  type ConstructionTier,
} from "../server/estimateEngine";

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
  "built-ins",
  "pantry",
];

// ── Valid ranges per project type ───────────────────────────────────────────
for (const project of projects) {
  const base = getDefaultSelectionsForProject(project);
  const cfg = getProjectSizeConfig(project);
  const total = getTotalSteps(project);

  const result = priced(base, total);
  assert(result.priceLow > 0, `${project}: priceLow is positive`);
  assert(result.priceHigh > result.priceLow, `${project}: the shared engine returns a customer range`);
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

const constructionOrder: ConstructionTier[] = ["essential", "signature", "premium", "luxury"];
const finishCategories: FinishCategory[] = ["matte", "woodgrain", "gloss"];

for (const project of projects) {
  const base = { ...getDefaultSelectionsForProject(project), size: getProjectSizeConfig(project).max };
  let prev = -1;
  for (const level of constructionOrder) {
    const r = priced({ ...base, construction: level }, 0);
    assert(r.priceLow > prev, `${project} level ${level} costs more than the level below`);
    prev = r.priceLow;
  }

  const reference = priced(base, 0);
  for (const doorStyle of getDoorStyleOptions().map((option) => option.value)) {
    const r = priced({ ...base, doorStyle }, 0);
    assert(r.priceLow === reference.priceLow, `${project} door ${doorStyle} does not invent a price`);
  }
  for (const finishCategory of finishCategories) {
    const r = priced({ ...base, finishCategory }, 0);
    assert(r.priceLow === reference.priceLow, `${project} finish ${finishCategory} does not invent a price`);
  }
  for (const layout of getLayoutOptions(project).map((option) => option.value)) {
    const r = priced({ ...base, layout }, 0);
    assert(r.priceLow === reference.priceLow, `${project} layout ${layout} does not invent a price`);
  }

  const sizeCfg = getProjectSizeConfig(project);
  if (sizeCfg.uppers && PROJECT_BOOK_LINES[project].upper) {
    const b = { ...getDefaultSelectionsForProject(project), size: sizeCfg.max };
    const noUppers = priced({ ...b, sizeUpper: 0 }, 0);
    const maxUppers = priced({ ...b, sizeUpper: sizeCfg.uppers.max }, 0);
    assert(maxUppers.priceHigh > noUppers.priceHigh, `${project} uppers: more wall cabinets raise the total`);
  }
}

assert(calculateEstimate(getDefaultSelectionsForProject("entertainment")) === null, "entertainment has no per-foot cost book code");

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
