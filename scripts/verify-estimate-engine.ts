import {
  DEFAULT_ESTIMATE_INPUT,
  calculateEstimate,
  countVisibleUserRefinements,
  getMaxRefinementFields,
  getProjectSizeConfig,
  getRefinementVisibility,
  type ProjectType,
  type UserRefinementKey,
} from "../shared/estimateEngine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const projects: ProjectType[] = ["kitchen", "bathroom", "whole-home", "addition", "adu"];

for (const project of projects) {
  const visibility = getRefinementVisibility(project);
  const maxFields = getMaxRefinementFields(project);
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  assert(maxFields === visibleCount, `${project} max fields matches visibility (${maxFields})`);

  if (project === "addition" || project === "adu") {
    assert(!visibility.layoutChanges, `${project} hides layout changes`);
    assert(maxFields === 2, `${project} exposes two refinement fields`);
  } else {
    assert(visibility.layoutChanges, `${project} shows layout changes`);
    assert(maxFields === 3, `${project} exposes three refinement fields`);
  }
}

const kitchenMax = getMaxRefinementFields("kitchen");
const kitchenKeys: UserRefinementKey[] = ["layoutChanges", "plumbingElectrical", "cabinetTier"];
const kitchenDetailed = calculateEstimate(
  {
    ...DEFAULT_ESTIMATE_INPUT,
    refinements: {
      ...DEFAULT_ESTIMATE_INPUT.refinements,
      layoutChanges: "major",
      plumbingElectrical: "full",
      cabinetTier: "custom",
    },
  },
  kitchenMax,
);
assert(kitchenDetailed.confidence === "detailed", "kitchen reaches detailed guidance at max fields");
assert(kitchenDetailed.confidencePercent === 85, "kitchen detailed guidance is 85%");

const aduDetailed = calculateEstimate(
  {
    project: "adu",
    finish: "mid-range",
    sqft: getProjectSizeConfig("adu").defaultSqft,
    refinements: {
      ...DEFAULT_ESTIMATE_INPUT.refinements,
      plumbingElectrical: "full",
      stories: 2,
    },
  },
  2,
);
assert(aduDetailed.confidence === "detailed", "ADU reaches detailed guidance at max fields");

const hiddenCount = countVisibleUserRefinements("adu", ["layoutChanges", "plumbingElectrical"]);
assert(hiddenCount === 1, "hidden layout refinements are not counted for ADU");

const wholeHomeLarge = calculateEstimate(
  {
    project: "whole-home",
    finish: "mid-range",
    sqft: 8000,
    refinements: DEFAULT_ESTIMATE_INPUT.refinements,
  },
  0,
);
const wholeHomeBase = calculateEstimate(
  {
    project: "whole-home",
    finish: "mid-range",
    sqft: getProjectSizeConfig("whole-home").baselineSqft,
    refinements: DEFAULT_ESTIMATE_INPUT.refinements,
  },
  0,
);
assert(
  wholeHomeLarge.priceHigh > wholeHomeBase.priceHigh,
  "whole-home price scales up with square footage",
);

const aduMaxSqft = getProjectSizeConfig("adu").max;
assert(aduMaxSqft === 900, "ADU square footage is capped at 900");

console.log("All estimate engine checks passed.");
