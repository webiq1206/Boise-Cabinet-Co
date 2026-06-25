/**
 * Hardware options for Boise Cabinet Co cabinet orders.
 */

export type HardwareCategory = "pull" | "knob" | "hinge" | "slide" | "handleless";

export type HardwareFinish =
  | "matte-black"
  | "brushed-nickel"
  | "polished-chrome"
  | "brushed-gold"
  | "oil-rubbed-bronze"
  | "stainless";

export interface HardwareOption {
  id: string;
  slug: string;
  name: string;
  category: HardwareCategory;
  description: string;
  finish: HardwareFinish;
  /** Center-to-center bore in mm, if applicable */
  centerToCenterMm?: number;
  compatibleCollectionIds: string[];
  isSoftClose?: boolean;
}

export const HARDWARE_OPTIONS: HardwareOption[] = [
  {
    id: "pull-bar-128-black",
    slug: "bar-pull-128-black",
    name: "Bar Pull 128mm",
    category: "pull",
    description:
      "Slim rectangular bar pull in matte black, our most popular choice for Shaker and slab kitchens across the Treasure Valley.",
    finish: "matte-black",
    centerToCenterMm: 128,
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "pull-bar-160-nickel",
    slug: "bar-pull-160-nickel",
    name: "Bar Pull 160mm",
    category: "pull",
    description:
      "Longer bar pull in brushed nickel suited to pantry tall doors and wide drawer fronts on island bases.",
    finish: "brushed-nickel",
    centerToCenterMm: 160,
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "pull-cup-gold",
    slug: "cup-pull-gold",
    name: "Cup Pull",
    category: "pull",
    description:
      "Traditional cup pull in brushed gold for Shaker profiles in transitional kitchens.",
    finish: "brushed-gold",
    centerToCenterMm: 96,
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "pull-finger-edge",
    slug: "finger-edge-pull",
    name: "Finger Edge Pull",
    category: "handleless",
    description:
      "C-channel routed into the top edge of slab doors and drawer fronts for a true handleless look. Available in matte black or brushed nickel edge inserts.",
    finish: "matte-black",
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "pull-j-channel",
    slug: "j-channel-pull",
    name: "J-Channel Integrated Pull",
    category: "handleless",
    description:
      "Angled J-pull profile milled into slab door edges, a cleaner alternative to surface-mounted bars for contemporary Idaho kitchens.",
    finish: "matte-black",
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "knob-round-nickel",
    slug: "round-knob-nickel",
    name: "Round Knob",
    category: "knob",
    description:
      "Classic round knob in brushed nickel for wall cabinets, vanity doors, and budget-friendly packages where simplicity and cost matter.",
    finish: "brushed-nickel",
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "knob-square-black",
    slug: "square-knob-black",
    name: "Square Knob",
    category: "knob",
    description:
      "Geometric square knob in matte black for thin-shaker uppers and laundry room cabinets.",
    finish: "matte-black",
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "knob-glass-chrome",
    slug: "glass-knob-chrome",
    name: "Glass Knob",
    category: "knob",
    description:
      "Faceted glass knob with polished chrome base, an accent option for vanity suites and wet bar glass-door uppers.",
    finish: "polished-chrome",
    compatibleCollectionIds: ["custom"],
  },
  {
    id: "hinge-soft-close",
    slug: "soft-close-hinge",
    name: "Soft-Close Concealed Hinge",
    category: "hinge",
    description:
      "110-degree concealed hinge with integrated soft-close damper. Included standard on all Boise Cabinet Co collections except where handleless push-to-open is specified.",
    finish: "stainless",
    compatibleCollectionIds: ["custom"],
    isSoftClose: true,
  },
  {
    id: "hinge-push-to-open",
    slug: "push-to-open-hinge",
    name: "Push-to-Open Hinge",
    category: "hinge",
    description:
      "Touch-latch hinge for handleless slab doors. Pairs with J-channel or finger edge profiles for fully hardware-free facades.",
    finish: "stainless",
    compatibleCollectionIds: ["custom"],
    isSoftClose: false,
  },
  {
    id: "slide-soft-close-full",
    slug: "soft-close-drawer-slide",
    name: "Soft-Close Full-Extension Slide",
    category: "slide",
    description:
      "Full-extension undermount slide with soft-close on every drawer box. Standard on every drawer box.",
    finish: "stainless",
    compatibleCollectionIds: ["custom"],
    isSoftClose: true,
  },
  {
    id: "slide-heavy-duty",
    slug: "heavy-duty-drawer-slide",
    name: "Heavy-Duty Soft-Close Slide",
    category: "slide",
    description:
      "Heavy-duty soft-close slides for pot-and-pan drawers, appliance bases, and garage tool cabinets. Standard on designated wide drawers.",
    finish: "stainless",
    compatibleCollectionIds: ["custom"],
    isSoftClose: true,
  },
  {
    id: "pull-outdoor-stainless",
    slug: "outdoor-bar-pull-stainless",
    name: "Outdoor Bar Pull",
    category: "pull",
    description:
      "Marine-grade stainless bar pull for outdoor kitchen and covered patio cabinetry. Resists corrosion from Idaho humidity swings under roof overhangs.",
    finish: "stainless",
    centerToCenterMm: 128,
    compatibleCollectionIds: ["custom"],
  },
];

export const HARDWARE_BY_SLUG = Object.fromEntries(
  HARDWARE_OPTIONS.map((h) => [h.slug, h]),
) as Record<string, HardwareOption>;

export const HARDWARE_BY_ID = Object.fromEntries(
  HARDWARE_OPTIONS.map((h) => [h.id, h]),
) as Record<string, HardwareOption>;
