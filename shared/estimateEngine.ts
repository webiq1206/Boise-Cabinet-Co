import { DOOR_STYLES } from "./catalog/doorStyles";
import { FINISH_BY_SLUG } from "./catalog/finishes";
import { getDoorStyleImages, getFinishImages } from "./catalog/entityImages";
import { getFinishesForDoorStyle } from "./catalog/queries";
import { LAYOUT_BY_SLUG } from "./catalog/layouts";

/**
 * Cabinet-specific Project Estimator engine.
 *
 * Pricing is grounded in the real Boise Cabinet Co catalog: the single custom
 * cabinet offering, the six catalog door styles, the matte / woodgrain / gloss
 * finish categories and the catalog finish price tiers, and Good / Better / Best
 * box construction. Option lists are pulled from `shared/catalog/*` so the
 * estimator and catalog never drift.
 *
 * The model composes a base from layout + size (linear-foot driven), then
 * applies multipliers for door style, finish category, finish tier, and
 * construction quality. Every upgrade raises the range monotonically; every
 * downgrade lowers it.
 *
 * There is exactly one cabinet line (custom), so there is no "line" step and no
 * "Reserve" multiplier. Finish price is communicated with `$` tiers, never
 * "Standard / Premium / Luxury" or supplier/brand names.
 */

export type ProjectType =
  | "kitchen"
  | "bathroom"
  | "laundry"
  | "mudroom"
  | "home-office"
  | "entertainment"
  | "built-ins"
  | "pantry";
export type FinishCategory = "matte" | "woodgrain" | "gloss";
/** Internal pricing tier; never rendered as a word - shown as `$` tiers only. */
export type FinishTier = "standard" | "premium" | "reserve";
export type ConstructionTier = "good" | "better" | "best";
export type ConfidenceLevel = "starting" | "refined" | "detailed";

export type SelectionStepKey =
  | "layout"
  | "size"
  | "doorStyle"
  | "finishColor"
  | "finish"
  | "construction";

export interface EstimateSelections {
  /** Chosen project, or null until the visitor picks one (nothing is pre-selected). */
  project: ProjectType | null;
  /** Layout slug from the catalog; "" when the project has no layout step. */
  layout: string;
  /** Base (lower) run in linear feet, or null until the visitor sets the slider. */
  size: number | null;
  /**
   * Wall (upper) cabinet run in linear feet, for projects that have uppers.
   * Null until set; 0 means few/no uppers. Always null for projects without
   * a separate upper run (vanities, full-height pantries).
   */
  sizeUpper: number | null;
  /** Door style id (slab, modern-shaker, thin-shaker, etc.); "" until chosen. */
  doorStyle: string;
  /** Optional catalog finish slug; empty string skips named-color selection. */
  finishSlug: string;
  /** Finish style; "" until chosen. */
  finishCategory: FinishCategory | "";
  /** Color tier; "" until chosen (no longer surfaced as its own step). */
  finishTier: FinishTier | "";
  /** Construction quality; "" until chosen. */
  construction: ConstructionTier | "";
}

/**
 * An estimate can only be priced once the visitor has intentionally chosen a
 * project and a size. Nothing is assumed from defaults: if these are missing we
 * show the "make your selections" prompt instead of a number, and we never
 * store an estimate for the consultation form.
 */

export interface EstimateResult {
  priceLow: number;
  priceHigh: number;
  roi: number;
  included: string[];
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  confidencePercent: number;
  /** Product-named scope line, e.g. "Thin Shaker · Matte finish ($$$) · Best construction". */
  scopeSummary: string;
  selectionsMade: number;
  totalSteps: number;
}

// ============================================================================
// MODELED TREASURE VALLEY PRICING - EDIT HERE
// ----------------------------------------------------------------------------
// These are PLANNING figures modeled on Boise Cabinet Co's offering and typical
// Treasure Valley installed-cabinetry rates. They are NOT a supplier price sheet
// and not a per-cabinet quote. Every dollar figure the estimator uses lives in
// this block - tune these numbers to refine the estimator.
//
// How the math works:
//   priceLow  = round( (perUnitLow  × baseLF + upperPerUnitLow  × upperLF) × mult )
//   priceHigh = round( (perUnitHigh × baseLF + upperPerUnitHigh × upperLF) × mult )
//   multiplier = layout × doorStyle × finishCategory × finishTier
//              × construction
//
// For projects with wall (upper) cabinets, the base (lower) and upper runs are
// priced separately: uppers cost less per linear foot than base cabinets. The
// lower-run rate is scaled (~0.69) and the upper-run rate (~0.41) is set so that
// a typical mix (uppers ≈ 0.75 × base run) lands close to the previous single-
// run pricing. Projects without uppers (bathroom vanities, full-height pantries)
// keep the full per-LF rate and an upper rate of 0.
// ============================================================================

