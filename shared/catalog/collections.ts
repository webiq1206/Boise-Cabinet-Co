/**
 * Boise Cabinet Co product collections — tiered cabinet lines for Treasure Valley homes.
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
    id: "full-custom",
    slug: "full-custom",
    name: "Full Custom",
    tagline: "Built around your space, not the other way around.",
    description:
      "Our flagship line for homeowners who want every dimension, detail, and finish chosen for their home. Full Custom cabinets are engineered in our Kuna shop from premium hardwood and plywood, sized to the millimeter for irregular walls, vaulted ceilings, and one-of-a-kind layouts common in Treasure Valley remodels. Design consultations include 3D layout review, sample finishes in your home's natural light, and a written scope before production begins.",
    features: [
      "Any width, height, and depth within structural limits",
      "Solid hardwood face frames or full-ply construction",
      "Unlimited finish palette including custom color match",
      "Integrated lighting channels and appliance panels",
      "Soft-close hardware included on every door and drawer",
      "Dedicated project manager from design through install",
    ],
    leadTime: "10–14 weeks from approved design",
    priceTier: "luxury",
    heroImage: "/images/catalog/collections/full-custom.png",
  },
  {
    id: "semi-custom",
    slug: "semi-custom",
    name: "Semi-Custom",
    tagline: "Flexible sizing with proven door styles and finishes.",
    description:
      "Semi-Custom balances personalization with faster lead times. Choose from our curated door profiles and finish library, then specify cabinet widths in 1-inch increments within standard height and depth modules. Ideal for kitchen refreshes, bathroom vanities, and built-ins where you need a tailored fit without fully bespoke engineering. Every Semi-Custom order includes our shop drawings for your approval before we cut a single panel.",
    features: [
      "Widths adjustable in 1-inch increments",
      "Six door style profiles and 40+ finishes",
      "Plywood box construction with hardwood or MDF fronts",
      "Optional glass inserts and open shelving modules",
      "Standard and premium hardware packages available",
      "Compatible with all Boise Cabinet Co accessories",
    ],
    leadTime: "6–8 weeks from approved design",
    priceTier: "premium",
    heroImage: "/images/catalog/collections/semi-custom.png",
  },
  {
    id: "reserve",
    slug: "reserve",
    name: "Reserve",
    tagline: "Curated materials for elevated everyday living.",
    description:
      "Reserve is our designer-forward collection featuring exclusive finishes, thicker door profiles, and upgraded interior hardware. Selected woodgrains and matte tones are stocked locally for quicker turnaround on whole-room packages. Reserve works especially well in primary kitchens, mudrooms, and home offices where durability and a refined aesthetic matter equally.",
    features: [
      "Exclusive Reserve-only finish selections",
      "1-inch adjustable widths on standard modules",
      "Thicker door panels with reinforced joinery",
      "Premium soft-close slides rated for 100 lb loads",
      "Dovetail drawer boxes on base and vanity units",
      "Complimentary finish sample kit for Reserve palettes",
    ],
    leadTime: "5–7 weeks from approved design",
    priceTier: "premium",
    heroImage: "/images/catalog/collections/reserve.png",
  },
  {
    id: "spec-grade",
    slug: "spec-grade",
    name: "Spec Grade",
    tagline: "Reliable quality for builders, flips, and rental refreshes.",
    description:
      "Spec Grade delivers Boise Cabinet Co craftsmanship at predictable price points for production schedules. Fixed module sizes, a streamlined finish roster, and bulk-order pricing make this line a fit for new construction, ADU packages, and investment property updates across Ada and Canyon counties. Same installation standards and warranty as our custom lines — without the extended design cycle.",
    features: [
      "Standard module sizes for fast quoting",
      "Four door styles and 12 core finishes in stock",
      "Builder-friendly lead times and phased delivery",
      "Volume pricing for 10+ units per order",
      "Moisture-resistant box options for laundry and bath",
      "Written spec sheets for permit and appraisal packages",
    ],
    leadTime: "3–5 weeks from approved order",
    priceTier: "entry",
    heroImage: "/images/catalog/collections/spec-grade.png",
  },
];

export const COLLECTION_BY_SLUG = Object.fromEntries(
  COLLECTIONS.map((c) => [c.slug, c]),
) as Record<string, CabinetCollection>;

export const COLLECTION_BY_ID = Object.fromEntries(
  COLLECTIONS.map((c) => [c.id, c]),
) as Record<string, CabinetCollection>;
