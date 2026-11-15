import { DOOR_STYLES } from "./catalog/doorStyles";
import { FINISH_BY_SLUG } from "./catalog/finishes";
// The light modules, not entityImages/queries: those import the generated
// cabinet product catalog, and this engine runs in the browser.
import { getDoorStyleImages, getFinishImages } from "./catalog/entityImagePaths";
import { getFinishesForDoorStyle } from "./catalog/finishCompatibility";
import { LAYOUT_BY_SLUG } from "./catalog/layouts";
import { sharedBookRate, type FinishTier as BookFinishTier } from "../lib/p5/priceBook.ts";
import {
  COST_CATEGORIES,
  DEFAULT_FINANCE,
  calculateP5Estimate,
  customerEstimate,
  type DirectCostLine,
} from "../lib/p5/pricing.ts";

/**
 * Cabinet-specific Project Estimator engine.
 *
 * Direct costs come from the shared cost book (`sharedBookRate`). The number
 * a visitor sees is the customer planning range from `calculateP5Estimate`:
 * the same overhead, profit, reserve, band and rounding the shared estimator
 * uses. Book rates are never shown.
 * Door style, finish and layout stay on the scope summary. They have no unit
 * price in the book, so they do not change the total.
 *
 * Option lists for doors, finishes and layouts are pulled from `shared/catalog/*`
 * so the estimator and catalog never drift. There is exactly one cabinet line
 * (custom), so there is no "line" step.
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
/** Catalog swatch marker, shown as `$` tiers. It does not price the estimate. */
export type FinishTier = "standard" | "premium" | "reserve";
/** Shared cost-book columns. Legacy good/better/best values normalize into these. */
export type ConstructionTier = "essential" | "signature" | "premium" | "luxury";
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
  /** Product-named scope line, e.g. "Thin Shaker · Matte finish ($$$) · Signature". */
  scopeSummary: string;
  selectionsMade: number;
  totalSteps: number;
}

// ============================================================================
// SHARED COST BOOK LINES
// ----------------------------------------------------------------------------
// Dollar amounts are read from lib/p5/priceBookData.ts through sharedBookRate.
// This map is codes only. A null code means the old wizard line has no unit
// price in the book, so that line is not priced.
//
// Cabinet lines are priced at base direct cost (remodel = false), the same
// rule serviceContext uses for cabinet-install.
// ============================================================================

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

/** Wizard level to the cost book's four columns. */
export const LEVEL_TO_BOOK: Record<ConstructionTier, BookFinishTier> = {
  essential: "builder",
  signature: "mid",
  premium: "high",
  luxury: "luxury",
};

const LEGACY_LEVEL: Record<string, ConstructionTier> = {
  good: "essential",
  better: "signature",
  best: "premium",
};

export function normalizeConstruction(value: string | null | undefined): ConstructionTier | "" {
  if (!value) return "";
  if (value in LEVEL_TO_BOOK) return value as ConstructionTier;
  return LEGACY_LEVEL[value] ?? "";
}

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
    unitShort: "lf", sizeStepLabel: "Desk and upper run",
  },
  entertainment: {
    min: 4, max: 30, step: 1, default: 12,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Base cabinets (floor run)",
  },
  "built-ins": {
    min: 3, max: 30, step: 1, default: 10,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Built-in run",
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
  if (!PROJECT_BOOK_LINES[sel.project]?.base) return false;
  const cfg = PROJECT_SIZE_CONFIG[sel.project];
  // Projects with wall cabinets require both base and upper runs before showing
  // a live total. Treating unset uppers as 0 would jump the price prematurely.
  if (cfg.uppers && sel.sizeUpper == null) return false;
  return true;
}

export const PROJECT_LABELS: Record<
  ProjectType,
  { label: string; sub: string; icon: string; image: string }