/**
 * Installed price per linear foot, low/high band, plus resale ROI per room.
 * `perUnit*` price the base (lower) run; `upperPerUnit*` price the wall (upper)
 * run. Upper rates are 0 for projects that have no separate upper cabinets.
 */
export const PROJECT_PRICING: Record<
  ProjectType,
  {
    perUnitLow: number;
    perUnitHigh: number;
    upperPerUnitLow: number;
    upperPerUnitHigh: number;
    roi: number;
  }
> = {
  kitchen: { perUnitLow: 360, perUnitHigh: 605, upperPerUnitLow: 215, upperPerUnitHigh: 360, roi: 72 },
  bathroom: { perUnitLow: 460, perUnitHigh: 820, upperPerUnitLow: 0, upperPerUnitHigh: 0, roi: 68 },
  laundry: { perUnitLow: 260, perUnitHigh: 470, upperPerUnitLow: 155, upperPerUnitHigh: 280, roi: 62 },
  mudroom: { perUnitLow: 250, perUnitHigh: 440, upperPerUnitLow: 150, upperPerUnitHigh: 260, roi: 58 },
  "home-office": { perUnitLow: 275, perUnitHigh: 495, upperPerUnitLow: 165, upperPerUnitHigh: 295, roi: 55 },
  entertainment: { perUnitLow: 290, perUnitHigh: 525, upperPerUnitLow: 170, upperPerUnitHigh: 310, roi: 58 },
  "built-ins": { perUnitLow: 260, perUnitHigh: 485, upperPerUnitLow: 155, upperPerUnitHigh: 285, roi: 60 },
  pantry: { perUnitLow: 320, perUnitHigh: 600, upperPerUnitLow: 0, upperPerUnitHigh: 0, roi: 56 },
};

/** Door style premium, keyed by door style id. */
export const DOOR_STYLE_MULTIPLIER: Record<string, number> = {
  slab: 1.0,
  "three-piece": 1.08,
  "modern-shaker": 1.05,
  "thin-shaker": 1.1,
  "alpha-shaker": 1.12,
  "beta-shaker": 1.15,
  /** @deprecated */
  shaker: 1.05,
};

/** Finish category premium. Woodgrain laminates and high-gloss cost more than matte. */
export const FINISH_CATEGORY_MULTIPLIER: Record<FinishCategory, number> = {
  matte: 1.0,
  woodgrain: 1.1,
  gloss: 1.18,
};

/** Finish price-tier premium across the catalog color tiers ($ -> $$$). */
export const FINISH_TIER_MULTIPLIER: Record<FinishTier, number> = {
  standard: 1.0,
  premium: 1.12,
  reserve: 1.26,
};

/** Box construction quality premium (Good / Better / Best). */
export const CONSTRUCTION_MULTIPLIER: Record<ConstructionTier, number> = {
  good: 1.0,
  better: 1.12,
  best: 1.3,
};

/** Layout complexity premium, keyed by catalog layout slug. More corners cost more. */
export const LAYOUT_COMPLEXITY_MULTIPLIER: Record<string, number> = {
  galley: 1.0,
  "l-shape": 1.05,
  "u-shape": 1.12,
  island: 1.16,
  peninsula: 1.08,
  "single-vanity": 1.0,
  "double-vanity": 1.12,
};

/** Rounding increment for the displayed planning range, in dollars. */
const PRICE_ROUND_TO = 100;

// ============================================================================
// END MODELED PRICING
// ============================================================================

export interface ProjectSizeConfig {
  min: number;
  max: number;
  step: number;
  default: number;
  unit: "linear-ft" | "rooms";
  unitNoun: string;
  unitNounSingular: string;
  /** Short noun for the slider end labels, e.g. "lf" or "ft". */
  unitShort: string;
  /** Step header for the size selector. */
  sizeStepLabel: string;
  /**
   * Present when the project has separate wall (upper) cabinets, priced apart
   * from the base run. Absent for vanities and full-height pantries.
   */
  uppers?: {
    /** Upper run can be 0 (few/no uppers) up to this many linear feet. */
    max: number;
    step: number;
    /** Typical upper run, used for design-derived and default selections. */
    default: number;
    /** Slider header, e.g. "Wall cabinets (uppers)". */
    label: string;
  };
}

