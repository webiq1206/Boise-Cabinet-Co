/**
 * Maps Boise Cabinet Co catalog finishes to One Source Cabinets' real, published colors.
 *
 * Verification policy (owner rule: "nothing fake labeled verified:true"):
 * Each entry below was checked against the colors One Source Cabinets actually
 * publishes on onesourcecabinets.com (matte, gloss, and woodgrain pages) in
 * June 2026. A finish is marked `verified: true` only when a BRC palette color
 * confidently corresponds to a real One Source color (by hue/character and, where
 * applicable, name). BRC finishes with no confident One Source equivalent are left
 * `verified: false` and carry no supplier fields, so the UI never surfaces an
 * unconfirmed match as if it were real.
 *
 * Real One Source color sources:
 * - Matte: Tafisa Lummia "Perfect Matt" line (onesourcecabinets.com/matte-colors)
 * - Gloss: One Source gloss line (onesourcecabinets.com/gloss-cabinets) - panel
 *   brand not published by the supplier, so brand is intentionally omitted.
 * - Woodgrain: Salt International, Stevenswood, and Tafisa Karisma lines
 *   (onesourcecabinets.com/woodgrain-texture)
 */

export type SupplierPanelBrand = "Tafisa" | "Salt International" | "Stevenswood";
export type SupplierFinishType = "matte" | "gloss" | "eir-woodgrain";

export interface FinishColorMapping {
  brcSlug: string;
  brcName: string;
  /** Panel maker, when published by One Source. Omitted for gloss (brand not disclosed). */
  supplierPanelBrand?: SupplierPanelBrand;
  /** The exact color name One Source Cabinets publishes. Present only on verified matches. */
  supplierColorName?: string;
  /** The supplier collection/line the color belongs to. Present only on verified matches. */
  supplierSeries?: string;
  finishType: SupplierFinishType;
  verified: boolean;
  imagePath: string;
}

export interface DoorStyleMapping {
  brcSlug: string;
  brcName: string;
  oscName: string;
  verified: boolean;
  imagePath: string;
}

export interface CollectionMapping {
  brcSlug: string;
  brcName: string;
  oscLine: string;
  verified: boolean;
}

/**
 * Confirmed matches carry the real One Source color name, panel brand, and series.
 * Unconfirmed BRC palette colors have no One Source equivalent and stay verified: false.
 */
