import { COLLECTIONS } from "./catalog/collections";
import { DOOR_STYLES } from "./catalog/doorStyles";
import { FINISH_BY_SLUG } from "./catalog/finishes";
import { getDoorStyleImages, getFinishImages } from "./catalog/entityImages";
import { getFinishesForDoorStyle } from "./catalog/queries";
import { ACCESSORY_BY_ID } from "./catalog/accessories";
import { LAYOUT_BY_SLUG } from "./catalog/layouts";

/**
 * Cabinet-specific Project Estimator engine.
 *
 * Pricing is grounded in the real Boise Cabinet Co catalog: the Custom and
 * Reserve cabinet lines, the Slab / Shaker / Thin Shaker door styles, the
 * matte / gloss / woodgrain finish categories and standard / premium / reserve
 * finish tiers, Good / Better / Best box construction, and the Smart Storage
 * add-on accessories. Option lists are pulled from `shared/catalog/*` so the
 * estimator and catalog never drift.
 *
 * The model composes a base from layout + size (linear-foot or per-room
 * driven), then applies multipliers for cabinet line, door style, finish
 * category, finish tier, construction quality, and Smart Storage. Every upgrade
 * raises the range monotonically; every downgrade lowers it.
 */

export type ProjectType = "kitchen" | "bathroom" | "whole-home" | "addition" | "adu";
export type FinishCategory = "matte" | "woodgrain" | "gloss";
export type FinishTier = "standard" | "premium" | "reserve";
export type ConstructionTier = "good" | "better" | "best";
export type StorageTier = "none" | "essential" | "upgraded" | "premium";
export type ConfidenceLevel = "starting" | "refined" | "detailed";

export type SelectionStepKey =
  | "layout"
  | "size"
  | "line"
  | "doorStyle"
  | "finishColor"
  | "finish"
  | "construction"
  | "storage";

export interface EstimateSelections {
  project: ProjectType;
  /** Layout slug from the catalog; "" when the project has no layout step. */
  layout: string;
  /** Size in the project's size unit: linear feet, vanity feet, or room count. */
  size: number;
  /** Cabinet line = catalog collection id ("custom" | "reserve"). */
  cabinetLine: string;
  /** Door style = OSC door style id (slab, modern-shaker, thin-shaker, etc.). */
  doorStyle: string;
  /** Optional OSC finish slug; empty string skips named-color selection. */
  finishSlug: string;
  finishCategory: FinishCategory;
  finishTier: FinishTier;
  construction: ConstructionTier;
  storage: StorageTier;
}

export interface EstimateResult {
  priceLow: number;
  priceHigh: number;
  roi: number;
  included: string[];
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  confidencePercent: number;
  /** Product-named scope line, e.g. "Reserve line · Thin Shaker · Premium matte finish · Best construction · Upgraded storage". */
  scopeSummary: string;
  selectionsMade: number;
  totalSteps: number;
}

// ============================================================================
// MODELED TREASURE VALLEY PRICING - EDIT HERE
// ----------------------------------------------------------------------------
// These are PLANNING figures modeled on Boise Cabinet Co's tier structure and
// typical Treasure Valley installed-cabinetry rates. They are NOT a supplier
// price sheet and not a per-cabinet quote. Every dollar figure the estimator
// uses lives in this block - tune these numbers to refine the estimator.
//
// How the math works:
//   priceLow  = round( perUnitLow  × size × multiplier )
//   priceHigh = round( perUnitHigh × size × multiplier )
//   multiplier = layout × cabinetLine × doorStyle × finishCategory
//              × finishTier × construction × storage
// ============================================================================

/** Base installed price per size unit (low/high band) and resale ROI per project. */
export const PROJECT_PRICING: Record<
  ProjectType,
  { perUnitLow: number; perUnitHigh: number; roi: number }
> = {
  // kitchen / bathroom / built-ins / closet are priced per linear foot of cabinetry.
  kitchen: { perUnitLow: 520, perUnitHigh: 880, roi: 72 },
  bathroom: { perUnitLow: 460, perUnitHigh: 820, roi: 68 },
  // whole-home is priced per room of cabinetry applied house-wide.
  "whole-home": { perUnitLow: 10000, perUnitHigh: 22000, roi: 65 },
  addition: { perUnitLow: 360, perUnitHigh: 640, roi: 60 },
  adu: { perUnitLow: 220, perUnitHigh: 460, roi: 58 },
};

/** Cabinet line premium, keyed by catalog collection id. */
export const CABINET_LINE_MULTIPLIER: Record<string, number> = {
  custom: 1.0,
  reserve: 1.18,
};

/** Door style premium, keyed by OSC door style id. */
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

/** Finish tier premium across standard / premium / reserve colors. */
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

