/**
 * Door style profiles available across Boise Cabinet Co collections.
 *
 * These are the three door profiles our supplier actually produces:
 * Slab, Shaker, and Thin Shaker. Each is offered on every collection.
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
      "Flat panel with edge banding matched to the face finish. Available in matte, high-gloss, and woodgrain laminates. Soft-close overlay hinge boring standard.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["custom", "reserve"],
  },
  {
    id: "shaker",
    slug: "shaker",
    name: "Shaker",
    description:
      "A clean five-piece frame with a recessed center panel, our most requested profile across the Treasure Valley. Squared rails read bold in open-concept Meridian kitchens yet stay restrained enough for transitional baths.",
    constructionNotes:
      "Square stiles and rails with a flat recessed center panel. Soft-close hinge boring standard. Offered in matte, high-gloss, and woodgrain finishes.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["custom", "reserve"],
  },
  {
    id: "thin-shaker",
    slug: "thin-shaker",
    name: "Thin Shaker",
    description:
      "Narrow rails create a lighter visual weight than the standard Shaker. Thin Shaker suits smaller footprints, galley kitchens, laundry rooms, and powder baths, where proportion matters.",
    constructionNotes:
      "Slim stiles and rails with a flat recessed center panel. Precision-machined to keep square reveals; available in narrow widths for pull-outs. Offered in matte, high-gloss, and woodgrain finishes.",
    compatibleFinishCategories: ["matte", "gloss", "woodgrain"],
    availableInCollections: ["custom", "reserve"],
  },
];

export const DOOR_STYLE_BY_SLUG = Object.fromEntries(
  DOOR_STYLES.map((d) => [d.slug, d]),
) as Record<string, DoorStyle>;

export const DOOR_STYLE_BY_ID = Object.fromEntries(
  DOOR_STYLES.map((d) => [d.id, d]),
) as Record<string, DoorStyle>;