export const FINISH_COLOR_MAP: FinishColorMapping[] = [
  // ── Matte - Tafisa Lummia "Perfect Matt" ──────────────────────────────────
  { brcSlug: "snowcap", brcName: "Snowcap", supplierPanelBrand: "Tafisa", supplierColorName: "Vanilla Orchid", supplierSeries: "Lummia Perfect Matt", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/snowcap.webp" },
  { brcSlug: "glacier", brcName: "Glacier", supplierPanelBrand: "Tafisa", supplierColorName: "Carte Blanche", supplierSeries: "Lummia Perfect Matt", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/glacier.webp" },
  { brcSlug: "dune", brcName: "Dune", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/dune.webp" },
  { brcSlug: "sagebrush", brcName: "Sagebrush", supplierPanelBrand: "Tafisa", supplierColorName: "Eucalyptus", supplierSeries: "Lummia Perfect Matt", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/sagebrush.webp" },
  { brcSlug: "slate", brcName: "Slate", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/slate.webp" },
  { brcSlug: "midnight", brcName: "Midnight", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/midnight.webp" },
  { brcSlug: "clay", brcName: "Clay", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/clay.webp" },
  { brcSlug: "fog", brcName: "Fog", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/fog.webp" },
  { brcSlug: "linen", brcName: "Linen", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/linen.webp" },
  { brcSlug: "riverstone", brcName: "Riverstone", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/riverstone.webp" },
  { brcSlug: "basalt", brcName: "Basalt", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/basalt.webp" },
  { brcSlug: "mist", brcName: "Mist", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/mist.webp" },
  { brcSlug: "terracotta", brcName: "Terracotta", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/terracotta.webp" },
  { brcSlug: "fern", brcName: "Fern", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/fern.webp" },
  { brcSlug: "pebble", brcName: "Pebble", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/pebble.webp" },

  // ── Gloss - One Source gloss line (panel brand not published) ──────────────
  { brcSlug: "porcelain", brcName: "Porcelain", supplierColorName: "Gloss White", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/porcelain.webp" },
  { brcSlug: "ivory", brcName: "Ivory", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/ivory.webp" },
  { brcSlug: "pearl", brcName: "Pearl", supplierColorName: "Gloss Light Grey", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/pearl.webp" },
  { brcSlug: "graphite", brcName: "Graphite", supplierColorName: "Gloss Graphite", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/graphite.webp" },
  { brcSlug: "obsidian", brcName: "Obsidian", supplierColorName: "Gloss Black", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/obsidian.webp" },
  { brcSlug: "seafoam", brcName: "Seafoam", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/seafoam.webp" },
  { brcSlug: "blush", brcName: "Blush", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/blush.webp" },
  { brcSlug: "cobalt", brcName: "Cobalt", supplierColorName: "Gloss Deep Blue", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/cobalt.webp" },
  { brcSlug: "champagne", brcName: "Champagne", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/champagne.webp" },
  { brcSlug: "storm", brcName: "Storm", supplierColorName: "Gloss Dark Grey", supplierSeries: "One Source Gloss", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/storm.webp" },
  { brcSlug: "alabaster", brcName: "Alabaster", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/alabaster.webp" },
  { brcSlug: "crimson", brcName: "Crimson", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/crimson.webp" },

  // ── Woodgrain - Salt International, Stevenswood, Tafisa Karisma ─────────────
  { brcSlug: "white-oak", brcName: "White Oak", supplierPanelBrand: "Salt International", supplierColorName: "Canyon Oak", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/white-oak.webp" },
  { brcSlug: "natural-walnut", brcName: "Natural Walnut", supplierPanelBrand: "Salt International", supplierColorName: "Canyon Walnut", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/natural-walnut.webp" },
  { brcSlug: "espresso-walnut", brcName: "Espresso Walnut", supplierPanelBrand: "Salt International", supplierColorName: "Pecan Scuro", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/espresso-walnut.webp" },
  { brcSlug: "honey-maple", brcName: "Honey Maple", supplierPanelBrand: "Salt International", supplierColorName: "Olmo Miele", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/honey-maple.webp" },
  { brcSlug: "driftwood", brcName: "Driftwood", supplierPanelBrand: "Tafisa", supplierColorName: "Chameleon", supplierSeries: "Karisma", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/driftwood.webp" },
  { brcSlug: "charcoal-oak", brcName: "Charcoal Oak", supplierPanelBrand: "Salt International", supplierColorName: "Canyon Charcoal", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/charcoal-oak.webp" },
  { brcSlug: "hickory", brcName: "Hickory", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/hickory.webp" },
  { brcSlug: "cherry", brcName: "Cherry", supplierPanelBrand: "Stevenswood", supplierColorName: "Kirsche", supplierSeries: "Stevenswood", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/cherry.webp" },
  { brcSlug: "ash", brcName: "Ash", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/ash.webp" },
  { brcSlug: "teak", brcName: "Teak", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/teak.webp" },
  { brcSlug: "reclaimed-barn", brcName: "Reclaimed Barn", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/reclaimed-barn.webp" },
  { brcSlug: "ebony", brcName: "Ebony", supplierPanelBrand: "Salt International", supplierColorName: "Rockefeller", supplierSeries: "Salt TSV", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/ebony.webp" },
  { brcSlug: "blonde-oak", brcName: "Blonde Oak", supplierPanelBrand: "Tafisa", supplierColorName: "Sheer Beauty", supplierSeries: "Karisma", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/blonde-oak.webp" },
  { brcSlug: "pecan", brcName: "Pecan", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/pecan.webp" },
  { brcSlug: "cedar", brcName: "Cedar", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/cedar.webp" },
];

export const DOOR_STYLE_MAP: DoorStyleMapping[] = [
  { brcSlug: "slab", brcName: "Slab", oscName: "Slab", verified: true, imagePath: "/images/catalog/door-styles/slab.webp" },
  { brcSlug: "shaker", brcName: "Shaker", oscName: "Shaker", verified: true, imagePath: "/images/catalog/door-styles/shaker.webp" },
  { brcSlug: "thin-shaker", brcName: "Thin Shaker", oscName: "Thin Shaker", verified: true, imagePath: "/images/catalog/door-styles/thin-shaker.webp" },
];

export const COLLECTION_MAP: CollectionMapping[] = [
  { brcSlug: "custom", brcName: "Custom Cabinets", oscLine: "One Source built-to-order custom line", verified: true },
  { brcSlug: "reserve", brcName: "Reserve", oscLine: "One Source Reserve Collection", verified: true },
];

export const FINISH_MAP_BY_SLUG = Object.fromEntries(
  FINISH_COLOR_MAP.map((f) => [f.brcSlug, f]),
) as Record<string, FinishColorMapping>;

export function getFinishMapping(slug: string): FinishColorMapping | undefined {
  return FINISH_MAP_BY_SLUG[slug];
}

export function getSupplierColorPrompt(slug: string): string {
  const m = FINISH_MAP_BY_SLUG[slug];
  if (!m || !m.supplierColorName) return "neutral cabinet finish";
  const brand = m.supplierPanelBrand ? `${m.supplierPanelBrand} ` : "";
  return `${brand}${m.supplierColorName} ${m.finishType} finish`;
}
