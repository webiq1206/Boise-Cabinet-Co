/**
 * The complete, structured record of what a homeowner selected, saw, and was
 * told in the estimator.
 *
 * This exists so the sales team never has to reconstruct a lead from a price
 * range and a project label. It is the single source of truth carried
 * end-to-end: built in the wizard from the raw selections, posted to
 * /api/consultation, stored on the lead, rendered into both emails, and
 * forwarded to the external lead dashboard.
 *
 * Design rule, and the reason some lists here are shorter than you might
 * expect: this record mirrors WHAT THE HOMEOWNER WAS ACTUALLY SHOWN. It never
 * adds assumptions, inclusions, or exclusions that the estimator did not
 * display. A record claiming the homeowner was told something they never saw
 * would be worse than no record at all, because the team would act on it.
 */

import {
  APPLIANCE_DISCLAIMER,
  CONSTRUCTION_OPTIONS,
  ESTIMATE_RANGE_DISCLAIMER,
  FINISH_CATEGORY_OPTIONS,
  FINISH_TIER_OPTIONS,
  INCLUDED_SCOPE_NOTE,
  PROJECT_LABELS,
  calculateCombinedEstimate,
  formatPlanningCurrency,
  getDoorStyleOptions,
  getFinishColorOptions,
  getLayoutOptions,
  isPriceable,
  type EstimateSelections,
  type ProjectType,
} from "./estimateEngine";

export const ESTIMATE_RECORD_VERSION = 1;

/** One room, with both the raw selection values and their display labels. */
export interface EstimateRecordRoom {
  /** 1-based position in the homeowner's own room list. */
  index: number;
  project: string;
  projectLabel: string;
  sizeLabel: string;
  /** Base (lower) cabinet run in linear feet. */
  sizeBaseLf: number | null;
  /** Wall (upper) cabinet run in linear feet; null for projects without uppers. */
  sizeUpperLf: number | null;
  layout: string;
  layoutLabel: string;
  doorStyle: string;
  doorStyleLabel: string;
  finishSlug: string;
  finishLabel: string;
  finishCategory: string;
  finishCategoryLabel: string;
  finishTier: string;
  finishTierLabel: string;
  construction: string;
  constructionLabel: string;
  /** The one-line scope string the homeowner saw on the result panel. */
  scopeSummary: string;
  priceLow: number;
  priceHigh: number;
  priceRangeFormatted: string;
}

export interface EstimateRecord {
  version: number;
  /** ISO timestamp of when the homeowner submitted. */
  capturedAt: string;
  rangeLow: number;
  rangeHigh: number;
  /** The range exactly as the homeowner saw it, e.g. "$28k to $41k". */
  rangeFormatted: string;
  confidenceLabel: string;
  confidencePercent: number;
  roomCount: number;
  rooms: EstimateRecordRoom[];
  /** "What's typically included", verbatim from the result panel. */
  included: string[];
  /** Only what the estimator actually told the homeowner is excluded. */
  excluded: string[];
  /** Standing assumptions displayed alongside the range. */
  assumptions: string[];
  /** Disclaimers shown verbatim, so we know exactly what they were told. */
  disclaimers: string[];
  /** Homeowner's stated budget, when they gave one. */
  budget: string | null;
  /** Free-text notes the homeowner typed. */
  notes: string | null;
  /** Full property address as selected from autocomplete. */
  propertyAddress: string | null;
}

