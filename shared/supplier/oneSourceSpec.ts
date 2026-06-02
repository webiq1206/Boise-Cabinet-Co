/**
 * Verified One Source Cabinets construction and product specifications.
 * Source: onesourcecabinets.com/about, dealer documentation, Tafisa/Salt panel partners.
 */

export const ONE_SOURCE_SUPPLIER = {
  name: "One Source Cabinets",
  website: "https://onesourcecabinets.com",
  panelPartners: ["Tafisa", "Salt International"] as const,
  facilities: ["Mesa, Arizona", "Colorado Springs, Colorado"],
} as const;

export type OneSourceDoorStyleId =
  | "slab"
  | "modern-shaker"
  | "thin-shaker"
  | "five-piece-shaker";

export interface OneSourceDoorStyleSpec {
  brcSlug: string;
  oscName: string;
  verified: boolean;
  geometryPrompt: string;
  drawerFrontDefault: "slab" | "five-piece";
}

/** Maps BRC door style slugs to One Source door profiles. */
export const ONE_SOURCE_DOOR_STYLES: OneSourceDoorStyleSpec[] = [
  {
    brcSlug: "slab",
    oscName: "Slab",
    verified: true,
    geometryPrompt:
      "flat slab cabinet door with no frame, clean square edges, 1-inch thick panel, frameless euro-style overlay",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "modern-shaker",
    oscName: "Modern Shaker",
    verified: true,
    geometryPrompt:
      "modern shaker cabinet door with 3/4 inch thick frame, 2-1/4 inch stiles and rails, 1/4 inch flat center panel reveal",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "thin-shaker",
    oscName: "Thin Shaker",
    verified: true,
    geometryPrompt:
      "thin shaker cabinet door with delicate 1-inch stiles and rails, 1/8 inch step-back flat center panel",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "three-piece",
    oscName: "5-Piece Shaker",
    verified: true,
    geometryPrompt:
      "five-piece shaker cabinet door with 3/4 inch frame, 1/4 inch flat center panel, cope-and-stick joinery",
    drawerFrontDefault: "five-piece",
  },
  {
    brcSlug: "alpha-shaker",
    oscName: "Alpha Shaker (Reserve)",
    verified: false,
    geometryPrompt:
      "shaker door with beveled inner frame and slightly raised center panel, 2-inch rails",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "beta-shaker",
    oscName: "Beta Shaker (Reserve)",
    verified: false,
    geometryPrompt:
      "shaker door with shadow-line groove between frame and panel, 2-inch rails",
    drawerFrontDefault: "slab",
  },
];

export const ONE_SOURCE_CONSTRUCTION = {
  boxStyle: "frameless euro-style",
  boxMaterial: "structural-grade plywood or fiberboard with PUR edge banding",
  doorThickness: '3/4"',
  shakerCenterPanel: '1/4"',
  sizingIncrement: '1/4"',
  drawerConstruction: "solid wood dovetail, 5/8 inch sides, soft-close glides",
  hingeType: "soft-close concealed hinges",
  warranty: "limited lifetime warranty for original homeowner",
} as const;

export const IMAGE_STYLE_SUFFIX =
  "Photorealistic architectural interior photography in a Treasure Valley Idaho home, natural window light, warm neutral design, shallow depth of field, no people, no text, no watermarks, no AI artifacts";

export function getDoorStyleSpec(brcSlug: string): OneSourceDoorStyleSpec | undefined {
  return ONE_SOURCE_DOOR_STYLES.find((d) => d.brcSlug === brcSlug);
}

export function buildDoorPrompt(brcSlug: string): string {
  const spec = getDoorStyleSpec(brcSlug);
  if (!spec) return "frameless custom cabinet doors";
  return spec.geometryPrompt;
}
