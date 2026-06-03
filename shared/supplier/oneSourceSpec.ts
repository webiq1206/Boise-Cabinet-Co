/**
 * Verified One Source Cabinets construction and product specifications.
 * Source: onesourcecabinets.com, dealer documentation, Tafisa/Salt panel partners.
 *
 * Door styles: Slab, 3 Piece, Modern Shaker, Thin Shaker, Alpha Shaker, Beta Shaker.
 */

export const ONE_SOURCE_SUPPLIER = {
  name: "One Source Cabinets",
  website: "https://onesourcecabinets.com",
  panelPartners: ["Tafisa", "Salt International"] as const,
  facilities: ["Mesa, Arizona", "Colorado Springs, Colorado"],
} as const;

export type OneSourceDoorStyleId =
  | "slab"
  | "three-piece"
  | "modern-shaker"
  | "thin-shaker"
  | "alpha-shaker"
  | "beta-shaker";

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
    brcSlug: "three-piece",
    oscName: "3 Piece",
    verified: true,
    geometryPrompt:
      "three-piece cabinet door with horizontal grain center panel, frameless euro overlay",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "modern-shaker",
    oscName: "Modern Shaker",
    verified: true,
    geometryPrompt:
      "five-piece modern shaker cabinet door with square stiles and rails, flat recessed center panel",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "thin-shaker",
    oscName: "Thin Shaker",
    verified: true,
    geometryPrompt:
      "thin shaker cabinet door with narrow 1-inch stiles and rails, flat recessed center panel",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "alpha-shaker",
    oscName: "Alpha Shaker",
    verified: true,
    geometryPrompt:
      "mitered alpha shaker cabinet door, streamlined profile, horizontal grain slab drawer front",
    drawerFrontDefault: "slab",
  },
  {
    brcSlug: "beta-shaker",
    oscName: "Beta Shaker",
    verified: true,
    geometryPrompt:
      "mitered beta shaker cabinet door with radius center profile, flat center panel",
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
