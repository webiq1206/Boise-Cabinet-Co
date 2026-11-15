/** Private deterministic pricing. Only server routes and server-side callers may import this module. */
if (typeof window !== 'undefined') throw new Error('Cabinet pricing is server-only');
import {sharedBookRate} from '../lib/p5/priceBook.ts';
import {COST_CATEGORIES,DEFAULT_FINANCE,calculateP5Estimate,customerEstimate,type DirectCostLine} from '../lib/p5/pricing.ts';
import {PROJECT_SIZE_CONFIG,PROJECT_LABELS,PLANNING_DETAIL_LABELS,isPriceable,normalizeSelections,getTotalSteps,getConfidence,buildIncluded,buildScopeSummary,getSizeLabel,roomSelectionsMade,roundPrice,buildStoredEstimate as publicStored,buildCombinedStoredEstimate as publicCombinedStored,type ConstructionTier,type ProjectType,type EstimateSelections,type EstimateResult,type ConfidenceLevel,type RoomEstimate,type CombinedEstimateResult,type StoredEstimate,type CombinedStoredEstimate} from '../shared/estimateEngine.ts';
export * from '../shared/estimateEngine.ts';
export interface ProjectBookLines {
  /** Linear-foot code for the base run, or null when the book has no matching unit. */
  base: string | null;
  /** Linear-foot code for the wall run, or null when uppers are not a separate line. */
  upper: string | null;
}

export const PROJECT_BOOK_LINES: Record<ProjectType, ProjectBookLines> = {
  kitchen: { base: "12-32-01", upper: "12-32-02" },
  bathroom: { base: "12-41-03", upper: null },
  laundry: { base: "12-43-02", upper: "12-43-01" },
  mudroom: { base: "12-42-01", upper: "12-42-04" },
  // 12-44-06 is "Home office desk + uppers" per linear foot, so the upper slider is not a second line.
  "home-office": { base: "12-44-06", upper: null },
  // 12-44-04 Media / entertainment wall is priced each, not per linear foot.
  entertainment: { base: null, upper: null },
  // 12-44-02 is the linear-foot built-in. There is no separate built-in upper code.
  "built-ins": { base: "12-44-02", upper: null },
  pantry: { base: "12-32-16", upper: null },
};

/** Membership list for the room pages and the selection schema. Not a price table. */
export const PROJECT_PRICING: Record<ProjectType, ProjectBookLines> = PROJECT_BOOK_LINES;

/** Wizard level to the cost book's four columns. */
export const LEVEL_TO_BOOK: Record<ConstructionTier, "builder"|"mid"|"high"|"luxury"> = {
  essential: "builder",
  signature: "mid",
  premium: "high",
  luxury: "luxury",
};




/** Resale ROI shown beside a saved estimate. Not used to price the range. */
const PROJECT_ROI: Record<ProjectType, number> = {
  kitchen: 72,
  bathroom: 68,
  laundry: 62,
  mudroom: 58,
  "home-office": 55,
  entertainment: 58,
  "built-ins": 60,
  pantry: 56,
};


/** Direct unit cost from the shared book, or null when the code is not a unit price. Never display this. */
export function wizardUnitRate(code: string, level: ConstructionTier): number | null {
  const rate = sharedBookRate(code, LEVEL_TO_BOOK[level], false);
  return rate && Number.isFinite(rate.amount) ? rate.amount : null;
}


const BOOK_EVIDENCE_DATES = { verifiedAt: "2026-09-11", validUntil: "2027-09-11" };


/**
 * Customer planning range for book lines. Quantity times the direct rate goes
 * into calculateP5Estimate. This function does not apply its own markup.
 */
