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
  "Common scope examples for this project type and finish level. Your final scope is defined during consultation.";

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
      extended: { low: 0.96, high: 0.98 },
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

function narrowRange(low: number, high: number, detailPercent: number): { low: number; high: number } {
  const mid = (low + high) / 2;
  const halfSpan = (high - low) / 2;
  const narrowFactor = 1 - (detailPercent / 100) * 0.35;
  const newHalfSpan = halfSpan * narrowFactor;
  return {
    low: Math.round((mid - newHalfSpan) / 1000) * 1000,
    high: Math.round((mid + newHalfSpan) / 1000) * 1000,
  };
}

export function calculateEstimate(input: EstimateInput, userRefinementCount = 0): EstimateResult {
  const base = PRICE_MATRIX[input.project][input.finish];
  const sizeMult = getSizeMultiplier(input.sqft, input.project);
  const refMult = getRefinementMultipliers(input.refinements, input.project);
  const { level, percent } = getPlanningDetail(userRefinementCount);

  let priceLow = base.low * sizeMult * refMult.low;
  let priceHigh = base.high * sizeMult * refMult.high;

  priceLow = Math.round(priceLow / 1000) * 1000;
  priceHigh = Math.round(priceHigh / 1000) * 1000;

  if (userRefinementCount >= 2) {
    const narrowed = narrowRange(priceLow, priceHigh, percent);
    priceLow = narrowed.low;
    priceHigh = narrowed.high;
  }

  return {
    priceLow,
    priceHigh,
    roi: base.roi,
    included: base.included,
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
