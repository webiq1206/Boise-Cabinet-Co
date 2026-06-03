/**
 * Boise Cabinet Co product collections.
 *
 * Two real lines: our made-to-order Custom Cabinets, and the premium Reserve
 * color collection. Both are built to order from the same supplier program.
 */

export type PriceTier = "entry" | "mid" | "premium" | "luxury";

export interface CabinetCollection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  leadTime: string;
  priceTier: PriceTier;
  heroImage: string;
}

export const COLLECTIONS: CabinetCollection[] = [
  {
    id: "custom",
    slug: "custom",
    name: "Custom Cabinets",
    tagline: "Built around your space, not the other way around.",
    description:
      "Our made-to-order line for homeowners who want their cabinets sized and finished for their home. Custom Cabinets are built to order in Slab, Shaker, and Thin Shaker door styles with a full library of matte, high-gloss, and woodgrain finishes. Design consultations include layout review, finish samples in your home's natural light, and a written scope before production begins.",
    features: [
      "Sized to your kitchen, bath, or built-in layout",
      "Slab, Shaker, and Thin Shaker door styles",
      "Full matte, high-gloss, and woodgrain finish library",
      "Plywood box construction with soft-close hardware",
      "Smart Storage pull-outs and organizers available",
      "Dedicated project manager from design through install",
    ],
    leadTime: "6–10 weeks from approved design",
    priceTier: "premium",
    heroImage: "/images/catalog/collections/custom.webp",
  },
  {
    id: "reserve",
    slug: "reserve",
    name: "Reserve",
    tagline: "Premium colors for elevated everyday living.",
    description:
      "Reserve is our premium color collection, the same made-to-order cabinets finished in an exclusive palette of designer tones reserved for this line. Reserve works especially well in primary kitchens, mudrooms, and home offices where a refined, of-the-moment color matters as much as durability. Reserve orders include a complimentary finish sample kit for the Reserve palette.",
    features: [
      "Exclusive Reserve-only color palette",
      "Slab, Shaker, and Thin Shaker door styles",
      "Built to order in your room's exact sizes",
      "Plywood box construction with soft-close hardware",
      "Smart Storage pull-outs and organizers available",
      "Complimentary Reserve finish sample kit",
    ],
    leadTime: "6–10 weeks from approved design",
    priceTier: "luxury",
    heroImage: "/images/catalog/collections/reserve.webp",
  },
];

export const COLLECTION_BY_SLUG = Object.fromEntries(
  COLLECTIONS.map((c) => [c.slug, c]),
) as Record<string, CabinetCollection>;

export const COLLECTION_BY_ID = Object.fromEntries(
  COLLECTIONS.map((c) => [c.id, c]),
) as Record<string, CabinetCollection>;