export function cabinetCustomerRange(
  parts: { code: string; quantity: number }[],
  level: ConstructionTier,
): { low: number; high: number } | null {
  if (!parts.length || parts.some((part) => !(part.quantity > 0))) return null;
  const lines: DirectCostLine[] = [];
  for (const [index, part] of parts.entries()) {
    const rate = sharedBookRate(part.code, LEVEL_TO_BOOK[level], false);
    if (!rate) return null;
    lines.push({
      id: `cabinet-${index + 1}`,
      category: "subcontractors",
      description: "Installed cabinetry",
      quantity: part.quantity,
      unit: rate.unit,
      unitCost: rate.amount,
      quantitySource: `Wizard quantity: ${part.quantity} ${rate.unit}`,
      priceBasis: "direct-cost",
      estimatingBasis: "owner-average-cost",
      evidence: {
        basis: "owner-estimating-schedule",
        reference: `${rate.code} shared cost book`,
        ...BOOK_EVIDENCE_DATES,
      },
    });
  }
  const coverage = COST_CATEGORIES.map((category) => ({
    category,
    status: (category === "subcontractors" ? "included" : "not-applicable") as "included" | "not-applicable",
    reason: category === "subcontractors"
      ? "Installed cabinetry priced from the shared cost book."
      : "Not part of this cabinet planning total.",
  }));
  const estimate = calculateP5Estimate(
    {
      estimatePurpose: "preliminary",
      bookPriced: true,
      service: "cabinet-install",
      revision: "cabinet-wizard",
      scopeSummary: "Cabinet planning range",
      lines,
      coverage,
      risks: [],
      assumptions: [],
      exclusions: [],
      missingInformation: [],
      allowances: [],
      uncertainty: "medium",
      locationProvided: false,
    },
    DEFAULT_FINANCE,
  );
  const customer = customerEstimate(estimate, "Cabinet planning range");
  return customer.range;
}


export function calculateEstimate(
  selections: EstimateSelections,
  selectionsMade = 0,
): EstimateResult | null {
  // No project or size means the visitor has not made a priceable selection yet.
  // Return null so the UI shows the "make your selections" prompt instead of a
  // fabricated range, and nothing is stored for the consultation form.
  if (!isPriceable(selections)) return null;
  const sel = normalizeSelections(selections);
  const project = sel.project as ProjectType;
  const lines = PROJECT_BOOK_LINES[project];
  const cfg = PROJECT_SIZE_CONFIG[project];
  const level = sel.construction || "essential";
  if (!lines.base) return null;
  const parts = [{ code: lines.base, quantity: sel.size! }];
  if (lines.upper && cfg.uppers) parts.push({ code: lines.upper, quantity: sel.sizeUpper ?? 0 });
  const pricedParts = parts.filter((part) => part.quantity > 0);
  const range = cabinetCustomerRange(pricedParts, level);
  if (!range) return null;

  const total = getTotalSteps(project);
  const { level: confidenceLevel, percent } = getConfidence(selectionsMade, total);

  return {
    priceLow: range.low,
    priceHigh: range.high,
    roi: PROJECT_ROI[project],
    included: buildIncluded(sel),
    confidence: confidenceLevel,
    confidenceLabel: PLANNING_DETAIL_LABELS[confidenceLevel],
    confidencePercent: percent,
    scopeSummary: buildScopeSummary(sel),
    selectionsMade,
    totalSteps: total,
  };
}


/**
 * Sum an array of per-room selections into one planning range. Only priceable
 * rooms (project + size set) contribute, so the range reflects only rooms the
 * visitor has actually specified. Returns null until at least one is priceable.
 */
export function calculateCombinedEstimate(
  rooms: EstimateSelections[],
): CombinedEstimateResult | null {
  const roomEstimates: RoomEstimate[] = [];
  const includedSet = new Set<string>();
  let low = 0;
  let high = 0;
  let percentSum = 0;
  for (const room of rooms) {
    if (!isPriceable(room)) continue;
    const res = calculateEstimate(room, roomSelectionsMade(room));
    if (!res) continue;
    const project = room.project as ProjectType;
    low += res.priceLow;
    high += res.priceHigh;
    percentSum += res.confidencePercent;
    res.included.forEach((i) => includedSet.add(i));
    roomEstimates.push({
      project,
      projectLabel: PROJECT_LABELS[project].label,
      sizeLabel: getSizeLabel(project, room.size as number, room.sizeUpper),
      scopeSummary: buildScopeSummary(room),
      priceLow: res.priceLow,
      priceHigh: res.priceHigh,
    });
  }
  if (!roomEstimates.length) return null;
  const percent = Math.round(percentSum / roomEstimates.length);
  const level: ConfidenceLevel =
    percent >= 90 ? "detailed" : percent >= 65 ? "refined" : "starting";
  return {
    priceLow: roundPrice(low),
    priceHigh: roundPrice(high),
    rooms: roomEstimates,
    included: [...includedSet],
    confidence: level,
    confidenceLabel: PLANNING_DETAIL_LABELS[level],
    confidencePercent: percent,
  };
}
export function buildStoredEstimate(selections:EstimateSelections,selectionsMade=0):StoredEstimate|null {return publicStored(selections,selectionsMade,calculateEstimate(selections,selectionsMade));}
export function buildCombinedStoredEstimate(rooms:EstimateSelections[]):CombinedStoredEstimate|null {return publicCombinedStored(rooms,calculateCombinedEstimate(rooms));}