/** Smart Storage add-on premium. */
export const STORAGE_MULTIPLIER: Record<StorageTier, number> = {
  none: 1.0,
  essential: 1.06,
  upgraded: 1.15,
  premium: 1.26,
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
  "wall-run": 1.0,
  "floor-to-ceiling": 1.12,
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
  /** Short noun for the slider end labels, e.g. "lf" or "rooms". */
  unitShort: string;
  /** Step header for the size selector. */
  sizeStepLabel: string;
}

export const PROJECT_SIZE_CONFIG: Record<ProjectType, ProjectSizeConfig> = {
  kitchen: {
    min: 10, max: 60, step: 2, default: 24,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Run of cabinetry",
  },
  bathroom: {
    min: 3, max: 16, step: 1, default: 6,
    unit: "linear-ft", unitNoun: "vanity feet", unitNounSingular: "vanity foot",
    unitShort: "ft", sizeStepLabel: "Vanity size",
  },
  "whole-home": {
    min: 2, max: 10, step: 1, default: 4,
    unit: "rooms", unitNoun: "rooms", unitNounSingular: "room",
    unitShort: "rooms", sizeStepLabel: "Rooms in scope",
  },
  addition: {
    min: 4, max: 40, step: 1, default: 12,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Run of cabinetry",
  },
  adu: {
    min: 4, max: 60, step: 1, default: 16,
    unit: "linear-ft", unitNoun: "linear feet", unitNounSingular: "linear foot",
    unitShort: "lf", sizeStepLabel: "Run of cabinetry",
  },
};

export function getProjectSizeConfig(project: ProjectType): ProjectSizeConfig {
  return PROJECT_SIZE_CONFIG[project];
}

export const PROJECT_LABELS: Record<ProjectType, { label: string; sub: string; icon: string }> = {
  kitchen: { label: "Kitchen Cabinets", sub: "Layout, line, and installation", icon: "ChefHat" },
  bathroom: { label: "Bathroom Vanities", sub: "Vanity, towers, storage", icon: "Bath" },
  "whole-home": { label: "Whole-Home Cabinetry", sub: "Multiple rooms, one program", icon: "House" },
  addition: { label: "Built-Ins & Storage", sub: "Mudroom, pantry, office, media", icon: "Boxes" },
  adu: { label: "Closet & Garage", sub: "Closet systems and garage storage", icon: "Warehouse" },
};

/** Which layout slugs each project type offers (membership defined here, names pulled from catalog). */
export const PROJECT_LAYOUT_SLUGS: Record<ProjectType, string[]> = {
  kitchen: ["galley", "l-shape", "u-shape", "island", "peninsula"],
  bathroom: ["single-vanity", "double-vanity"],
  "whole-home": [],
  addition: ["wall-run", "floor-to-ceiling"],
  adu: ["wall-run", "floor-to-ceiling"],
};

export interface StepVisibility {
  layout: boolean;
  doorStyle: boolean;
}

/** Per-project step visibility. Whole-home applies one finish program house-wide, so it skips layout and door style. */
export function getStepVisibility(project: ProjectType): StepVisibility {
  if (project === "whole-home") return { layout: false, doorStyle: false };
  return { layout: true, doorStyle: true };
}