export const PROJECT_SIZE_CONFIG: Record<ProjectType, ProjectSizeConfig> = {
  kitchen: {
    min: 10, max: 60, step: 2, default: 24,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 50, step: 2, default: 18, label: "Wall cabinets (uppers)" },
  },
  bathroom: {
    min: 3, max: 16, step: 1, default: 6,
    unit: "linear-ft", unitNoun: "vanity feet", unitNounSingular: "vanity foot",
    unitShort: "ft", sizeStepLabel: "Vanity size",
  },
  laundry: {
    min: 4, max: 20, step: 1, default: 8,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 16, step: 1, default: 6, label: "Wall cabinets (uppers)" },
  },
  mudroom: {
    min: 4, max: 20, step: 1, default: 8,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 16, step: 1, default: 6, label: "Wall cabinets (uppers)" },
  },
  "home-office": {
    min: 4, max: 24, step: 1, default: 10,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 20, step: 1, default: 7, label: "Wall cabinets (uppers)" },
  },
  entertainment: {
    min: 4, max: 30, step: 1, default: 12,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 26, step: 1, default: 9, label: "Wall/upper cabinets" },
  },
  "built-ins": {
    min: 3, max: 30, step: 1, default: 10,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
    uppers: { max: 26, step: 1, default: 7, label: "Wall/upper cabinets" },
  },
  pantry: {
    min: 3, max: 16, step: 1, default: 8,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Run of cabinetry",
  },
};

export function getProjectSizeConfig(project: ProjectType): ProjectSizeConfig {
  return PROJECT_SIZE_CONFIG[project];
}

export function isPriceable(sel: EstimateSelections): boolean {
  if (!sel.project || sel.size == null || sel.size <= 0) return false;
  const cfg = PROJECT_SIZE_CONFIG[sel.project];
  // Projects with wall cabinets require both base and upper runs before showing
  // a live range - treating unset uppers as 0 would jump the price prematurely.
  if (cfg.uppers && sel.sizeUpper == null) return false;
  return true;
}

export const PROJECT_LABELS: Record<
  ProjectType,
  { label: string; sub: string; icon: string; image: string }
> = {
  kitchen: {
    label: "Kitchen", sub: "Bases, uppers, pantries, islands", icon: "ChefHat",
    image: "/images/catalog/rooms/kitchen.webp",
  },
  bathroom: {
    label: "Bathroom", sub: "Vanities, towers, linen storage", icon: "Bath",
    image: "/images/catalog/rooms/bathroom.webp",
  },
  laundry: {
    label: "Laundry", sub: "Folding, hampers, upper storage", icon: "Boxes",
    image: "/images/catalog/rooms/laundry.webp",
  },
  mudroom: {
    label: "Mudroom", sub: "Benches, lockers, cubbies", icon: "Warehouse",
    image: "/images/catalog/rooms/mudroom.webp",
  },
  pantry: {
    label: "Pantry", sub: "Walk-in and reach-in storage", icon: "Container",
    image: "/images/catalog/rooms/pantry.webp",
  },
  "home-office": {
    label: "Home Office", sub: "Desks, file drawers, shelving", icon: "LayoutDashboard",
    image: "/images/catalog/rooms/home-office.webp",
  },
  entertainment: {
    label: "Entertainment", sub: "Media centers and bar areas", icon: "LayoutPanelLeft",
    image: "/images/catalog/rooms/entertainment.webp",
  },
  "built-ins": {
    label: "Built-Ins", sub: "Bookcases, benches, millwork", icon: "Boxes",
    image: "/images/catalog/rooms/built-ins.webp",
  },
};

/**
 * Which layout slugs each project type offers (membership defined here, names pulled from catalog).
 *
 * The Layout step is disabled for now: picking a shape is hard for visitors and
 * means little without upper-cabinet input, so we skip it and apply a neutral
 * complexity factor (see PROJECT_NO_LAYOUT_COMPLEXITY) instead. To re-enable a
 * project's layout step, restore its slug list below.
 */
export const PROJECT_LAYOUT_SLUGS: Record<ProjectType, string[]> = {
  kitchen: [],
  bathroom: [],
  laundry: [],
  mudroom: [],
  "home-office": [],
  entertainment: [],
  "built-ins": [],
  pantry: [],
};

