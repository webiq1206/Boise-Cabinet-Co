import {
  applyFinishSlug,
  calculateEstimate,
  formatPlanningCurrency,
  getProjectSizeConfig,
  type ConstructionTier,
  type EstimateResult,
  type EstimateSelections,
  type ProjectType,
} from "@/shared/estimateEngine";
import { resolveDoorStyleSlug } from "@/shared/catalog/doorStyles";
import { resolveFinishSlug } from "@/shared/catalog/finishes";
import { buildLayoutSummary } from "./layoutSummary";
import type { DesignState } from "@/components/design-studio/DesignStudioProvider";

const PROJECT_TYPES: ReadonlySet<string> = new Set<ProjectType>([
  "kitchen",
  "bathroom",
  "laundry",
  "mudroom",
  "home-office",
  "entertainment",
  "built-ins",
  "pantry",
]);

/** Coerce a design room slug to a known estimator project type. */
function toProjectType(roomType: string | null): ProjectType {
  if (roomType && PROJECT_TYPES.has(roomType)) return roomType as ProjectType;
  return "kitchen";
}

export interface DesignEstimateOptions {
  /** Overrides the linear-foot size derived from the placed layout. */
  size?: number;
  /** Box construction quality tuner ("" until the visitor picks one). */
  construction?: ConstructionTier | "";
}

/** Build estimator selections from the current design + optional tuners. */
export function designToEstimateSelections(
  design: DesignState,
  opts: DesignEstimateOptions = {},
): EstimateSelections {
  const project = toProjectType(design.roomType);
  const cfg = getProjectSizeConfig(project);

  // Size: prefer an explicit tuner, then the placed layout's linear feet, then
  // the room width. No project-default fallback - the brand rule is "nothing
  // selected by default", so a design with no size source is not priceable yet.
  let size: number | null = opts.size ?? null;
  if (size == null) {
    const summary = buildLayoutSummary({
      modules: design.modules,
      roomBounds: design.roomBounds,
      roomMeta: design.roomMeta,
      layout: design.layout,
    });
    if (summary.approximateLinearFeet > 0) {
      size = summary.approximateLinearFeet;
    } else if (design.roomMeta?.widthIn) {
      size = Math.round(design.roomMeta.widthIn / 12);
    }
  }

  let selections: EstimateSelections = {
    project,
    layout: design.layout ?? "",
    size,
    // Designs don't separate base vs. wall runs, so model a typical upper run
    // (~0.75 × base) for projects that have uppers; null otherwise.
    sizeUpper: cfg.uppers && size != null ? Math.round(size * 0.75) : null,
    doorStyle: design.doorStyle ? resolveDoorStyleSlug(design.doorStyle) : "",
    finishSlug: "",
    finishCategory: "",
    finishTier: "",
    construction: opts.construction ?? "",
  };

  if (design.finish) {
    selections = applyFinishSlug(selections, resolveFinishSlug(design.finish));
  }

  return selections;
}

/** Count meaningful selections made so far (drives the confidence indicator). */
function countSelections(design: DesignState): number {
  let n = 0;
  if (design.layout) n += 1;
  if (design.roomMeta) n += 1; // size
  if (design.doorStyle) n += 1;
  if (design.finish) n += 2; // finish color + tier
  return n;
}

export interface DesignEstimate extends EstimateResult {
  /** Pre-formatted planning range, e.g. "$18k - $30k". */
  rangeLabel: string;
  priceLowLabel: string;
  priceHighLabel: string;
  /** Plain-language project timeline range. */
  timelineLabel: string;
}

/** Rough install-to-completion timeline by room type (planning only). */
const TIMELINE_WEEKS: Record<ProjectType, [number, number]> = {
  kitchen: [6, 10],
  bathroom: [4, 7],
  laundry: [4, 6],
  mudroom: [4, 6],
  "home-office": [4, 7],
  entertainment: [5, 8],
  "built-ins": [4, 7],
  pantry: [4, 6],
};

/**
 * Live planning estimate for a design, or null while the design lacks a size
 * source (no layout, room scan, or size tuner yet). Callers show a
 * "complete your room to see a range" prompt for the null case instead of a
 * fabricated default-filled price.
 */
export function getDesignEstimate(
  design: DesignState,
  opts: DesignEstimateOptions = {},
): DesignEstimate | null {
  const selections = designToEstimateSelections(design, opts);
  const result = calculateEstimate(selections, countSelections(design));
  if (!result) return null;
  const project = toProjectType(design.roomType);
  const [wkLow, wkHigh] = TIMELINE_WEEKS[project];

  return {
    ...result,
    rangeLabel: `${formatPlanningCurrency(result.priceLow)} - ${formatPlanningCurrency(result.priceHigh)}`,
    priceLowLabel: formatPlanningCurrency(result.priceLow),
    priceHighLabel: formatPlanningCurrency(result.priceHigh),
    timelineLabel: `${wkLow}-${wkHigh} weeks`,
  };
}
