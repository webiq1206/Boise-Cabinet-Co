export type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition";
export type FinishLevel = "refresh" | "mid-range" | "high-end" | "luxury";
export type LayoutChanges = "none" | "moderate" | "major";
export type PlumbingElectrical = "cosmetic" | "partial" | "full";
export type CabinetTier = "standard" | "semi-custom" | "custom";
export type CityZone = "boise-core" | "treasure-valley" | "extended";
export type Timeline = "flexible" | "standard" | "accelerated";
export type ConfidenceLevel = "starting" | "refined" | "detailed";

export interface PriceData {
  low: number;
  high: number;
  roi: number;
  included: string[];
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

export const DEFAULT_ESTIMATE_INPUT: EstimateInput = {
  project: "kitchen",
  finish: "mid-range",
  sqft: 250,
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

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  starting: "Starting guidance",
  refined: "Refined guidance",
  detailed: "Detailed planning range",
};

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

function countRefinements(ref: EstimateRefinements, project: ProjectType): number {
  let count = 0;
  if (ref.layoutChanges !== "none") count++;
  if (ref.plumbingElectrical !== "cosmetic") count++;
  if (ref.cityZone) count++;
  if (ref.timeline) count++;
  if (project === "kitchen" && ref.cabinetTier) count++;
  if (project === "bathroom" && ref.fixtureCount !== null) count++;
  if (project === "whole-home" && ref.roomCount !== null) count++;
  if (project === "addition" && ref.stories !== null) count++;
  return count;
}

function getConfidence(count: number): { level: ConfidenceLevel; percent: number } {
  if (count >= 4) return { level: "detailed", percent: 85 };
  if (count >= 2) return { level: "refined", percent: 65 };
  return { level: "starting", percent: 40 };
}

function getSizeMultiplier(sqft: number): number {
  return Math.max(0.5, Math.min(2.5, sqft / 300));
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

function narrowRange(low: number, high: number, confidencePercent: number): { low: number; high: number } {
  const mid = (low + high) / 2;
  const halfSpan = (high - low) / 2;
  const narrowFactor = 1 - (confidencePercent / 100) * 0.35;
  const newHalfSpan = halfSpan * narrowFactor;
  return {
    low: Math.round((mid - newHalfSpan) / 1000) * 1000,
    high: Math.round((mid + newHalfSpan) / 1000) * 1000,
  };
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const base = PRICE_MATRIX[input.project][input.finish];
  const sizeMult = getSizeMultiplier(input.sqft);
  const refMult = getRefinementMultipliers(input.refinements, input.project);
  const refinementsApplied = countRefinements(input.refinements, input.project);
  const { level, percent } = getConfidence(refinementsApplied);

  let priceLow = base.low * sizeMult * refMult.low;
  let priceHigh = base.high * sizeMult * refMult.high;

  priceLow = Math.round(priceLow / 1000) * 1000;
  priceHigh = Math.round(priceHigh / 1000) * 1000;

  if (refinementsApplied >= 2) {
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
    confidenceLabel: CONFIDENCE_LABELS[level],
    confidencePercent: percent,
    refinementsApplied,
  };
}

export interface StoredEstimate extends EstimateInput {
  priceLow: number;
  priceHigh: number;
  roi: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
}

export function buildStoredEstimate(input: EstimateInput): StoredEstimate {
  const result = calculateEstimate(input);
  return {
    ...input,
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    roi: result.roi,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
  };
}
