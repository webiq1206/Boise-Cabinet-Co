import { GALLERY_IMAGES } from "./siteImages";

export interface CaseStudy {
  slug: string;
  title: string;
  city: string;
  serviceType: string;
  /** One-line scope summary shown under the title. */
  scope: string;
  challenge: string;
  approach: string;
  outcome: string;
  details: Array<{ label: string; value: string }>;
  imageUrl: string;
  imageAlt: string;
  /** Catalog/guide links relevant to this project type. */
  links: Array<{ label: string; href: string }>;
}

/**
 * Detailed write-ups of representative projects (expanded from the gallery
 * portfolio). Budget and timeline figures align with the published planning
 * bands in the Boise Cabinet Cost Guide.
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "boise-kitchen-cabinet-upgrade",
    title: "Modern Kitchen Cabinet Upgrade",
    city: "Boise",
    serviceType: "Kitchen cabinets",
    scope: "Full kitchen cabinet replacement with island in a Boise Bench ranch",
    challenge:
      "A 1960s Boise Bench ranch with original boxes, a soffit-wrapped perimeter, and walls nearly an inch out of plumb across the main run. The owners wanted a current shaker kitchen with real drawer storage and an island, without moving plumbing or walls.",
    approach:
      "Field measurement mapped the wall lean so cabinets could be dimensioned to absorb it invisibly. Soffits came down to allow ceiling-height uppers, the base run converted from doors to full-extension drawers, and a new island added prep storage and a trash pull-out. Modern shaker doors in a matte painted finish with soft-close hardware throughout.",
    outcome:
      "Installed in four days after a six-week fabrication window. The owners gained roughly a third more usable storage in the same footprint, and the scribed fillers read as intentional trim rather than gap-hiders.",
    details: [
      { label: "Location", value: "Boise Bench, Ada County" },
      { label: "Scope", value: "Perimeter + island, ~24 linear feet" },
      { label: "Door / finish", value: "Modern shaker, matte paint" },
      { label: "Timeline", value: "9 weeks design to install" },
      { label: "Budget band", value: "Mid $20,000s installed" },
    ],
    imageUrl: GALLERY_IMAGES.kitchen.after,
    imageAlt:
      "Custom shaker kitchen cabinets with quartz island installed in a Boise ranch home",
    links: [
      { label: "Kitchen cabinets", href: "/cabinets/kitchen" },
      { label: "Boise kitchen cabinet guide", href: "/guides/boise-kitchen-cabinet-guide" },
      { label: "Kitchen cabinet cost in Boise", href: "/blog/kitchen-cabinet-cost-boise" },
    ],
  },
  {
    slug: "meridian-primary-bath-vanity",
    title: "Primary Bath Vanity Transformation",
    city: "Meridian",
    serviceType: "Bathroom vanities",
    scope: "Builder-grade single vanity to a double vanity suite with linen tower",
    challenge:
      "A 2000s Meridian subdivision primary bath with a cultured-marble single vanity, one bank of shallow drawers, and two adults sharing one sink every morning. The room had the wall length for a double vanity but the plumbing for one.",
    approach:
      "The new layout ran a 72-inch double vanity with a drawer stack between sinks and a full-height linen tower at the end wall. Plumbing was extended for the second sink during a short rough-in window, and drawer interiors were configured for hair tools with in-drawer outlets. Finish and hardware matched the home's existing trim palette so the bath reads original to the house.",
    outcome:
      "A two-day installation following fabrication turned the morning bottleneck into a two-station bath with roughly triple the drawer storage. The linen tower eliminated the hallway closet shuffle entirely.",
    details: [
      { label: "Location", value: "Meridian, Ada County" },
      { label: "Scope", value: "72\" double vanity + linen tower" },
      { label: "Door / finish", value: "Shaker, painted" },
      { label: "Timeline", value: "6 weeks design to install" },
      { label: "Budget band", value: "Low-to-mid teens installed" },
    ],
    imageUrl: GALLERY_IMAGES.bathroom.after,
    imageAlt:
      "Double bathroom vanity with linen tower and organized drawers in a Meridian primary bath",
    links: [
      { label: "Bathroom vanities", href: "/cabinets/bathroom" },
      { label: "Boise bathroom vanity guide", href: "/guides/boise-bathroom-vanity-guide" },
      { label: "Vanity cost in Boise", href: "/blog/bathroom-vanity-cost-boise" },
    ],
  },
  {
    slug: "eagle-whole-home-program",
    title: "Whole-Home Cabinet Program",
    city: "Eagle",
    serviceType: "Whole-home cabinetry",
    scope: "Kitchen, two baths, mudroom, and office under one finish schedule",
    challenge:
      "An Eagle family wanted to replace piecemeal builder cabinetry across five rooms while living in the house, and to end up with one coherent palette instead of five mismatched vendor finishes accumulated over the years.",
    approach:
      "All selections locked once: a single door profile, a two-finish schedule (painted perimeter tones with a woodgrain accent), and one hardware family across every room. Fabrication batched together, and installation staged room by room, kitchen first on a temporary-kitchen plan, baths one at a time so a working bathroom always existed, then mudroom lockers and the office wall.",
    outcome:
      "The full program completed in under four months with the family home throughout. One finish schedule means every future touch-up and addition has a documented spec, and resale presentation reads designed, not assembled.",
    details: [
      { label: "Location", value: "Eagle, Ada County" },
      { label: "Scope", value: "5 rooms, one specification" },
      { label: "Door / finish", value: "Shaker, paint + woodgrain accent" },
      { label: "Timeline", value: "~16 weeks, staged by room" },
      { label: "Budget band", value: "Mid five figures installed" },
    ],
    imageUrl: GALLERY_IMAGES.wholeHome.after,
    imageAlt:
      "Coordinated whole-home custom cabinetry program in an Eagle, Idaho residence",
    links: [
      { label: "Whole-home cabinetry guide", href: "/guides/whole-home-cabinetry-guide" },
      { label: "Whole-home cabinet cost", href: "/blog/whole-home-cabinet-cost-boise" },
      { label: "Eagle cabinet guide", href: "/guides/eagle-cabinet-guide" },
    ],
  },
];
