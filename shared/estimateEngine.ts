export type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition";
export type FinishLevel = "refresh" | "mid-range" | "high-end" | "luxury";
export type LayoutChanges = "none" | "moderate" | "major";
export type PlumbingElectrical = "cosmetic" | "partial" | "full";
export type CabinetTier = "standard" | "semi-custom" | "custom";
export type CityZone = "boise-core" | "treasure-valley" | "extended";
export type Timeline = "flexible" | "standard" | "accelerated";
export type ConfidenceLevel = "starting" | "refined" | "detailed";

export type UserRefinementKey =
  | "layoutChanges"
  | "plumbingElectrical"
  | "cabinetTier"
  | "fixtureCount"
  | "roomCount"
  | "stories"
  | "cityZone"
  | "timeline";

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
  cityZone: CityZone | null;
  timeline: Timeline | null;
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

export const PROJECT_SIZE_CONFIG: Record<ProjectType, ProjectSizeConfig> = {
  kitchen: { min: 100, max: 600, step: 25, defaultSqft: 250, baselineSqft: 250 },
  bathroom: { min: 40, max: 200, step: 10, defaultSqft: 80, baselineSqft: 80 },
  "whole-home": { min: 800, max: 4000, step: 100, defaultSqft: 1800, baselineSqft: 1800 },
  addition: { min: 200, max: 1200, step: 50, defaultSqft: 400, baselineSqft: 400 },
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
    cityZone: null,
    timeline: null,
  },
};

export function getProjectSizeConfig(project: ProjectType): ProjectSizeConfig {
  return PROJECT_SIZE_CONFIG[project];
}

export function getMaxRefinementFields(project: ProjectType): number {
  return project === "kitchen" || project === "bathroom" || project === "whole-home" || project === "addition"
    ? 6
    : 4;
}

export const PROJECT_LABELS: Record<ProjectType, { label: string; sub: string }> = {
  kitchen: { label: "Kitchen", sub: "Cabinets, counters, appliances" },
  bathroom: { label: "Bathroom", sub: "Tile, fixtures, vanity" },
  "whole-home": { label: "Whole-Home", sub: "Multi-room renovation" },
  addition: { label: "Room Addition", sub: "New square footage" },
};