/**
 * Neutral complexity premium applied when a project has no Layout step. This
 * stands in for the average shape's LAYOUT_COMPLEXITY_MULTIPLIER so estimates
 * stay reasonable without asking the visitor to pick a layout. Kitchens assume
 * a midpoint between galley and island; bathrooms a midpoint of the two vanities.
 */
export const PROJECT_NO_LAYOUT_COMPLEXITY: Record<ProjectType, number> = {
  kitchen: 1.08,
  bathroom: 1.06,
  laundry: 1.0,
  mudroom: 1.0,
  "home-office": 1.0,
  entertainment: 1.0,
  "built-ins": 1.0,
  pantry: 1.0,
};

export interface StepVisibility {
  layout: boolean;
  doorStyle: boolean;
}

/** Per-project step visibility. Only kitchen and bathroom carry a layout step. */
export function getStepVisibility(project: ProjectType): StepVisibility {
  const hasLayout = PROJECT_LAYOUT_SLUGS[project].length > 0;
  return { layout: hasLayout, doorStyle: true };
}

/** The ordered list of selection steps that appear for a project type. */
export function getVisibleSteps(project: ProjectType): SelectionStepKey[] {
  const vis = getStepVisibility(project);
  const steps: SelectionStepKey[] = [];
  if (vis.layout) steps.push("layout");
  steps.push("size");
  if (vis.doorStyle) steps.push("doorStyle");
  steps.push("finish", "construction");
  return steps;
}

export function getTotalSteps(project: ProjectType): number {
  return getVisibleSteps(project).length;
}

// ── Option lists (pulled from the catalog where possible) ───────────────────

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  sub?: string;
  /** Representative catalog thumbnail/swatch path, when a real photo exists. */
  image?: string;
  /** Alt text for the thumbnail image. */
  imageAlt?: string;
  /** Icon key resolved to a lucide icon in the UI, for abstract options. */
  icon?: string;
}

export function getLayoutOptions(project: ProjectType): SelectOption[] {
  return PROJECT_LAYOUT_SLUGS[project]
    .map((slug) => LAYOUT_BY_SLUG[slug])
    .filter(Boolean)
    .map((l) => ({
      value: l.slug,
      label: l.name,
      sub: l.description,
      image: l.image,
      imageAlt: `${l.name} cabinet layout floor plan`,
    }));
}

const DOOR_STYLE_SUB: Record<string, string> = {
  slab: "Flat, handleless-ready contemporary face",
  "three-piece": "Horizontal grain center panel",
  "modern-shaker": "Classic recessed five-piece panel",
  shaker: "Classic recessed five-piece panel",
  "thin-shaker": "Narrow rails, lighter transitional look",
  "alpha-shaker": "Bold shaker rails and stiles",
  "beta-shaker": "Deep-profile shaker with mitered frame",
};

export function getDoorStyleOptions(): SelectOption[] {
  return DOOR_STYLES.map((d) => {
    const { thumb640 } = getDoorStyleImages(d.slug, d.imagePath);
    return {
      value: d.id,
      label: d.name,
      sub: DOOR_STYLE_SUB[d.id] ?? d.name,
      image: thumb640,
      imageAlt: `${d.name} door style, Boise Cabinet Co`,
    };
  });
}

/** Map catalog price tier marker to estimator finish tier. */
export function finishMarkerToTier(marker: number): FinishTier {
  if (marker >= 5) return "reserve";
  if (marker >= 4) return "premium";
  return "standard";
}

export function getFinishColorOptions(doorStyleId: string): SelectOption[] {
  const doorSlug = DOOR_STYLES.find((d) => d.id === doorStyleId)?.slug ?? doorStyleId;
  return getFinishesForDoorStyle(doorSlug).map((f) => ({
    value: f.slug,
    label: f.name,
    sub: f.category,
    image: getFinishImages(f.slug, f.imagePath).swatch,
    imageAlt: `${f.name} finish swatch`,
  }));
}

/** Apply finish slug to category/tier; returns selections unchanged when slug is empty. */
export function applyFinishSlug(
  sel: EstimateSelections,
  finishSlug: string,
): EstimateSelections {
  if (!finishSlug) {
    return { ...sel, finishSlug: "" };
  }
  const finish = FINISH_BY_SLUG[finishSlug];
  if (!finish) {
    return { ...sel, finishSlug: "" };
  }
  return {
    ...sel,
    finishSlug,
    finishCategory: finish.category,
    finishTier: finishMarkerToTier(finish.priceTierMarker),
  };
}

