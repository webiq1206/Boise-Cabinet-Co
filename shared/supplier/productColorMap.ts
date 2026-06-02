/**
 * Maps Boise Cabinet Co catalog finishes and door styles to One Source / Tafisa panel products.
 * verified: true = confirmed OSC/Tafisa SKU alignment; false = BRC label pending dealer confirmation.
 */

export type SupplierPanelBrand = "Tafisa" | "Salt International";
export type SupplierFinishType = "matte" | "gloss" | "eir-woodgrain";

export interface FinishColorMapping {
  brcSlug: string;
  brcName: string;
  supplierPanelBrand: SupplierPanelBrand;
  supplierColorName: string;
  supplierSeries: string;
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

/** Tafisa Prélude/Sommet crosswalk — seeded from finish names and OSC panel partner docs. */
export const FINISH_COLOR_MAP: FinishColorMapping[] = [
  { brcSlug: "snowcap", brcName: "Snowcap", supplierPanelBrand: "Tafisa", supplierColorName: "Classic White (CR)", supplierSeries: "Prélude Crystalite", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/snowcap.webp" },
  { brcSlug: "glacier", brcName: "Glacier", supplierPanelBrand: "Tafisa", supplierColorName: "Glacier White (CR)", supplierSeries: "Prélude Crystalite", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/glacier.webp" },
  { brcSlug: "dune", brcName: "Dune", supplierPanelBrand: "Tafisa", supplierColorName: "Daybreak (IS)", supplierSeries: "Prélude Isola", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/dune.webp" },
  { brcSlug: "sagebrush", brcName: "Sagebrush", supplierPanelBrand: "Tafisa", supplierColorName: "Force of Nature (KA)", supplierSeries: "Prélude Karisma", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/sagebrush.webp" },
  { brcSlug: "slate", brcName: "Slate", supplierPanelBrand: "Tafisa", supplierColorName: "Materia Black (MA)", supplierSeries: "Prélude Materia", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/slate.webp" },
  { brcSlug: "midnight", brcName: "Midnight", supplierPanelBrand: "Tafisa", supplierColorName: "Black Tie (BV)", supplierSeries: "Sommet Brava", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/midnight.webp" },
  { brcSlug: "clay", brcName: "Clay", supplierPanelBrand: "Tafisa", supplierColorName: "Hot Cinnamon (SN)", supplierSeries: "Prélude Smoothwood", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/clay.webp" },
  { brcSlug: "fog", brcName: "Fog", supplierPanelBrand: "Tafisa", supplierColorName: "Froth of Sea (CR)", supplierSeries: "Prélude Crystalite", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/fog.webp" },
  { brcSlug: "linen", brcName: "Linen", supplierPanelBrand: "Tafisa", supplierColorName: "Materia Cream Puff (MA)", supplierSeries: "Prélude Materia", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/linen.webp" },
  { brcSlug: "riverstone", brcName: "Riverstone", supplierPanelBrand: "Tafisa", supplierColorName: "Dark Chocolate (UR)", supplierSeries: "Prélude Urbania", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/riverstone.webp" },
  { brcSlug: "basalt", brcName: "Basalt", supplierPanelBrand: "Tafisa", supplierColorName: "Black (CR)", supplierSeries: "Prélude Crystalite", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/basalt.webp" },
  { brcSlug: "mist", brcName: "Mist", supplierPanelBrand: "Tafisa", supplierColorName: "Evening Star (IS)", supplierSeries: "Prélude Isola", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/mist.webp" },
  { brcSlug: "terracotta", brcName: "Terracotta", supplierPanelBrand: "Tafisa", supplierColorName: "Hot Fudge (CR)", supplierSeries: "Prélude Crystalite", finishType: "matte", verified: false, imagePath: "/images/catalog/finishes/terracotta.webp" },
  { brcSlug: "fern", brcName: "Fern", supplierPanelBrand: "Tafisa", supplierColorName: "Force of Nature (KA)", supplierSeries: "Prélude Karisma", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/fern.webp" },
  { brcSlug: "pebble", brcName: "Pebble", supplierPanelBrand: "Salt International", supplierColorName: "Reserve Greige (OSC Reserve)", supplierSeries: "One Source Reserve", finishType: "matte", verified: true, imagePath: "/images/catalog/finishes/pebble.webp" },
  { brcSlug: "porcelain", brcName: "Porcelain", supplierPanelBrand: "Tafisa", supplierColorName: "Classic White High Gloss (CR)", supplierSeries: "Prélude Crystalite", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/porcelain.webp" },
  { brcSlug: "ivory", brcName: "Ivory", supplierPanelBrand: "Tafisa", supplierColorName: "Ivory (CR)", supplierSeries: "Prélude Crystalite", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/ivory.webp" },
  { brcSlug: "pearl", brcName: "Pearl", supplierPanelBrand: "Tafisa", supplierColorName: "Crème de la Crème (BV)", supplierSeries: "Sommet Brava", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/pearl.webp" },
  { brcSlug: "graphite", brcName: "Graphite", supplierPanelBrand: "Tafisa", supplierColorName: "Black (IS)", supplierSeries: "Prélude Isola", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/graphite.webp" },
  { brcSlug: "obsidian", brcName: "Obsidian", supplierPanelBrand: "Tafisa", supplierColorName: "Materia Black High Gloss (MA)", supplierSeries: "Prélude Materia", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/obsidian.webp" },
  { brcSlug: "seafoam", brcName: "Seafoam", supplierPanelBrand: "Tafisa", supplierColorName: "Copa Cabana (SN)", supplierSeries: "Prélude Smoothwood", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/seafoam.webp" },
  { brcSlug: "blush", brcName: "Blush", supplierPanelBrand: "Tafisa", supplierColorName: "Fashionista (KA)", supplierSeries: "Prélude Karisma", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/blush.webp" },
  { brcSlug: "cobalt", brcName: "Cobalt", supplierPanelBrand: "Tafisa", supplierColorName: "Latitude East (AT)", supplierSeries: "Prélude Alto", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/cobalt.webp" },
  { brcSlug: "champagne", brcName: "Champagne", supplierPanelBrand: "Tafisa", supplierColorName: "First Class (KA)", supplierSeries: "Prélude Karisma", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/champagne.webp" },
  { brcSlug: "storm", brcName: "Storm", supplierPanelBrand: "Tafisa", supplierColorName: "Brushed Aluminum (CR)", supplierSeries: "Prélude Crystalite", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/storm.webp" },
  { brcSlug: "alabaster", brcName: "Alabaster", supplierPanelBrand: "Tafisa", supplierColorName: "Home Sweet Home (BV)", supplierSeries: "Sommet Brava", finishType: "gloss", verified: true, imagePath: "/images/catalog/finishes/alabaster.webp" },
  { brcSlug: "crimson", brcName: "Crimson", supplierPanelBrand: "Salt International", supplierColorName: "Reserve Crimson (OSC Reserve)", supplierSeries: "One Source Reserve", finishType: "gloss", verified: false, imagePath: "/images/catalog/finishes/crimson.webp" },
  { brcSlug: "white-oak", brcName: "White Oak", supplierPanelBrand: "Tafisa", supplierColorName: "Sand Barbera Oak (OSC Semi-Custom)", supplierSeries: "Prélude Smoothwood EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/white-oak.webp" },
  { brcSlug: "natural-walnut", brcName: "Natural Walnut", supplierPanelBrand: "Tafisa", supplierColorName: "Hardrock Maple (CR)", supplierSeries: "Prélude Crystalite EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/natural-walnut.webp" },
  { brcSlug: "espresso-walnut", brcName: "Espresso Walnut", supplierPanelBrand: "Tafisa", supplierColorName: "Dark Rum Cherry (CR)", supplierSeries: "Prélude Crystalite EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/espresso-walnut.webp" },
  { brcSlug: "honey-maple", brcName: "Honey Maple", supplierPanelBrand: "Tafisa", supplierColorName: "Acacia Honey (KA)", supplierSeries: "Prélude Karisma EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/honey-maple.webp" },
  { brcSlug: "driftwood", brcName: "Driftwood", supplierPanelBrand: "Tafisa", supplierColorName: "Bora Bora (SN)", supplierSeries: "Prélude Smoothwood EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/driftwood.webp" },
  { brcSlug: "charcoal-oak", brcName: "Charcoal Oak", supplierPanelBrand: "Tafisa", supplierColorName: "Grenada (SN)", supplierSeries: "Prélude Smoothwood EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/charcoal-oak.webp" },
  { brcSlug: "hickory", brcName: "Hickory", supplierPanelBrand: "Tafisa", supplierColorName: "Dolce Vita (SN)", supplierSeries: "Prélude Smoothwood EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/hickory.webp" },
  { brcSlug: "cherry", brcName: "Cherry", supplierPanelBrand: "Tafisa", supplierColorName: "Dark Rum Cherry (CR)", supplierSeries: "Prélude Crystalite EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/cherry.webp" },
  { brcSlug: "ash", brcName: "Ash", supplierPanelBrand: "Tafisa", supplierColorName: "Latitude North (AT)", supplierSeries: "Prélude Alto EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/ash.webp" },
  { brcSlug: "teak", brcName: "Teak", supplierPanelBrand: "Tafisa", supplierColorName: "Free Spirit (KA)", supplierSeries: "Prélude Karisma EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/teak.webp" },
  { brcSlug: "reclaimed-barn", brcName: "Reclaimed Barn", supplierPanelBrand: "Salt International", supplierColorName: "Reserve Wire-Brushed (OSC Reserve)", supplierSeries: "One Source Reserve", finishType: "eir-woodgrain", verified: false, imagePath: "/images/catalog/finishes/reclaimed-barn.webp" },
  { brcSlug: "ebony", brcName: "Ebony", supplierPanelBrand: "Tafisa", supplierColorName: "Materia Black (MA) EIR", supplierSeries: "Prélude Materia EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/ebony.webp" },
  { brcSlug: "blonde-oak", brcName: "Blonde Oak", supplierPanelBrand: "Tafisa", supplierColorName: "Sand Barbera Oak Light (OSC)", supplierSeries: "Prélude Smoothwood EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/blonde-oak.webp" },
  { brcSlug: "pecan", brcName: "Pecan", supplierPanelBrand: "Tafisa", supplierColorName: "Acacia Honey (KA)", supplierSeries: "Prélude Karisma EIR", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/pecan.webp" },
  { brcSlug: "cedar", brcName: "Cedar", supplierPanelBrand: "Salt International", supplierColorName: "Reserve Cedar (OSC Reserve)", supplierSeries: "One Source Reserve", finishType: "eir-woodgrain", verified: true, imagePath: "/images/catalog/finishes/cedar.webp" },
];

export const DOOR_STYLE_MAP: DoorStyleMapping[] = [
  { brcSlug: "slab", brcName: "Slab", oscName: "Slab", verified: true, imagePath: "/images/catalog/door-styles/slab.webp" },
  { brcSlug: "modern-shaker", brcName: "Modern Shaker", oscName: "Modern Shaker", verified: true, imagePath: "/images/catalog/door-styles/modern-shaker.webp" },
  { brcSlug: "thin-shaker", brcName: "Thin Shaker", oscName: "Thin Shaker", verified: true, imagePath: "/images/catalog/door-styles/thin-shaker.webp" },
  { brcSlug: "three-piece", brcName: "Three-Piece", oscName: "5-Piece Shaker", verified: true, imagePath: "/images/catalog/door-styles/three-piece.webp" },
  { brcSlug: "alpha-shaker", brcName: "Alpha Shaker", oscName: "Alpha Shaker (Reserve)", verified: false, imagePath: "/images/catalog/door-styles/alpha-shaker.webp" },
  { brcSlug: "beta-shaker", brcName: "Beta Shaker", oscName: "Beta Shaker (Reserve)", verified: false, imagePath: "/images/catalog/door-styles/beta-shaker.webp" },
];

export const COLLECTION_MAP: CollectionMapping[] = [
  { brcSlug: "full-custom", brcName: "Full Custom", oscLine: "One Source Full Custom (built-to-order)", verified: true },
  { brcSlug: "semi-custom", brcName: "Semi-Custom", oscLine: "One Source Semi-Custom", verified: true },
  { brcSlug: "reserve", brcName: "Reserve", oscLine: "One Source Reserve Collection", verified: true },
  { brcSlug: "spec-grade", brcName: "Spec Grade", oscLine: "One Source Spec / Builder Line", verified: true },
];

export const FINISH_MAP_BY_SLUG = Object.fromEntries(
  FINISH_COLOR_MAP.map((f) => [f.brcSlug, f]),
) as Record<string, FinishColorMapping>;

export function getFinishMapping(slug: string): FinishColorMapping | undefined {
  return FINISH_MAP_BY_SLUG[slug];
}

export function getSupplierColorPrompt(slug: string): string {
  const m = FINISH_MAP_BY_SLUG[slug];
  if (!m) return "neutral cabinet finish";
  return `${m.supplierPanelBrand} ${m.supplierColorName} ${m.finishType} finish`;
}