/** The ordered list of selection steps that appear for a project type. */
export function getVisibleSteps(project: ProjectType): SelectionStepKey[] {
  const vis = getStepVisibility(project);
  const steps: SelectionStepKey[] = [];
  if (vis.layout) steps.push("layout");
  steps.push("size", "line");
  if (vis.doorStyle) steps.push("doorStyle");
  steps.push("finish", "construction", "storage");
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

export function getCabinetLineOptions(): SelectOption[] {
  return COLLECTIONS.map((c) => ({
    value: c.id,
    label: c.name,
    sub: c.tagline,
    image: `/images/catalog/collections/${c.slug}-640.webp`,
    imageAlt: `${c.name} cabinets, Boise Cabinet Co`,
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

/** Map OSC price tier marker to estimator finish tier. */
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

export const FINISH_TIER_OPTIONS: SelectOption<FinishTier>[] = [
  { value: "standard", label: "Standard", sub: "Core palette colors", icon: "Layers" },
  { value: "premium", label: "Premium", sub: "Designer tones and deeper hues", icon: "Star" },
  { value: "reserve", label: "Reserve", sub: "Exclusive Reserve-only colors", icon: "Gem" },
];

export const CONSTRUCTION_OPTIONS: SelectOption<ConstructionTier>[] = [
  { value: "good", label: "Good", sub: "Furniture-board box, soft-close doors and drawers", icon: "Shield" },
  { value: "better", label: "Better", sub: "Plywood box, full-extension soft-close slides", icon: "ShieldCheck" },
  { value: "best", label: "Best", sub: "All-plywood, dovetail drawer boxes, reinforced", icon: "Crown" },
];

export const STORAGE_OPTIONS: SelectOption<StorageTier>[] = [
  { value: "none", label: "None", sub: "Standard adjustable shelving", icon: "Box" },
  { value: "essential", label: "Essential", sub: "Pull-out shelves and trash pull-out", icon: "Package" },
  { value: "upgraded", label: "Upgraded", sub: "Organizers, lazy susan, spice pull-out", icon: "Boxes" },
  { value: "premium", label: "Premium", sub: "Full Smart Storage: pantry pull-outs, mixer lift, LED", icon: "Sparkles" },
];

const CONSTRUCTION_LABEL: Record<ConstructionTier, string> = {
  good: "Good", better: "Better", best: "Best",
};
const FINISH_TIER_LABEL: Record<FinishTier, string> = {
  standard: "Standard", premium: "Premium", reserve: "Reserve",
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

// Reserve colors read deeper/richer; premium slightly deeper than standard.
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

const STORAGE_SUMMARY_LABEL: Record<StorageTier, string> = {
  none: "Standard storage",
  essential: "Essential storage",
  upgraded: "Upgraded storage",
  premium: "Premium storage",
};

/** Construction story shown in the included scope. */
const CONSTRUCTION_INCLUDED: Record<ConstructionTier, string> = {
  good: "Furniture-board box with soft-close doors and drawers",
  better: "Plywood box construction with full-extension soft-close slides",
  best: "All-plywood box with dovetail drawer boxes and reinforced shelves",
};

/** Smart Storage accessory ids per tier (names resolved from the catalog). */
const STORAGE_ACCESSORY_IDS: Record<StorageTier, string[]> = {
  none: [],
  essential: ["pull-out-shelf", "trash-pullout"],
  upgraded: ["pull-out-shelf", "trash-pullout", "drawer-organizer-kit", "lazy-susan", "spice-rack-pullout"],
  premium: ["pull-out-pantry", "drawer-organizer-kit", "lazy-susan", "mixer-lift", "led-strip-channel", "trash-pullout"],
};

export const INCLUDED_SCOPE_NOTE =
  "Scope reflects the selections above. Your final scope is confirmed during consultation.";

export const APPLIANCE_DISCLAIMER =
  "Appliances are client-supplied; we'll guide your selection but do not purchase or install them.";

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
    case "whole-home":
      return "other";
    case "addition":
      return "closet";
    case "adu":
      return "laundry";
    default:
      return "other";
  }
}

// ── Defaults ────────────────────────────────────────────────────────────────

export function getDefaultLayout(project: ProjectType): string {
  const slugs = PROJECT_LAYOUT_SLUGS[project];
  // Kitchen defaults to its most-requested layout; others use the first.
  if (project === "kitchen") return "island";
  return slugs[0] ?? "";
}

export function getDefaultSelectionsForProject(project: ProjectType): EstimateSelections {
  return {
    project,
    layout: getDefaultLayout(project),
    size: PROJECT_SIZE_CONFIG[project].default,
    cabinetLine: "custom",
    doorStyle: "modern-shaker",
    finishSlug: "",
    finishCategory: "matte",
    finishTier: "standard",
    construction: "better",
    storage: "essential",
  };
}

export const DEFAULT_SELECTIONS: EstimateSelections = getDefaultSelectionsForProject("kitchen");

// ── Pricing ──────────────────────────────────────────────────────────────────

export function formatPlanningCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

function clampSize(project: ProjectType, size: number): number {
  const cfg = PROJECT_SIZE_CONFIG[project];
  if (!Number.isFinite(size)) return cfg.default;
  return Math.max(cfg.min, Math.min(cfg.max, Math.round(size)));
}

/** Combined upgrade multiplier for the current selections. */
export function getSelectionMultiplier(sel: EstimateSelections): number {
  const vis = getStepVisibility(sel.project);
  let m = 1;
  if (vis.layout) m *= LAYOUT_COMPLEXITY_MULTIPLIER[sel.layout] ?? 1;
  if (vis.doorStyle) m *= DOOR_STYLE_MULTIPLIER[sel.doorStyle] ?? 1;
  m *= CABINET_LINE_MULTIPLIER[sel.cabinetLine] ?? 1;
  m *= FINISH_CATEGORY_MULTIPLIER[sel.finishCategory] ?? 1;
  m *= FINISH_TIER_MULTIPLIER[sel.finishTier] ?? 1;
  m *= CONSTRUCTION_MULTIPLIER[sel.construction] ?? 1;
  m *= STORAGE_MULTIPLIER[sel.storage] ?? 1;
  return m;
}

function roundPrice(n: number): number {
  return Math.round(n / PRICE_ROUND_TO) * PRICE_ROUND_TO;
}

/** Short cabinet-line name for scope copy, e.g. "Custom Cabinets" -> "Custom". */
function lineDisplayName(id: string): string {
  const c = COLLECTIONS.find((x) => x.id === id);
  if (!c) return "Custom";
  return c.name.replace(/\s+Cabinets$/i, "");
}

export function getSizeLabel(project: ProjectType, size: number): string {
  const cfg = PROJECT_SIZE_CONFIG[project];
  const noun = size === 1 ? cfg.unitNounSingular : cfg.unitNoun;
  return `${size.toLocaleString()} ${noun}`;
}

export function buildScopeSummary(sel: EstimateSelections): string {
  const vis = getStepVisibility(sel.project);
  const parts: string[] = [];
  parts.push(`${lineDisplayName(sel.cabinetLine)} line`);
  if (vis.doorStyle) {
    const door = DOOR_STYLES.find((d) => d.id === sel.doorStyle);
    if (door) parts.push(door.name);
  }
  const namedFinish = sel.finishSlug ? FINISH_BY_SLUG[sel.finishSlug]?.name : undefined;
  parts.push(
    namedFinish
      ? `${namedFinish} (${FINISH_TIER_LABEL[sel.finishTier]} ${FINISH_CATEGORY_LABEL[sel.finishCategory]})`
      : `${FINISH_TIER_LABEL[sel.finishTier]} ${FINISH_CATEGORY_LABEL[sel.finishCategory]} finish`,
  );
  parts.push(`${CONSTRUCTION_LABEL[sel.construction]} construction`);
  parts.push(STORAGE_SUMMARY_LABEL[sel.storage]);
  return parts.join(" · ");
}

/** Short header line for the result panel: project + size. */
export function buildSelectionSummary(sel: EstimateSelections): string {
  return `${PROJECT_LABELS[sel.project].label} · ${getSizeLabel(sel.project, sel.size)}`;
}

function buildIncluded(sel: EstimateSelections): string[] {
  const vis = getStepVisibility(sel.project);
  const list: string[] = [];
  list.push(`${lineDisplayName(sel.cabinetLine)} line cabinets, built to order`);

  if (vis.layout) {
    const layout = LAYOUT_BY_SLUG[sel.layout];
    if (layout) list.push(`${layout.name} layout`);
  } else if (sel.project === "whole-home") {
    list.push(`Coordinated cabinetry across ${getSizeLabel(sel.project, sel.size)}`);
  }

  if (vis.doorStyle) {
    const door = DOOR_STYLES.find((d) => d.id === sel.doorStyle);
    if (door) list.push(`${door.name} door style`);
  }

  const namedFinish = sel.finishSlug ? FINISH_BY_SLUG[sel.finishSlug]?.name : undefined;
  list.push(
    namedFinish
      ? `${namedFinish} finish`
      : `${FINISH_TIER_LABEL[sel.finishTier]} ${FINISH_CATEGORY_LABEL[sel.finishCategory]} finish`,
  );
  list.push(CONSTRUCTION_INCLUDED[sel.construction]);

  const storageNames = STORAGE_ACCESSORY_IDS[sel.storage]
    .map((id) => ACCESSORY_BY_ID[id]?.name)
    .filter(Boolean) as string[];
  if (storageNames.length > 0) {
    list.push(`Smart Storage: ${storageNames.join(", ")}`);
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
  const vis = getStepVisibility(sel.project);
  const layoutSlugs = PROJECT_LAYOUT_SLUGS[sel.project];
  const layout = vis.layout && !layoutSlugs.includes(sel.layout)
    ? getDefaultLayout(sel.project)
    : sel.layout;
  let next = { ...sel, layout, size: clampSize(sel.project, sel.size) };
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
): EstimateResult {
  const sel = normalizeSelections(selections);
  const pricing = PROJECT_PRICING[sel.project];
  const mult = getSelectionMultiplier(sel);

  const priceLow = roundPrice(pricing.perUnitLow * sel.size * mult);
  const priceHigh = roundPrice(pricing.perUnitHigh * sel.size * mult);

  const total = getTotalSteps(sel.project);
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
): StoredEstimate {
  const sel = normalizeSelections(selections);
  const result = calculateEstimate(sel, selectionsMade);
  return {
    ...sel,
    priceLow: result.priceLow,
    priceHigh: result.priceHigh,
    roi: result.roi,
    confidence: result.confidence,
    confidenceLabel: result.confidenceLabel,
    scopeSummary: result.scopeSummary,
    sizeLabel: getSizeLabel(sel.project, sel.size),
    projectLabel: PROJECT_LABELS[sel.project].label,
  };
}