export const FINISH_CATEGORY_OPTIONS: SelectOption<FinishCategory>[] = [
  {
    value: "matte",
    label: "Matte",
    sub: "Soft, low-sheen, fingerprint-friendly",
    image: "/images/catalog/finishes/category-matte.webp",
    imageAlt: "Flat low-sheen matte cabinet finish swatch",
  },
  {
    value: "woodgrain",
    label: "Woodgrain",
    sub: "Natural grain laminates and stains",
    image: "/images/catalog/finishes/category-woodgrain.webp",
    imageAlt: "Natural wood grain cabinet finish swatch",
  },
  {
    value: "gloss",
    label: "High-Gloss",
    sub: "Reflective, contemporary brightness",
    image: "/images/catalog/finishes/category-gloss.webp",
    imageAlt: "Reflective high-gloss cabinet finish swatch",
  },
];

/** Finish price tiers shown as `$` markers - never "Standard / Premium / Luxury". */
export const FINISH_TIER_OPTIONS: SelectOption<FinishTier>[] = [
  { value: "standard", label: "$", sub: "Core palette colors" },
  { value: "premium", label: "$$", sub: "Designer tones and deeper hues" },
  { value: "reserve", label: "$$$", sub: "Top-tier designer colors" },
];

export const CONSTRUCTION_OPTIONS: SelectOption<ConstructionTier>[] = [
  { value: "good", label: "Good", sub: "Furniture-board box, soft-close doors and drawers", icon: "Shield" },
  { value: "better", label: "Better", sub: "Plywood box, full-extension soft-close slides", icon: "ShieldCheck" },
  { value: "best", label: "Best", sub: "All-plywood, dovetail drawer boxes, reinforced", icon: "Crown" },
];

const CONSTRUCTION_LABEL: Record<ConstructionTier, string> = {
  good: "Good", better: "Better", best: "Best",
};
const FINISH_TIER_DOLLAR: Record<FinishTier, string> = {
  standard: "$", premium: "$$", reserve: "$$$",
};
const FINISH_CATEGORY_LABEL: Record<FinishCategory, string> = {
  matte: "matte", woodgrain: "woodgrain", gloss: "high-gloss",
};

/**
 * Approximate cabinet tint used to recolor the layout floor-plan diagrams so
 * they roughly reflect the homeowner's selected finish. The estimator only
 * captures a finish style (sheen) and color tier, not a specific named color,
 * so these are representative tones matched to the finish-style swatches rather
 * than a literal swatch. Returned as CSS custom property values consumed by the
 * generated diagram SVGs (--cab-fill / --cab-stroke / --cab-island).
 */
export interface FinishTint {
  fill: string;
  stroke: string;
  island: string;
}

const FINISH_TINT_BASE: Record<FinishCategory, string> = {
  matte: "#8C8073", // soft warm greige
  woodgrain: "#B0814F", // natural oak
  gloss: "#34343A", // deep reflective charcoal
};

// Higher tiers read deeper/richer; mid tier slightly deeper than base.
const FINISH_TIER_SHADE: Record<FinishTier, number> = {
  standard: 0,
  premium: -0.06,
  reserve: -0.12,
};

function shadeHex(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const adjust = (channel: number) =>
    amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount);
  const r = clamp(adjust((num >> 16) & 0xff));
  const g = clamp(adjust((num >> 8) & 0xff));
  const b = clamp(adjust(num & 0xff));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function getFinishTint(
  category: FinishCategory,
  tier: FinishTier,
): FinishTint {
  const fill = shadeHex(FINISH_TINT_BASE[category], FINISH_TIER_SHADE[tier] ?? 0);
  return {
    fill,
    stroke: shadeHex(fill, -0.22),
    island: shadeHex(fill, 0.12),
  };
}

/** Construction story shown in the included scope. */
const CONSTRUCTION_INCLUDED: Record<ConstructionTier, string> = {
  good: "Furniture-board box with soft-close doors and drawers",
  better: "Plywood box construction with full-extension soft-close slides",
  best: "All-plywood box with dovetail drawer boxes and reinforced shelves",
};

export const INCLUDED_SCOPE_NOTE =
  "Scope reflects the selections above. Your final scope is confirmed during consultation.";

export const APPLIANCE_DISCLAIMER =
  "Appliances are client-supplied; we'll guide your selection but do not purchase or install them.";

/**
 * Professionally worded range disclaimer shown wherever the estimator surfaces a
 * planning range. Sets expectations without discouraging the visitor.
 */
