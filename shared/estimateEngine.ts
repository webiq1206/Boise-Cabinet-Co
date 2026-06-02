export type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition" | "adu";
export type FinishLevel = "refresh" | "mid-range" | "high-end" | "luxury";
export type LayoutChanges = "none" | "moderate" | "major";
export type PlumbingElectrical = "cosmetic" | "partial" | "full";
export type CabinetTier = "standard" | "semi-custom" | "custom";
export type ConfidenceLevel = "starting" | "refined" | "detailed";

export type UserRefinementKey =
  | "layoutChanges"
  | "plumbingElectrical"
  | "cabinetTier"
  | "fixtureCount"
  | "roomCount"
  | "stories";

export interface PriceData {
  low: number;
  high: number;
  roi: number;
  included: string[];
}

export interface ProjectSizeConfig {
  min: number;
  max: number;
  step: number;
  defaultSqft: number;
  baselineSqft: number;
}

export interface EstimateRefinements {
  layoutChanges: LayoutChanges;
  plumbingElectrical: PlumbingElectrical;
  cabinetTier: CabinetTier | null;
  fixtureCount: number | null;
  stories: number | null;
  roomCount: number | null;
}

export interface EstimateInput {
  project: ProjectType;
  finish: FinishLevel;
  sqft: number;
  refinements: EstimateRefinements;
}

export interface EstimateResult {
  priceLow: number;
  priceHigh: number;
  roi: number;
  included: string[];
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  confidencePercent: number;
  refinementsApplied: number;
}

export const INCLUDED_SCOPE_NOTE =
  "Scope reflects the selections above. Your final scope is confirmed during consultation.";

export const APPLIANCE_DISCLAIMER =
  "Appliances are client-supplied; we'll guide your selection but do not purchase or install them.";

export const PROJECT_SIZE_CONFIG: Record<ProjectType, ProjectSizeConfig> = {
  kitchen: { min: 100, max: 600, step: 25, defaultSqft: 250, baselineSqft: 250 },
  bathroom: { min: 40, max: 200, step: 10, defaultSqft: 80, baselineSqft: 80 },
  "whole-home": { min: 800, max: 8000, step: 100, defaultSqft: 1800, baselineSqft: 1800 },
  addition: { min: 20, max: 400, step: 10, defaultSqft: 120, baselineSqft: 120 },
  adu: { min: 20, max: 300, step: 10, defaultSqft: 80, baselineSqft: 80 },
};

export const DEFAULT_ESTIMATE_INPUT: EstimateInput = {
  project: "kitchen",
  finish: "mid-range",
  sqft: PROJECT_SIZE_CONFIG.kitchen.defaultSqft,
  refinements: {
    layoutChanges: "none",
    plumbingElectrical: "cosmetic",
    cabinetTier: null,
    fixtureCount: null,
    stories: null,
    roomCount: null,
  },
};

export function getProjectSizeConfig(project: ProjectType): ProjectSizeConfig {
  return PROJECT_SIZE_CONFIG[project];
}

export interface RefinementVisibility {
  layoutChanges: boolean;
  plumbingElectrical: boolean;
  cabinetTier: boolean;
  fixtureCount: boolean;
  roomCount: boolean;
  stories: boolean;
  aduConfiguration: boolean;
}

/** Which optional detail fields appear for each project type. */
export function getRefinementVisibility(project: ProjectType): RefinementVisibility {
  return {
    layoutChanges: project === "kitchen" || project === "bathroom" || project === "whole-home",
    plumbingElectrical: true,
    cabinetTier: project === "kitchen",
    fixtureCount: project === "bathroom",
    roomCount: project === "whole-home",
    stories: project === "addition",
    aduConfiguration: project === "adu",
  };
}

export function getMaxRefinementFields(project: ProjectType): number {
  return Object.values(getRefinementVisibility(project)).filter(Boolean).length;
}

export function getPlumbingElectricalLabel(project: ProjectType): string {
  if (project === "addition" || project === "adu") {
    return "Utility & systems scope";
  }
  return "Plumbing and electrical scope";
}

