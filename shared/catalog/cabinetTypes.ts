/**
 * Cabinet type definitions, nomenclature, and standard dimension ranges.
 */

export type CabinetCategory = "base" | "wall" | "tall" | "vanity";

export interface DimensionRange {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minDepth: number;
  maxDepth: number;
  /** Standard increment for width in inches */
  widthIncrement: number;
  unit: "inches";
}

export interface NomenclaturePattern {
  /** Example code such as B24 or W3030 */
  example: string;
  /** Human-readable explanation of the pattern */
  pattern: string;
  /** Legend for each segment */
  segments: { label: string; meaning: string }[];
}

export interface CabinetType {
  id: string;
  slug: string;
  category: CabinetCategory;
  name: string;
  description: string;
  nomenclature: NomenclaturePattern;
  dimensions: DimensionRange;
  /** Typical use cases in Treasure Valley homes */
  typicalUses: string[];
}

export const CABINET_TYPES: CabinetType[] = [
  {
    id: "base",
    slug: "base",
    category: "base",
    name: "Base Cabinet",
    description:
      "Floor-mounted cabinets that support countertops. Standard height is 34-1/2 inches plus countertop thickness; depth accommodates plumbing at sink bases and pull-out accessories elsewhere.",
    nomenclature: {
      example: "B24",
      pattern: "B{width}",
      segments: [
        { label: "B", meaning: "Base cabinet" },
        { label: "24", meaning: "Width in inches" },
      ],
    },
    dimensions: {
      minWidth: 9,
      maxWidth: 48,
      minHeight: 34.5,
      maxHeight: 34.5,
      minDepth: 24,
      maxDepth: 24,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: [
      "Kitchen perimeter runs and islands",
      "Pantry lower sections",
      "Laundry folding bases",
      "Outdoor kitchen modules",
    ],
  },
  {
    id: "sink-base",
    slug: "sink-base",
    category: "base",
    name: "Sink Base",
    description:
      "Base cabinet with false drawer front and open interior for plumbing. Available in single- and double-bowl widths with optional tip-out trays and tilt-out sink trays.",
    nomenclature: {
      example: "SB36",
      pattern: "SB{width}",
      segments: [
        { label: "SB", meaning: "Sink base" },
        { label: "36", meaning: "Width in inches" },
      ],
    },
    dimensions: {
      minWidth: 24,
      maxWidth: 42,
      minHeight: 34.5,
      maxHeight: 34.5,
      minDepth: 24,
      maxDepth: 24,
      widthIncrement: 3,
      unit: "inches",
    },
    typicalUses: ["Kitchen sink stations", "Utility and laundry sinks", "Outdoor prep sinks"],
  },
  {
    id: "drawer-base",
    slug: "drawer-base",
    category: "base",
    name: "Drawer Base",
    description:
      "Base cabinet configured entirely as drawers, typically three equal drawers or one shallow plus two deep. Ideal for utensil storage and pot-and-pan drawers with heavy-duty slides.",
    nomenclature: {
      example: "DB24",
      pattern: "DB{width}",
      segments: [
        { label: "DB", meaning: "Drawer base" },
        { label: "24", meaning: "Width in inches" },
      ],
    },
    dimensions: {
      minWidth: 12,
      maxWidth: 36,
      minHeight: 34.5,
      maxHeight: 34.5,
      minDepth: 24,
      maxDepth: 24,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: ["Cooking zone drawer stacks", "Vanity grooming drawers", "Office file drawers"],
  },
  {
    id: "wall",
    slug: "wall",
    category: "wall",
    name: "Wall Cabinet",
    description:
      "Upper cabinets mounted to wall studs with adjustable hanging rails. Heights vary for standard 8-foot ceilings, soffit conditions, and stacked installations above refrigerators.",
    nomenclature: {
      example: "W3030",
      pattern: "W{width}{height}",
      segments: [
        { label: "W", meaning: "Wall cabinet" },
        { label: "30", meaning: "Width in inches" },
        { label: "30", meaning: "Height in inches" },
      ],
    },
    dimensions: {
      minWidth: 9,
      maxWidth: 48,
      minHeight: 12,
      maxHeight: 42,
      minDepth: 12,
      maxDepth: 15,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: [
      "Kitchen uppers and over-fridge units",
      "Bathroom medicine and linen uppers",
      "Garage overhead storage",
      "Entertainment center uppers",
    ],
  },
  {
    id: "tall",
    slug: "tall",
    category: "tall",
    name: "Tall / Pantry Cabinet",
    description:
      "Floor-to-ceiling or near-ceiling cabinets for pantries, oven towers, and broom closets. Heights align with 84-inch, 90-inch, or 96-inch kitchen elevations common in Treasure Valley tract and custom homes.",
    nomenclature: {
      example: "T1890",
      pattern: "T{width}{height}",
      segments: [
        { label: "T", meaning: "Tall cabinet" },
        { label: "18", meaning: "Width in inches" },
        { label: "90", meaning: "Height in inches" },
      ],
    },
    dimensions: {
      minWidth: 15,
      maxWidth: 36,
      minHeight: 84,
      maxHeight: 96,
      minDepth: 24,
      maxDepth: 24,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: [
      "Walk-in and reach-in pantries",
      "Oven and microwave towers",
      "Mudroom locker columns",
      "Linen closets",
    ],
  },
  {
    id: "vanity",
    slug: "vanity",
    category: "vanity",
    name: "Vanity Cabinet",
    description:
      "Shallower-depth base cabinets sized for bathrooms. Standard height is 31-1/2 inches for vessel sinks or 34-1/2 inches for undermount, configurable per bath design in your written scope.",
    nomenclature: {
      example: "V3621",
      pattern: "V{width}{depth}",
      segments: [
        { label: "V", meaning: "Vanity base" },
        { label: "36", meaning: "Width in inches" },
        { label: "21", meaning: "Depth in inches" },
      ],
    },
    dimensions: {
      minWidth: 18,
      maxWidth: 72,
      minHeight: 31.5,
      maxHeight: 34.5,
      minDepth: 18,
      maxDepth: 22,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: [
      "Primary double vanities",
      "Guest and powder room singles",
      "Makeup desks in closet suites",
    ],
  },
  {
    id: "vanity-linen",
    slug: "vanity-linen",
    category: "vanity",
    name: "Linen Tower",
    description:
      "Tall narrow cabinet paired with vanity bases for towel storage and toiletry organization. Typically 15–18 inches wide with adjustable interior shelves.",
    nomenclature: {
      example: "LT1584",
      pattern: "LT{width}{height}",
      segments: [
        { label: "LT", meaning: "Linen tower" },
        { label: "15", meaning: "Width in inches" },
        { label: "84", meaning: "Height in inches" },
      ],
    },
    dimensions: {
      minWidth: 12,
      maxWidth: 24,
      minHeight: 72,
      maxHeight: 90,
      minDepth: 18,
      maxDepth: 21,
      widthIncrement: 1,
      unit: "inches",
    },
    typicalUses: ["Primary bath towel storage", "Hall bath linen closets", "Pool bath storage"],
  },
];

export const CABINET_TYPE_BY_SLUG = Object.fromEntries(
  CABINET_TYPES.map((c) => [c.slug, c]),
) as Record<string, CabinetType>;

export const CABINET_TYPE_BY_ID = Object.fromEntries(
  CABINET_TYPES.map((c) => [c.id, c]),
) as Record<string, CabinetType>;

export const CABINET_TYPES_BY_CATEGORY = CABINET_TYPES.reduce(
  (acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  },
  {} as Record<CabinetCategory, CabinetType[]>,
);

/** Format a cabinet code from type and dimensions */
export function formatCabinetCode(
  type: CabinetType,
  width: number,
  secondaryDimension?: number,
): string {
  let code = type.nomenclature.pattern.replace("{width}", String(width));
  if (secondaryDimension != null) {
    code = code
      .replace("{height}", String(secondaryDimension))
      .replace("{depth}", String(secondaryDimension));
  }
  return code;
}