export const ESTIMATE_RANGE_DISCLAIMER =
  "This estimate is intended to provide a general investment range based on your selections. Final pricing may vary based on measurements, project details, installation requirements, and product choices. Most projects move into production within 4-8 weeks after selections and project details are finalized.";

/**
 * Subtle, credible value-proposition line reinforced throughout the estimator:
 * premium quality and craftsmanship at competitive pricing, without hard selling.
 */
export const ESTIMATE_VALUE_PROP =
  "Designed to provide exceptional value, premium-quality materials, and expert craftsmanship at highly competitive pricing.";

export const PLANNING_DETAIL_LABELS: Record<ConfidenceLevel, string> = {
  starting: "Example range - personalize below",
  refined: "Refined guidance",
  detailed: "Detailed planning range",
};

/** Maps estimator project types to consultation form select values. */
export function mapEstimateProjectToConsultType(project: ProjectType): string {
  switch (project) {
    case "kitchen":
      return "kitchen";
    case "bathroom":
      return "bathroom";
    case "laundry":
    case "mudroom":
      return "laundry";
    case "home-office":
    case "entertainment":
    case "built-ins":
    case "pantry":
      return "other";
    default:
      return "other";
  }
}

// ── Defaults ────────────────────────────────────────────────────────────────

export function getDefaultLayout(project: ProjectType): string {
  const slugs = PROJECT_LAYOUT_SLUGS[project];
  if (project === "kitchen") return "island";
  return slugs[0] ?? "";
}

export function getDefaultSelectionsForProject(project: ProjectType): EstimateSelections {
  const cfg = PROJECT_SIZE_CONFIG[project];
  return {
    project,
    layout: getDefaultLayout(project),
    size: cfg.default,
    sizeUpper: cfg.uppers ? cfg.uppers.default : null,
    doorStyle: "modern-shaker",
    finishSlug: "",
    finishCategory: "matte",
    finishTier: "standard",
    construction: "better",
  };
}

export const DEFAULT_SELECTIONS: EstimateSelections = getDefaultSelectionsForProject("kitchen");

/**
 * Fully unselected state for the estimator: nothing is pre-chosen. Used as the
 * wizard's initial state so a visitor who skips it never produces an estimate.
 */
export const EMPTY_SELECTIONS: EstimateSelections = {
  project: null,
  layout: "",
  size: null,
  sizeUpper: null,
  doorStyle: "",
  finishSlug: "",
  finishCategory: "",
  finishTier: "",
  construction: "",
};

/**
 * When a visitor picks a project, set the project and a smart construction
 * default ("Better", the most popular tier) so the Size step needs only a
 * slider and a confirmable default. Size, door, and finish stay unselected so
 * the estimate still reflects what the visitor actively chooses.
 */
export function emptySelectionsForProject(project: ProjectType): EstimateSelections {
  return { ...EMPTY_SELECTIONS, project, construction: "better" };
}

// ── Pricing ──────────────────────────────────────────────────────────────────

export function formatPlanningCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

function clampSize(project: ProjectType, size: number | null): number {
  const cfg = PROJECT_SIZE_CONFIG[project];
  if (size == null || !Number.isFinite(size)) return cfg.default;
  return Math.max(cfg.min, Math.min(cfg.max, Math.round(size)));
}

/** Clamp the upper (wall) run; null for projects without a separate upper run. */
function clampUpperSize(project: ProjectType, size: number | null): number | null {
  const cfg = PROJECT_SIZE_CONFIG[project];
  if (!cfg.uppers) return null;
  if (size == null || !Number.isFinite(size)) return null;
  return Math.max(0, Math.min(cfg.uppers.max, Math.round(size)));
}

/**
 * Combined upgrade multiplier for the current selections. Any dimension the
 * visitor has not chosen contributes no premium (multiplier 1), so the range
 * reflects only the selections actually made.
 */
export function getSelectionMultiplier(sel: EstimateSelections): number {
  if (!sel.project) return 1;
  const vis = getStepVisibility(sel.project);
  let m = 1;
  if (vis.layout) {
    m *= LAYOUT_COMPLEXITY_MULTIPLIER[sel.layout] ?? 1;
  } else {
    m *= PROJECT_NO_LAYOUT_COMPLEXITY[sel.project] ?? 1;
  }
  if (vis.doorStyle) m *= DOOR_STYLE_MULTIPLIER[sel.doorStyle] ?? 1;
  m *= FINISH_CATEGORY_MULTIPLIER[sel.finishCategory as FinishCategory] ?? 1;
  m *= FINISH_TIER_MULTIPLIER[sel.finishTier as FinishTier] ?? 1;
  m *= CONSTRUCTION_MULTIPLIER[sel.construction as ConstructionTier] ?? 1;
  return m;
}