export const PLUMBING_ELECTRICAL_OPTIONS: Record<
  "cabinet" | "newConstruction",
  { value: PlumbingElectrical; label: string; sub: string }[]
> = {
  cabinet: [
    { value: "cosmetic", label: "Cosmetic", sub: "Fixtures only" },
    { value: "partial", label: "Partial", sub: "Some rerouting" },
    { value: "full", label: "Full", sub: "Complete update" },
  ],
  newConstruction: [
    { value: "cosmetic", label: "Standard", sub: "Tie into existing home" },
    { value: "partial", label: "Extended", sub: "Longer runs or panel work" },
    { value: "full", label: "Full new", sub: "Separate systems throughout" },
  ],
};

export function getPlumbingElectricalOptions(project: ProjectType) {
  return project === "addition" || project === "adu"
    ? PLUMBING_ELECTRICAL_OPTIONS.newConstruction
    : PLUMBING_ELECTRICAL_OPTIONS.cabinet;
}

export const PROJECT_LABELS: Record<ProjectType, { label: string; sub: string }> = {
  kitchen: { label: "Kitchen Cabinets", sub: "Layout, line, and installation" },
  bathroom: { label: "Bathroom Vanities", sub: "Vanity, towers, storage" },
  "whole-home": { label: "Whole-Home Cabinetry", sub: "Multiple rooms, one program" },
  addition: { label: "Built-Ins & Storage", sub: "Mudroom, pantry, office, media" },
  adu: { label: "Closet & Garage", sub: "Closet systems and garage storage" },
};

export const FINISH_LABELS: Record<FinishLevel, { label: string; sub: string }> = {
  refresh: { label: "Refresh", sub: "Cosmetic upgrades, repaint" },
  "mid-range": { label: "Mid-Range", sub: "Replace and upgrade" },
  "high-end": { label: "High-End", sub: "Premium finishes" },
  luxury: { label: "Luxury", sub: "No constraints" },
};

const ALL_FINISH_LEVELS: FinishLevel[] = ["refresh", "mid-range", "high-end", "luxury"];

/**
 * Finish levels available for a given project type. "Refresh" (cosmetic
 * upgrades / repaint) is meaningless for new construction, so additions and
 * Closet and garage programs start at "mid-range".
 */
export function getAvailableFinishLevels(project: ProjectType): FinishLevel[] {
  if (project === "addition" || project === "adu") {
    return ALL_FINISH_LEVELS.filter((level) => level !== "refresh");
  }
  return ALL_FINISH_LEVELS;
}

/**
 * Coerces a finish level to one that is valid for the given project. Guards the
 * pricing engine against disallowed combinations (e.g. "refresh" + addition)
 * regardless of how the input was produced, so the rule is not UI-only.
 */
export function normalizeFinishLevel(project: ProjectType, finish: FinishLevel): FinishLevel {
  const available = getAvailableFinishLevels(project);
  return available.includes(finish) ? finish : available[0];
}

export const PLANNING_DETAIL_LABELS: Record<ConfidenceLevel, string> = {
  starting: "Starting guidance",
  refined: "Refined guidance",
  detailed: "Detailed planning range",
};

/** @deprecated Use PLANNING_DETAIL_LABELS */
export const CONFIDENCE_LABELS = PLANNING_DETAIL_LABELS;

