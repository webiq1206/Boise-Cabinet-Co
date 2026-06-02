/**
 * Door style profiles available across Boise Cabinet Co collections.
 */

export type FinishCategory = "matte" | "gloss" | "woodgrain";

export interface DoorStyle {
  id: string;
  slug: string;
  name: string;
  description: string;
  constructionNotes: string;
  compatibleFinishCategories: FinishCategory[];
  /** Collections that offer this door style */
  availableInCollections: string[];
}

export const DOOR_STYLES: DoorStyle[] = [
  {
    id: "slab",
    slug: "slab",
    name: "Slab",
    description:
      "A flat, uninterrupted door face with clean edges, the defining look of contemporary Idaho kitchens. Slab doors emphasize horizontal lines and pair naturally with handleless hardware or long linear pulls.",
    constructionNotes:
      "1-inch MDF or hardwood-veneer panel with internal stiffening rails. Edge banding matched to face finish. Available with J-pull integrated edge or standard overlay hinges.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["full-custom", "semi-custom", "reserve", "spec-grade"],
  },
  {
    id: "three-piece",
    slug: "three-piece",
    name: "Three-Piece",
    description:
      "Classic framed construction with a recessed center panel bordered by stiles and rails. Three-Piece doors bring traditional warmth to North End bungalows, Eagle estates, and anywhere a timeless profile is desired.",
    constructionNotes:
      "Mortise-and-tenon or cope-and-stick joinery on solid hardwood frames. Center panel may be flat or raised. Profile depth typically 3/8 inch for Semi-Custom and 1/2 inch for Full Custom.",
    compatibleFinishCategories: ["matte", "woodgrain"],
    availableInCollections: ["full-custom", "semi-custom", "reserve"],
  },
  {
    id: "modern-shaker",
    slug: "modern-shaker",
    name: "Modern Shaker",
    description:
      "A wider, squarer shaker rail than traditional profiles, bold enough for open-concept Meridian kitchens yet restrained enough for transitional baths. Our most requested door style across the Treasure Valley.",
    constructionNotes:
      "2-1/4 inch stiles and rails with 1/4 inch reveal. Flat center panel in MDF or plywood. Soft-close hinge boring standard at 3-1/2 inch overlay.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["full-custom", "semi-custom", "reserve", "spec-grade"],
  },
  {
    id: "thin-shaker",
    slug: "thin-shaker",
    name: "Thin Shaker",
    description:
      "Delicate 1-inch rails create a lighter visual weight than Modern Shaker. Thin Shaker suits smaller footprints, galley kitchens, laundry rooms, and powder baths, where proportion matters.",
    constructionNotes:
      "1-inch stiles and rails with 1/8 inch step-back on center panel. Requires precision machining to maintain square reveals; available in widths down to 9 inches for spice pull-outs.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["full-custom", "semi-custom", "reserve", "spec-grade"],
  },
  {
    id: "alpha-shaker",
    slug: "alpha-shaker",
    name: "Alpha Shaker",
    description:
      "Reserve-exclusive profile with a beveled inner frame and slightly raised center panel. Alpha Shaker bridges shaker simplicity with subtle dimension, ideal for primary suites and entertainment spaces.",
    constructionNotes:
      "Reserve line only. 2-inch rails with 15-degree bevel on inner edge. Center panel sits 1/16 inch proud. Hand-sanded transitions before finish application.",
    compatibleFinishCategories: ["matte", "woodgrain"],
    availableInCollections: ["full-custom", "reserve"],
  },
  {
    id: "beta-shaker",
    slug: "beta-shaker",
    name: "Beta Shaker",
    description:
      "An angular, architecturally driven variant with squared outer edges and a shadow-line groove between frame and panel. Beta Shaker reads modern in matte finishes and sophisticated in deep woodgrains.",
    constructionNotes:
      "CNC-routed shadow groove at 1/16 inch depth. 2-1/2 inch rails on Full Custom; 2-inch on Semi-Custom and Reserve. Not recommended for high-gloss due to groove shadowing.",
    compatibleFinishCategories: ["matte", "woodgrain"],
    availableInCollections: ["full-custom", "semi-custom", "reserve"],
  },
];

export const DOOR_STYLE_BY_SLUG = Object.fromEntries(
  DOOR_STYLES.map((d) => [d.slug, d]),
) as Record<string, DoorStyle>;

export const DOOR_STYLE_BY_ID = Object.fromEntries(
  DOOR_STYLES.map((d) => [d.id, d]),
) as Record<string, DoorStyle>;