> = {
  kitchen: {
    label: "Kitchen", sub: "Bases, uppers, pantries, islands", icon: "ChefHat",
    image: "/images/catalog/rooms/kitchen-walnut-mountain.webp",
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
 * Layout is a scope choice. The cost book has no per-shape unit price, so the
 * selection is recorded and does not change the total.
 */
/**
 * Layout options per project. Only kitchen and bathroom carry a layout step.
 * The catalog also defines wall-run and floor-to-ceiling. Those shapes are not
 * offered here.
 */
export const PROJECT_LAYOUT_SLUGS: Record<ProjectType, string[]> = {
  kitchen: ["galley", "l-shape", "u-shape", "island", "peninsula"],
  bathroom: ["single-vanity", "double-vanity"],
  laundry: [],
  mudroom: [],
  "home-office": [],
  entertainment: [],
  "built-ins": [],
  pantry: [],
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

/** Finish swatches stay on the `$` scale. The price level is the separate four-column choice. */
export const FINISH_TIER_OPTIONS: SelectOption<FinishTier>[] = [
  { value: "standard", label: "$", sub: "Core palette colors" },
  { value: "premium", label: "$$", sub: "Designer tones and deeper hues" },
  { value: "reserve", label: "$$$", sub: "Top-tier designer colors" },
];

export const CONSTRUCTION_OPTIONS: SelectOption<ConstructionTier>[] = [
  { value: "essential", label: "Essential", sub: "Furniture-board box, soft-close doors and drawers", icon: "Shield" },
  { value: "signature", label: "Signature", sub: "Plywood box, full-extension soft-close slides", icon: "ShieldCheck" },
  { value: "premium", label: "Premium", sub: "All-plywood, dovetail drawer boxes, reinforced", icon: "Crown" },
  { value: "luxury", label: "Luxury", sub: "Inset or European boxes, dovetail drawers, furniture-grade joinery", icon: "Gem" },
];

const CONSTRUCTION_LABEL: Record<ConstructionTier, string> = {
  essential: "Essential",
  signature: "Signature",
  premium: "Premium",
  luxury: "Luxury",
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
  essential: "Furniture-board box with soft-close doors and drawers",
  signature: "Plywood box construction with full-extension soft-close slides",
  premium: "All-plywood box with dovetail drawer boxes and reinforced shelves",
  luxury: "Inset or European boxes with dovetail drawers and furniture-grade joinery",
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
    construction: "signature",
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
 * When a visitor picks a project, set the project and a smart level default
 * (Signature, the most common cost-book column) so the Size step needs only a
 * slider and a confirmable default. Size, door, and finish stay unselected so
 * the estimate still reflects what the visitor actively chooses.
 */
export function emptySelectionsForProject(project: ProjectType): EstimateSelections {
  return { ...EMPTY_SELECTIONS, project, construction: "signature" };
}

// ── Pricing ──────────────────────────────────────────────────────────────────

export { formatPlanningCurrency } from "./planningCurrency";

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

function roundPrice(n: number): number {
  return Math.round(n);
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
  if (parts.length < 2) parts.push("sized to fit");
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
  list.push("Custom cabinets, sized to your layout");

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

  list.push("Soft-close hinge and drawer-slide options");
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
    construction: normalizeConstruction(sel.construction),
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

// ── Multi-room (per-room) estimates ────────────────────────────────────────
// A visitor can plan several rooms in one pass (e.g. kitchen + bath + mudroom).
// Each room is a full EstimateSelections with its own size, door, finish, and
// construction; the combined range is the sum of every priceable room.

/** Pricing-relevant selections made for one room, used for its confidence. */
export function roomSelectionsMade(room: EstimateSelections): number {
  if (!room.project) return 0;
  const vis = getStepVisibility(room.project);
  let n = 0;
  // Layout counts toward confidence for the projects that show the step;
  // without this, kitchens and bathrooms could never reach the "detailed"
  // confidence level their own step list implies (4 selections of 5 steps).
  if (vis.layout && room.layout) n += 1;
  if (room.size != null) n += 1;
  if (vis.doorStyle && room.doorStyle) n += 1;
  if (room.finishCategory || room.finishSlug) n += 1;
  if (room.construction) n += 1;
  return n;
}

export interface RoomEstimate {
  project: ProjectType;
  projectLabel: string;
  sizeLabel: string;
  scopeSummary: string;
  priceLow: number;
  priceHigh: number;
}

export interface CombinedEstimateResult {
  priceLow: number;
  priceHigh: number;
  /** Per-room breakdown, in the order the rooms were added. */
  rooms: RoomEstimate[];
  included: string[];
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  confidencePercent: number;
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

export interface CombinedStoredEstimate {
  priceLow: number;
  priceHigh: number;
  confidenceLabel: string;
  rooms: Array<{
    projectLabel: string;
    sizeLabel: string;
    scopeSummary: string;
    priceLow: number;
    priceHigh: number;
  }>;
}

/** Priceable multi-room snapshot for the consultation form; null until priceable. */
export function buildCombinedStoredEstimate(
  rooms: EstimateSelections[],
): CombinedStoredEstimate | null {
  const combined = calculateCombinedEstimate(rooms);
  if (!combined) return null;
  return {
    priceLow: combined.priceLow,
    priceHigh: combined.priceHigh,
    confidenceLabel: combined.confidenceLabel,
    rooms: combined.rooms.map((r) => ({
      projectLabel: r.projectLabel,
      sizeLabel: r.sizeLabel,
      scopeSummary: r.scopeSummary,
      priceLow: r.priceLow,
      priceHigh: r.priceHigh,
    })),
  };
}

/** Maps a combined multi-room estimate to the consultation `estimate` payload. */
export function buildCombinedConsultationPayload(
  estimate: CombinedStoredEstimate | null | undefined,
): ConsultationEstimatePayload | null {
  if (!estimate || !estimate.rooms.length) return null;
  const roomList = estimate.rooms.map((r) => r.projectLabel).join(", ");
  const finish = estimate.rooms
    .map((r) => `${r.projectLabel}: ${r.scopeSummary}`)
    .join(" · ");
  const sizeLabel = estimate.rooms
    .map((r) => `${r.projectLabel} ${r.sizeLabel}`)
    .join(" · ");
  return {
    project: roomList,
    finish,
    priceLow: estimate.priceLow,
    priceHigh: estimate.priceHigh,
    roi: 0,
    sizeLabel,
    confidenceLabel: estimate.confidenceLabel,
    rooms: estimate.rooms.map((r) => ({
      project: r.projectLabel,
      finish: r.scopeSummary,
      sizeLabel: r.sizeLabel,
      priceLow: r.priceLow,
      priceHigh: r.priceHigh,
    })),
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
  /** Per-room breakdown when the visitor planned multiple rooms in one pass. */
  rooms?: Array<{
    project: string;
    finish: string;
    sizeLabel: string;
    priceLow: number;
    priceHigh: number;
  }>;
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