export const FINISH_LABELS: Record<FinishLevel, { label: string; sub: string }> = {
  refresh: { label: "Refresh", sub: "Cosmetic upgrades, repaint" },
  "mid-range": { label: "Mid-Range", sub: "Replace and upgrade" },
  "high-end": { label: "High-End", sub: "Premium finishes" },
  luxury: { label: "Luxury", sub: "No constraints" },
};

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
      low: 15000, high: 35000, roi: 72,
      included: ["New countertops (laminate/entry quartz)", "Cabinet repaints or door replacement", "Standard appliance package", "New plumbing fixtures", "LVP or tile flooring"],
    },
    "mid-range": {
      low: 35000, high: 75000, roi: 74,
      included: ["Semi-custom cabinetry", "Quartz or granite countertops", "Mid-range appliance package", "Tile backsplash", "Updated plumbing and electrical"],
    },
    "high-end": {
      low: 75000, high: 150000, roi: 70,
      included: ["Custom or semi-custom cabinetry", "Premium stone countertops", "High-end appliance package", "Island addition or expansion", "Custom tile work and lighting redesign"],
    },
    luxury: {
      low: 150000, high: 300000, roi: 62,
      included: ["Fully custom cabinetry", "Exotic stone countertops", "Professional-grade appliances", "Structural layout changes", "Smart home integration"],
    },
  },
  bathroom: {
    refresh: {
      low: 5000, high: 15000, roi: 70,
      included: ["New vanity and mirror", "Tile shower refresh", "Updated fixtures and hardware", "New toilet if needed", "Lighting update"],
    },
    "mid-range": {
      low: 15000, high: 35000, roi: 71,
      included: ["Custom tile shower", "Semi-custom vanity", "Heated floors", "Updated plumbing", "New windows"],
    },
    "high-end": {
      low: 35000, high: 80000, roi: 65,
      included: ["Wet room or custom walk-in shower", "Freestanding soaking tub", "Radiant heated floors", "Custom built-ins", "High-end plumbing fixtures"],
    },
    luxury: {
      low: 80000, high: 160000, roi: 58,
      included: ["Steam shower system", "Spa soaking tub", "Heated floors and walls", "Full layout reconfiguration", "Designer fixtures throughout"],
    },
  },
  "whole-home": {
    refresh: {
      low: 25000, high: 60000, roi: 65,
      included: ["Kitchen and bath cosmetic refresh", "New flooring throughout", "Fresh interior paint", "Updated light fixtures"],
    },
    "mid-range": {
      low: 60000, high: 150000, roi: 68,
      included: ["Kitchen and bath mid-range renovation", "Open-concept conversion", "New flooring throughout", "Updated HVAC and windows"],
    },
    "high-end": {
      low: 150000, high: 350000, roi: 62,
      included: ["Custom kitchen and bath renovation", "Structural modifications", "New windows and doors", "High-end finishes throughout"],
    },
    luxury: {
      low: 350000, high: 700000, roi: 55,
      included: ["Full gut renovation", "Structural engineering", "Smart home system", "Premium finishes throughout", "New HVAC, electrical and plumbing"],
    },
  },
  addition: {
    refresh: {
      low: 40000, high: 80000, roi: 60,
      included: ["New room with standard finishes", "Basic electrical and HVAC", "Matching exterior siding and roofline"],
    },
    "mid-range": {
      low: 80000, high: 180000, roi: 63,
      included: ["Bedroom or family room addition", "Full HVAC integration", "Updated electrical panel", "Mid-range finishes"],
    },
    "high-end": {
      low: 180000, high: 400000, roi: 58,
      included: ["400 to 600 sqft addition", "High-end finishes", "Full integration with existing layout", "Custom windows and doors"],
    },
    luxury: {
      low: 400000, high: 750000, roi: 50,
      included: ["600+ sqft addition", "Structural engineering", "Premium finishes throughout", "Custom design integration"],
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

function getPlanningDetail(count: number): { level: ConfidenceLevel; percent: number } {
  if (count >= 4) return { level: "detailed", percent: 85 };
  if (count >= 2) return { level: "refined", percent: 65 };
  return { level: "starting", percent: 40 };
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

  if (project === "addition" && ref.stories !== null && ref.stories > 1) {
    low *= 1.12;
    high *= 1.2;
  }

  if (ref.cityZone) {
    const zoneMult: Record<CityZone, { low: number; high: number }> = {
      "boise-core": { low: 1.02, high: 1.05 },
      "treasure-valley": { low: 1, high: 1 },
      extended: { low: 1.03, high: 1.06 },
    };
    low *= zoneMult[ref.cityZone].low;
    high *= zoneMult[ref.cityZone].high;
  }

  if (ref.timeline === "accelerated") {
    low *= 1.05;
    high *= 1.15;
  } else if (ref.timeline === "flexible") {
    low *= 0.97;
    high *= 1;
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

const CABINET_SCOPE: Record<CabinetTier, string> = {
  standard: "Standard stock cabinetry",
  "semi-custom": "Semi-custom cabinetry",
  custom: "Fully custom cabinetry",
};

const ZONE_SCOPE: Record<CityZone, string | null> = {
  "boise-core": "Boise / Eagle permitting and access",
  "treasure-valley": null,
  extended: "Extended-area travel and logistics",
};

/**
 * Builds the scope list shown in the result panel. Refinement-driven items are
 * listed first (so the visible slice reflects the user's actual choices), then
 * the base scope for the project + finish level.
 */
export function buildDynamicScope(input: EstimateInput): string[] {
  const base = PRICE_MATRIX[input.project][input.finish].included;
  const r = input.refinements;
  const extra: string[] = [];

  const layoutItem = LAYOUT_SCOPE[r.layoutChanges];
  if (layoutItem) extra.push(layoutItem);

  const peItem = PE_SCOPE[r.plumbingElectrical];
  if (peItem) extra.push(peItem);

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

  if (r.cityZone) {
    const zoneItem = ZONE_SCOPE[r.cityZone];
    if (zoneItem) extra.push(zoneItem);
  }

  if (r.timeline === "accelerated") {
    extra.push("Accelerated project scheduling");
  }

  const seen = new Set<string>();
  return [...extra, ...base].filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

export function calculateEstimate(input: EstimateInput, userRefinementCount = 0): EstimateResult {
  const base = PRICE_MATRIX[input.project][input.finish];
  const sizeMult = getSizeMultiplier(input.sqft, input.project);
  const refMult = getRefinementMultipliers(input.refinements, input.project);
  const { level, percent } = getPlanningDetail(userRefinementCount);

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
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    roi: result.roi,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
  };
}