const PRICE_MATRIX: Record<ProjectType, Record<FinishLevel, PriceData>> = {
  kitchen: {
    refresh: {
      low: 8000, high: 18000, roi: 72,
      included: ["Stock or entry semi-custom line", "Standard door style and hardware", "Professional installation", "Soft-close hinges"],
    },
    "mid-range": {
      low: 18000, high: 45000, roi: 74,
      included: ["Semi-custom cabinetry", "Upgrade door style and finish", "Interior organizers", "Countertop coordination", "Installation and adjustment"],
    },
    "high-end": {
      low: 45000, high: 85000, roi: 70,
      included: ["Premium semi-custom or full custom line", "Island and tall pantry cabinets", "Premium hardware package", "Glass accents optional", "Full installation program"],
    },
    luxury: {
      low: 85000, high: 150000, roi: 62,
      included: ["Full custom cabinetry", "Exotic veneers or specialty finishes", "Integrated lighting and accessories", "Appliance panel coordination", "White-glove installation"],
    },
  },
  bathroom: {
    refresh: {
      low: 2500, high: 8000, roi: 70,
      included: ["Single vanity replacement", "Standard top coordination", "Hardware refresh", "Professional installation"],
    },
    "mid-range": {
      low: 8000, high: 18000, roi: 71,
      included: ["Double vanity or vanity plus tower", "Semi-custom line", "Organized drawers", "Mirror and hardware coordination"],
    },
    "high-end": {
      low: 18000, high: 35000, roi: 65,
      included: ["Floating or furniture-style vanity", "Premium finish and hardware", "Linen tower storage", "Countertop templating"],
    },
    luxury: {
      low: 35000, high: 65000, roi: 58,
      included: ["Full custom vanity program", "Specialty finishes", "Integrated lighting", "Premium organizers throughout"],
    },
  },
  "whole-home": {
    refresh: {
      low: 15000, high: 35000, roi: 65,
      included: ["Kitchen cabinet refresh", "One bath vanity", "Matching hardware schedule"],
    },
    "mid-range": {
      low: 35000, high: 90000, roi: 68,
      included: ["Kitchen plus two bath programs", "Mudroom or pantry storage", "Coordinated finishes"],
    },
    "high-end": {
      low: 90000, high: 160000, roi: 62,
      included: ["Full kitchen and bath custom lines", "Built-ins and office storage", "Premium hardware house-wide"],
    },
    luxury: {
      low: 160000, high: 280000, roi: 55,
      included: ["Whole-home custom cabinetry", "Closet and garage storage", "Integrated accessories throughout"],
    },
  },
  addition: {
    refresh: {
      low: 3000, high: 12000, roi: 60,
      included: ["Single built-in or pantry wall", "Standard line", "Installation"],
    },
    "mid-range": {
      low: 12000, high: 35000, roi: 63,
      included: ["Mudroom locker system", "Pantry fit-out", "Home office wall unit"],
    },
    "high-end": {
      low: 35000, high: 75000, roi: 58,
      included: ["Entertainment center wall", "Multiple built-in rooms", "Premium finishes"],
    },
    luxury: {
      low: 75000, high: 140000, roi: 50,
      included: ["Whole-floor built-in program", "Custom millwork details", "Integrated lighting"],
    },
  },
  adu: {
    refresh: {
      low: 2000, high: 8000, roi: 68,
      included: ["Reach-in closet system", "Standard shelving and rods", "Installation"],
    },
    "mid-range": {
      low: 8000, high: 22000, roi: 70,
      included: ["Walk-in closet package", "Garage wall storage", "Durable hardware"],
    },
    "high-end": {
      low: 22000, high: 45000, roi: 65,
      included: ["Multiple closet zones", "Garage cabinetry and benches", "Premium organizers"],
    },
    luxury: {
      low: 45000, high: 85000, roi: 58,
      included: ["Whole-home closet program", "Custom garage fit-out", "Specialty finishes"],
    },
  },
};

export function formatPlanningCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

export function getFinishPlanningHint(project: ProjectType, finish: FinishLevel): string {
  const data = PRICE_MATRIX[project][finish];
  return `Typical band at default size: ${formatPlanningCurrency(data.low)} to ${formatPlanningCurrency(data.high)}`;
}

export function buildSelectionSummary(project: ProjectType, finish: FinishLevel, sqft: number): string {
  return `${PROJECT_LABELS[project].label} · ${FINISH_LABELS[finish].label} · ${sqft.toLocaleString()} sqft`;
}

