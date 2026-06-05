import {
  applyFinishSlug,
  calculateEstimate,
  formatPlanningCurrency,
  getDefaultSelectionsForProject,
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
  /** Box construction quality tuner (defaults to "better"). */
  construction?: ConstructionTier;
}

/** Build estimator selections from the current design + optional tuners. */
export function designToEstimateSelections(
  design: DesignState,
  opts: DesignEstimateOptions = {},
): EstimateSelections {
  const project = toProjectType(design.roomType);
  const base = getDefaultSelectionsForProject(project);
  const cfg = getProjectSizeConfig(project);

  // Size: prefer an explicit tuner, then the placed layout's linear feet, then
  // the room width, then the project default.
  let size = opts.size;
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
    } else {
      size = cfg.default;
    }
  }

  let selections: EstimateSelections = {
    ...base,
    project,
    layout: design.layout ?? base.layout,
    size,
    doorStyle: design.doorStyle
      ? resolveDoorStyleSlug(design.doorStyle)
      : base.doorStyle,
    accessories: design.accessories ?? [],
    construction: opts.construction ?? base.construction,
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
  if (design.accessories.length > 0) n += 1;
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

export function getDesignEstimate(
  design: DesignState,
  opts: DesignEstimateOptions = {},
): DesignEstimate {
  const selections = designToEstimateSelections(design, opts);
  const result = calculateEstimate(selections, countSelections(design));
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