function roundPrice(n: number): number {
  return Math.round(n / PRICE_ROUND_TO) * PRICE_ROUND_TO;
}

export function getSizeLabel(
  project: ProjectType,
  size: number,
  sizeUpper: number | null = null,
): string {
  const cfg = PROJECT_SIZE_CONFIG[project];
  const noun = size === 1 ? cfg.unitNounSingular : cfg.unitNoun;
  if (cfg.uppers) {
    // Before the upper run is set, show just the base run; once set, show both.
    if (sizeUpper == null) return `${size.toLocaleString()} ${noun} base`;
    return `${size.toLocaleString()} ${cfg.unitShort} base · ${sizeUpper.toLocaleString()} ${cfg.unitShort} uppers`;
  }
  return `${size.toLocaleString()} ${noun}`;
}

export function buildScopeSummary(sel: EstimateSelections): string {
  if (!sel.project) return "";
  const vis = getStepVisibility(sel.project);
  const parts: string[] = [];
  if (vis.doorStyle) {
    const door = DOOR_STYLES.find((d) => d.id === sel.doorStyle);
    if (door) parts.push(door.name);
  }
  const namedFinish = sel.finishSlug ? FINISH_BY_SLUG[sel.finishSlug]?.name : undefined;
  const tierDollar = sel.finishTier ? FINISH_TIER_DOLLAR[sel.finishTier] : "";
  if (namedFinish) {
    parts.push(tierDollar ? `${namedFinish} (${tierDollar})` : namedFinish);
  } else if (sel.finishCategory) {
    const label = FINISH_CATEGORY_LABEL[sel.finishCategory];
    parts.push(tierDollar ? `${label} finish (${tierDollar})` : `${label} finish`);
  }
  if (sel.construction) {
    parts.push(`${CONSTRUCTION_LABEL[sel.construction]} construction`);
  }
  // Guarantee a multi-part summary so downstream UI always has a separator.
  if (parts.length < 2) parts.push("built to order");
  return parts.join(" · ");
}

/** Short header line for the result panel: project + size. Empty until both are set. */
export function buildSelectionSummary(sel: EstimateSelections): string {
  if (!sel.project || sel.size == null) return "";
  return `${PROJECT_LABELS[sel.project].label} · ${getSizeLabel(sel.project, sel.size, sel.sizeUpper)}`;
}