function getPlanningDetail(
  count: number,
  maxFields: number,
): { level: ConfidenceLevel; percent: number } {
  if (maxFields <= 0) return { level: "starting", percent: 40 };

  const ratio = Math.min(count, maxFields) / maxFields;
  const percent = Math.round(40 + ratio * 45);

  if (count >= maxFields) return { level: "detailed", percent: 85 };
  if (count >= Math.ceil(maxFields / 2)) return { level: "refined", percent: Math.max(65, percent) };
  return { level: "starting", percent: Math.max(40, percent) };
}

export function countVisibleUserRefinements(
  project: ProjectType,
  userRefinements: Iterable<UserRefinementKey>,
): number {
  const visibility = getRefinementVisibility(project);
  let count = 0;

  for (const key of userRefinements) {
    if (key === "layoutChanges" && visibility.layoutChanges) count++;
    else if (key === "plumbingElectrical" && visibility.plumbingElectrical) count++;
    else if (key === "cabinetTier" && visibility.cabinetTier) count++;
    else if (key === "fixtureCount" && visibility.fixtureCount) count++;
    else if (key === "roomCount" && visibility.roomCount) count++;
    else if (key === "stories" && (visibility.stories || visibility.aduConfiguration)) count++;
  }

  return count;
}

function getSizeMultiplier(sqft: number, project: ProjectType): number {
  const baseline = PROJECT_SIZE_CONFIG[project].baselineSqft;
  return Math.max(0.5, Math.min(2.5, sqft / baseline));
}

function getRefinementMultipliers(ref: EstimateRefinements, project: ProjectType): { low: number; high: number } {
  let low = 1;
  let high = 1;

  const layoutMult: Record<LayoutChanges, { low: number; high: number }> = {
    none: { low: 1, high: 1 },
    moderate: { low: 1.08, high: 1.15 },
    major: { low: 1.18, high: 1.35 },
  };
  low *= layoutMult[ref.layoutChanges].low;
  high *= layoutMult[ref.layoutChanges].high;

  const peMult: Record<PlumbingElectrical, { low: number; high: number }> = {
    cosmetic: { low: 1, high: 1 },
    partial: { low: 1.05, high: 1.12 },
    full: { low: 1.12, high: 1.22 },
  };
  low *= peMult[ref.plumbingElectrical].low;
  high *= peMult[ref.plumbingElectrical].high;

  if (project === "kitchen" && ref.cabinetTier) {
    const cabMult: Record<CabinetTier, { low: number; high: number }> = {
      standard: { low: 0.95, high: 0.98 },
      "semi-custom": { low: 1, high: 1 },
      custom: { low: 1.1, high: 1.2 },
    };
    low *= cabMult[ref.cabinetTier].low;
    high *= cabMult[ref.cabinetTier].high;
  }

  if (project === "bathroom" && ref.fixtureCount !== null) {
    const fixtureFactor = 1 + (ref.fixtureCount - 2) * 0.04;
    low *= Math.max(0.9, fixtureFactor);
    high *= Math.max(0.9, fixtureFactor);
  }

  if (project === "whole-home" && ref.roomCount !== null) {
    const roomFactor = 1 + (ref.roomCount - 3) * 0.06;
    low *= Math.max(0.85, roomFactor);
    high *= Math.max(0.85, roomFactor);
  }

  if ((project === "addition" || project === "adu") && ref.stories !== null && ref.stories > 1) {
    low *= 1.12;
    high *= 1.2;
  }

  return { low, high };
}

const LAYOUT_SCOPE: Record<LayoutChanges, string | null> = {
  none: null,
  moderate: "Non-structural wall reconfiguration",
  major: "Structural wall removal with engineering",
};

const PE_SCOPE: Record<PlumbingElectrical, string | null> = {
  cosmetic: null,
  partial: "Partial plumbing and electrical rerouting",
  full: "Full plumbing and electrical replacement",
};

const PE_SCOPE_NEW_CONSTRUCTION: Record<PlumbingElectrical, string | null> = {
  cosmetic: null,
  partial: "Extended utility runs or panel upgrades",
  full: "Full new utility systems throughout",
};