function labelFor(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * Assumptions and exclusions are derived from what the result panel renders.
 * The appliance line is only shown on kitchen projects, so it is only recorded
 * when a kitchen is actually part of the estimate.
 */
function buildExclusions(rooms: EstimateSelections[]): string[] {
  const out: string[] = [];
  if (rooms.some((r) => r.project === "kitchen")) out.push(APPLIANCE_DISCLAIMER);
  return out;
}

function buildAssumptions(rooms: EstimateRecordRoom[]): string[] {
  const out = [INCLUDED_SCOPE_NOTE];
  out.push(
    `Range covers ${rooms.length === 1 ? "the room" : `all ${rooms.length} rooms`} selected above and nothing outside that scope.`,
  );
  const withUppers = rooms.filter((r) => r.sizeUpperLf !== null);
  if (withUppers.length) {
    out.push(
      "Base (lower) and wall (upper) cabinet runs are priced separately, at the linear footage the homeowner set.",
    );
  }
  return out;
}

export interface BuildEstimateRecordInput {
  rooms: EstimateSelections[];
  capturedAt: string;
  budget?: string | null;
  notes?: string | null;
  propertyAddress?: string | null;
}

/**
 * Build the record from the raw wizard selections. Returns null when nothing is
 * priceable yet, matching calculateCombinedEstimate's contract.
 *
 * Only priceable rooms are priced, so the raw list is filtered the same way
 * before zipping - otherwise the indices would drift apart and a room's
 * selections would be attached to another room's price.
 */
export function buildEstimateRecord(
  input: BuildEstimateRecordInput,
): EstimateRecord | null {
  const combined = calculateCombinedEstimate(input.rooms);
  if (!combined) return null;

  const priceable = input.rooms.filter(isPriceable);
  const doorStyleOptions = getDoorStyleOptions();

  const rooms: EstimateRecordRoom[] = combined.rooms.map((priced, i) => {
    const sel = priceable[i];
    const project = (sel?.project ?? priced.project) as ProjectType;
    return {
      index: i + 1,
      project,
      projectLabel: priced.projectLabel || PROJECT_LABELS[project]?.label || project,
      sizeLabel: priced.sizeLabel,
      sizeBaseLf: sel?.size ?? null,
      sizeUpperLf: sel?.sizeUpper ?? null,
      layout: sel?.layout ?? "",
      layoutLabel: sel?.layout ? labelFor(getLayoutOptions(project), sel.layout) : "",
      doorStyle: sel?.doorStyle ?? "",
      doorStyleLabel: sel?.doorStyle ? labelFor(doorStyleOptions, sel.doorStyle) : "",
      finishSlug: sel?.finishSlug ?? "",
      finishLabel: sel?.finishSlug
        ? labelFor(getFinishColorOptions(sel.doorStyle), sel.finishSlug)
        : "",
      finishCategory: sel?.finishCategory ?? "",
      finishCategoryLabel: sel?.finishCategory
        ? labelFor(FINISH_CATEGORY_OPTIONS, sel.finishCategory)
        : "",
      finishTier: sel?.finishTier ?? "",
      finishTierLabel: sel?.finishTier ? labelFor(FINISH_TIER_OPTIONS, sel.finishTier) : "",
      construction: sel?.construction ?? "",
      constructionLabel: sel?.construction
        ? labelFor(CONSTRUCTION_OPTIONS, sel.construction)
        : "",
      scopeSummary: priced.scopeSummary,
      priceLow: priced.priceLow,
      priceHigh: priced.priceHigh,
      priceRangeFormatted: `${formatPlanningCurrency(priced.priceLow)} to ${formatPlanningCurrency(priced.priceHigh)}`,
    };
  });

  return {
    version: ESTIMATE_RECORD_VERSION,
    capturedAt: input.capturedAt,
    rangeLow: combined.priceLow,
    rangeHigh: combined.priceHigh,
    rangeFormatted: `${formatPlanningCurrency(combined.priceLow)} to ${formatPlanningCurrency(combined.priceHigh)}`,
    confidenceLabel: combined.confidenceLabel,
    confidencePercent: combined.confidencePercent,
    roomCount: rooms.length,
    rooms,
    included: combined.included,
    excluded: buildExclusions(priceable),
    assumptions: buildAssumptions(rooms),
    disclaimers: [ESTIMATE_RANGE_DISCLAIMER],
    budget: input.budget?.trim() || null,
    notes: input.notes?.trim() || null,
    propertyAddress: input.propertyAddress?.trim() || null,
  };
}

/** Selection lines for one room, skipping steps that project never showed. */
function roomSelectionLines(room: EstimateRecordRoom): string[] {
  const pairs: Array<[string, string]> = [
    ["Size", room.sizeLabel],
    ["Layout", room.layoutLabel],
    ["Door style", room.doorStyleLabel],
    ["Color", room.finishLabel],
    ["Finish style", room.finishCategoryLabel],
    ["Finish tier", room.finishTierLabel],
    ["Construction", room.constructionLabel],
  ];
  return pairs.filter(([, v]) => v).map(([k, v]) => `    ${k}: ${v}`);
}

/**
 * Render the record as readable plain text.
 *
 * This is what gets written into the CRM's free-text scope field. Structured
 * JSON is sent alongside it, but the CRM is only guaranteed to have the text
 * field, so this block has to stand on its own: consistent section order, no
 * markup, and scannable at a glance in a notes pane.
 */
export function formatEstimateRecordText(record: EstimateRecord): string {
  const L: string[] = [];

  L.push("=== ESTIMATE SUMMARY ===");
  L.push(`Planning range: ${record.rangeFormatted}`);
  L.push(`Range confidence: ${record.confidenceLabel} (${record.confidencePercent}%)`);
  L.push(`Rooms estimated: ${record.roomCount}`);
  if (record.propertyAddress) L.push(`Property address: ${record.propertyAddress}`);
  if (record.budget) L.push(`Stated budget: ${record.budget}`);
  L.push(`Captured: ${record.capturedAt}`);

  L.push("");
  L.push("=== SELECTIONS BY ROOM ===");
  for (const room of record.rooms) {
    L.push(`  ${room.index}. ${room.projectLabel} - ${room.priceRangeFormatted}`);
    L.push(...roomSelectionLines(room));
    if (room.scopeSummary) L.push(`    Scope shown: ${room.scopeSummary}`);
  }

  const section = (title: string, items: string[]) => {
    if (!items.length) return;
    L.push("");
    L.push(`=== ${title} ===`);
    items.forEach((i) => L.push(`  - ${i}`));
  };

  section("INCLUDED IN RANGE", record.included);
  section("EXCLUDED FROM RANGE", record.excluded);
  section("ASSUMPTIONS", record.assumptions);
  section("DISCLAIMERS SHOWN TO HOMEOWNER", record.disclaimers);

  if (record.notes) {
    L.push("");
    L.push("=== HOMEOWNER NOTES ===");
    L.push(`  ${record.notes}`);
  }

  return L.join("\n");
}