function buildIncluded(sel: EstimateSelections): string[] {
  const vis = sel.project ? getStepVisibility(sel.project) : { layout: false, doorStyle: true };
  const list: string[] = [];
  list.push("Custom cabinets, built to order");

  if (vis.layout) {
    const layout = LAYOUT_BY_SLUG[sel.layout];
    if (layout) list.push(`${layout.name} layout`);
  }

  if (vis.doorStyle) {
    const door = DOOR_STYLES.find((d) => d.id === sel.doorStyle);
    if (door) list.push(`${door.name} door style`);
  }

  const namedFinish = sel.finishSlug ? FINISH_BY_SLUG[sel.finishSlug]?.name : undefined;
  if (namedFinish) {
    list.push(`${namedFinish} finish`);
  } else if (sel.finishCategory) {
    list.push(`${FINISH_CATEGORY_LABEL[sel.finishCategory]} finish`);
  }
  if (sel.construction) {
    list.push(CONSTRUCTION_INCLUDED[sel.construction]);
  }

  list.push("Soft-close hinges and full-extension drawer slides");
  list.push("Professional installation and final adjustment");

  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

function getConfidence(count: number, total: number): { level: ConfidenceLevel; percent: number } {
  if (total <= 0) return { level: "starting", percent: 40 };
  const ratio = Math.min(count, total) / total;
  const percent = Math.round(40 + ratio * 55);
  if (count >= total) return { level: "detailed", percent: 95 };
  if (ratio >= 0.5) return { level: "refined", percent: Math.max(65, percent) };
  return { level: "starting", percent: Math.max(40, percent) };
}

/** Normalizes selections so out-of-range sizes / unknown layouts can't break pricing. */
export function normalizeSelections(sel: EstimateSelections): EstimateSelections {
  if (!sel.project) return sel;
  const vis = getStepVisibility(sel.project);
  const layoutSlugs = PROJECT_LAYOUT_SLUGS[sel.project];
  const layout = vis.layout && !layoutSlugs.includes(sel.layout)
    ? getDefaultLayout(sel.project)
    : sel.layout;
  let next: EstimateSelections = {
    ...sel,
    layout,
    size: clampSize(sel.project, sel.size),
    sizeUpper: clampUpperSize(sel.project, sel.sizeUpper),
  };
  if (next.finishSlug) {
    const doorSlug = DOOR_STYLES.find((d) => d.id === next.doorStyle)?.slug ?? next.doorStyle;
    const allowed = new Set(getFinishesForDoorStyle(doorSlug).map((f) => f.slug));
    if (!allowed.has(next.finishSlug)) {
      next = { ...next, finishSlug: "" };
    } else {
      next = applyFinishSlug(next, next.finishSlug);
    }
  }
  return next;
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
  const pricing = PROJECT_PRICING[project];
  const cfg = PROJECT_SIZE_CONFIG[project];
  const mult = getSelectionMultiplier(sel);

  // Uppers only apply (and are only charged) for projects with a wall run.
  const upperLF = cfg.uppers ? (sel.sizeUpper ?? 0) : 0;
  const baseLow = pricing.perUnitLow * sel.size! + pricing.upperPerUnitLow * upperLF;
  const baseHigh = pricing.perUnitHigh * sel.size! + pricing.upperPerUnitHigh * upperLF;
  const priceLow = roundPrice(baseLow * mult);
  const priceHigh = roundPrice(baseHigh * mult);

  const total = getTotalSteps(project);
  const { level, percent } = getConfidence(selectionsMade, total);

  return {
    priceLow,
    priceHigh,
    roi: pricing.roi,
    included: buildIncluded(sel),
    confidence: level,
    confidenceLabel: PLANNING_DETAIL_LABELS[level],
    confidencePercent: percent,
    scopeSummary: buildScopeSummary(sel),
    selectionsMade,
    totalSteps: total,
  };
}

// ── sessionStorage handoff to the consultation form ──────────────────────────

export interface StoredEstimate extends EstimateSelections {
  priceLow: number;
  priceHigh: number;
  roi: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  scopeSummary: string;
  sizeLabel: string;
  projectLabel: string;
}

export function buildStoredEstimate(
  selections: EstimateSelections,
  selectionsMade = 0,
): StoredEstimate | null {
  const result = calculateEstimate(selections, selectionsMade);
  if (!result) return null;
  const sel = normalizeSelections(selections);
  const project = sel.project as ProjectType;
  return {
    ...sel,
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    roi: result.roi,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
    scopeSummary: result.scopeSummary,
    sizeLabel: getSizeLabel(project, sel.size!, sel.sizeUpper),
    projectLabel: PROJECT_LABELS[project].label,
  };
}

/**
 * Payload shape the consultation API accepts for an attached estimate. This is
 * the single source of truth carried end-to-end: it is stored on the lead
 * (`serviceData.estimate`), copied to the project on conversion, surfaced in the
 * admin lead dashboard and customer portal, and rendered in both emails.
 */
export interface ConsultationEstimatePayload {
  /** Human project label, e.g. "Kitchen Cabinets". */
  project: string;
  /** Scope summary, e.g. "Modern Shaker · Matte finish ($$) · Better construction". */
  finish: string;
  priceLow: number;
  priceHigh: number;
  roi: number;
  /** Size summary, e.g. "24 lf base · 18 lf uppers". */
  sizeLabel?: string;
  /** Confidence label for the range, e.g. "Detailed planning range". */
  confidenceLabel?: string;
}

/**
 * Maps a stored estimate to the `estimate` payload `/api/consultation` expects.
 * Returns null when there is no estimate to attach, so the unified quote flow
 * can pass the result straight through without re-deriving field names.
 */
export function buildConsultationEstimatePayload(
  estimate: StoredEstimate | null | undefined,
): ConsultationEstimatePayload | null {
  if (!estimate) return null;
  return {
    project: estimate.projectLabel,
    finish: estimate.scopeSummary,
    priceLow: estimate.priceLow,
    priceHigh: estimate.priceHigh,
    roi: estimate.roi,
    sizeLabel: estimate.sizeLabel,
    confidenceLabel: estimate.confidenceLabel,
  };
}

/** Formats an estimate price range like "$28k to $42k" for compact display. */
export function formatEstimateRangeShort(
  priceLow: number,
  priceHigh: number,
): string {
  return `$${Math.round(priceLow / 1000)}k to $${Math.round(priceHigh / 1000)}k`;
}