const CABINET_SCOPE: Record<CabinetTier, string> = {
  standard: "Standard stock cabinetry",
  "semi-custom": "Semi-custom cabinetry",
  custom: "Fully custom cabinetry",
};

/**
 * Builds the scope list shown in the result panel. Refinement-driven items are
 * listed first (so the visible slice reflects the user's actual choices), then
 * the base scope for the project + finish level.
 */
export function buildDynamicScope(input: EstimateInput): string[] {
  const finish = normalizeFinishLevel(input.project, input.finish);
  const base = PRICE_MATRIX[input.project][finish].included;
  const r = input.refinements;
  const visibility = getRefinementVisibility(input.project);
  const extra: string[] = [];

  if (visibility.layoutChanges) {
    const layoutItem = LAYOUT_SCOPE[r.layoutChanges];
    if (layoutItem) extra.push(layoutItem);
  }

  if (visibility.plumbingElectrical) {
    const peScope =
      input.project === "addition" || input.project === "adu"
        ? PE_SCOPE_NEW_CONSTRUCTION
        : PE_SCOPE;
    const peItem = peScope[r.plumbingElectrical];
    if (peItem) extra.push(peItem);
  }

  if (input.project === "kitchen" && r.cabinetTier) {
    extra.push(CABINET_SCOPE[r.cabinetTier]);
  }

  if (input.project === "bathroom" && r.fixtureCount !== null) {
    extra.push(`${r.fixtureCount} plumbing ${r.fixtureCount === 1 ? "fixture" : "fixtures"}`);
  }

  if (input.project === "whole-home" && r.roomCount !== null) {
    extra.push(`${r.roomCount} ${r.roomCount === 1 ? "room" : "rooms"} renovated`);
  }

  if (input.project === "addition" && r.stories !== null) {
    extra.push(r.stories > 1 ? "Two-story addition" : "Single-story addition");
  }

  if (input.project === "adu" && r.stories !== null) {
    extra.push(r.stories > 1 ? "Multi-wall closet program" : "Single-wall storage program");
  }

  const seen = new Set<string>();
  return [...extra, ...base].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

export function calculateEstimate(input: EstimateInput, userRefinementCount = 0): EstimateResult {
  const finish = normalizeFinishLevel(input.project, input.finish);
  const safeInput: EstimateInput = finish === input.finish ? input : { ...input, finish };
  const base = PRICE_MATRIX[safeInput.project][safeInput.finish];
  const sizeMult = getSizeMultiplier(input.sqft, input.project);
  const refMult = getRefinementMultipliers(input.refinements, input.project);
  const maxFields = getMaxRefinementFields(input.project);
  const { level, percent } = getPlanningDetail(userRefinementCount, maxFields);

  // Price is a pure, monotonic function of the cost drivers (project, finish,
  // size, refinements). A more intensive selection always yields a higher
  // range. The planning-detail meter below is a separate confidence cue and
  // intentionally does NOT alter the dollar range, so two configurations are
  // always directly comparable.
  const priceLow = Math.round((base.low * sizeMult * refMult.low) / 1000) * 1000;
  const priceHigh = Math.round((base.high * sizeMult * refMult.high) / 1000) * 1000;

  return {
    priceLow,
    priceHigh,
    roi: base.roi,
    included: buildDynamicScope(input),
    confidence: level,
    confidenceLabel: PLANNING_DETAIL_LABELS[level],
    confidencePercent: percent,
    refinementsApplied: userRefinementCount,
  };
}

export interface StoredEstimate extends EstimateInput {
  priceLow: number;
  priceHigh: number;
  roi: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
}

export function buildStoredEstimate(input: EstimateInput, userRefinementCount = 0): StoredEstimate {
  const result = calculateEstimate(input, userRefinementCount);
  return {
    ...input,
    finish: normalizeFinishLevel(input.project, input.finish),
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    roi: result.roi,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
  };
}
