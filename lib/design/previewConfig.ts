import type { LayoutSlug } from "@/shared/catalog/layouts";
import { FINISH_BY_SLUG, resolveFinishSlug } from "@/shared/catalog/finishes";
import type { FinishCategory } from "@/shared/catalog/doorStyles";

export type ModuleFront = "door" | "drawers";

export type ApplianceType = "sink" | "range" | "refrigerator" | "dishwasher";

export interface CabinetModule {
  id: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  isWall?: boolean;
  front: ModuleFront;
  /** facing direction of the front, in radians around Y (0 = +Z) */
  facing?: number;
  /** optional appliance this module represents (kitchen layouts) */
  appliance?: ApplianceType;
}

export interface RoomBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface PreviewConfig {
  finishColor: string;
  finishCategory: FinishCategory;
  doorStyle: string;
  layout: LayoutSlug;
  modules: CabinetModule[];
}

const BASE_HEIGHT = 0.9;
const WALL_HEIGHT = 0.7;
const DEPTH = 0.6;

export function getFinishHex(finish: string | null): string {
  if (!finish) return "#F5F3EF";
  const catalogFinish = FINISH_BY_SLUG[finish] ?? FINISH_BY_SLUG[resolveFinishSlug(finish)];
  if (catalogFinish?.hexColor) return catalogFinish.hexColor;

  const legacy: Record<string, string> = {
    "white-oak-natural": "#D4A574",
    "white-oak-espresso": "#3D2314",
    "painted-white": "#F5F3EF",
    "painted-navy": "#1E293B",
  };
  return legacy[finish] ?? "#E8E4DF";
}

export function getFinishCategory(finish: string | null): FinishCategory {
  if (!finish) return "matte";
  const f = FINISH_BY_SLUG[finish] ?? FINISH_BY_SLUG[resolveFinishSlug(finish)];
  return f?.category ?? "matte";
}

function previewLayoutSlug(layout: LayoutSlug | null): LayoutSlug {
  if (!layout) return "l-shape";
  if (
    layout === "single-vanity" ||
    layout === "double-vanity" ||
    layout === "wall-run" ||
    layout === "floor-to-ceiling"
  ) {
    return layout === "double-vanity" ? "u-shape" : "l-shape";
  }
  return layout;
}

/** Raw module shape before id/front are assigned. */
type RawModule = Omit<CabinetModule, "id" | "front"> & { front?: ModuleFront };

function finalize(layout: LayoutSlug, raw: RawModule[]): CabinetModule[] {
  return raw.map((m, i) => {
    const front: ModuleFront =
      m.front ?? (!m.isWall && m.width >= 1.0 ? "drawers" : "door");
    return {
      ...m,
      front,
      id: `${layout}-${m.isWall ? "wall" : "base"}-${i}`,
    };
  });
}

export function layoutToModules(layout: LayoutSlug | null): CabinetModule[] {
  const previewLayout = previewLayoutSlug(layout);
  let raw: RawModule[];
  switch (previewLayout) {
    case "galley":
      raw = [
        { x: -1.8, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.1, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.4, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.3, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 1.0, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.1, z: 0.5, width: 1.2, height: BASE_HEIGHT, depth: DEPTH, facing: Math.PI },
        { x: -1.8, z: -0.5, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: -0.4, z: -0.5, width: 1.2, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: 1.0, z: -0.5, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
      break;
    case "u-shape":
      raw = [
        { x: -1.5, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.9, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.3, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.5, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: Math.PI / 2 },
        { x: -1.5, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: Math.PI / 2 },
        { x: 0.3, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.9, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.9, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: -Math.PI / 2 },
        { x: 0.9, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: -Math.PI / 2 },
        { x: -0.9, z: -0.6, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
      break;
    case "island":
      raw = [
        { x: -1.2, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.3, z: 0.2, width: 1.2, height: BASE_HEIGHT, depth: 0.9, front: "drawers", facing: Math.PI },
        { x: -0.6, z: -0.8, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
      break;
    case "peninsula":
      raw = [
        { x: -1.2, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: -Math.PI / 2 },
        { x: -0.6, z: -0.6, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
      break;
    case "l-shape":
    default:
      raw = [
        { x: -1.2, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.2, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: Math.PI / 2 },
        { x: -1.2, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH, facing: Math.PI / 2 },
        { x: -0.6, z: -0.6, width: 1.2, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: -1.2, z: 0, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true, facing: Math.PI / 2 },
      ];
      break;
  }
  const modules = finalize(previewLayout, raw);
  const isKitchen =
    layout != null &&
    ["galley", "l-shape", "u-shape", "island", "peninsula"].includes(layout);
  return isKitchen ? tagKitchenAppliances(modules) : modules;
}

/** Tag a couple of base modules as appliances so smart checks have anchors. */
function tagKitchenAppliances(mods: CabinetModule[]): CabinetModule[] {
  const bases = mods.filter((m) => !m.isWall).sort((a, b) => a.x - b.x);
  if (bases.length === 0) return mods;
  const sink = bases[Math.floor(bases.length / 2)];
  const range = bases[0] === sink ? bases[bases.length - 1] : bases[0];
  return mods.map((m) => {
    if (m === sink) return { ...m, appliance: "sink" as const, front: "door" as const };
    if (m === range) return { ...m, appliance: "range" as const };
    return m;
  });
}

export function buildPreviewConfig(
  layout: LayoutSlug | null,
  finish: string | null,
  doorStyle: string | null,
  modules?: CabinetModule[] | null,
): PreviewConfig {
  const resolvedLayout = previewLayoutSlug(layout);
  return {
    finishColor: getFinishHex(finish),
    finishCategory: getFinishCategory(finish),
    doorStyle: doorStyle ?? "slab",
    layout: resolvedLayout,
    // An explicit array (even empty) is the source of truth; only derive from
    // the layout when no module array is provided at all.
    modules: modules != null ? modules : layoutToModules(layout),
  };
}

/** Axis-aligned top-down footprint of a module, accounting for facing. */
export function moduleFootprint(m: CabinetModule) {
  const rotated = Math.abs(Math.sin(m.facing ?? 0)) > 0.5;
  const w = rotated ? m.depth : m.width;
  const d = rotated ? m.width : m.depth;
  return {
    w,
    d,
    x0: m.x - w / 2,
    x1: m.x + w / 2,
    z0: m.z - d / 2,
    z1: m.z + d / 2,
  };
}

/** Bounding room rectangle around a set of modules, with a small margin. */
export function computeRoomBounds(
  modules: CabinetModule[],
  margin = 0.14,
): RoomBounds {
  if (modules.length === 0) {
    return { minX: -2, maxX: 2, minZ: -1.6, maxZ: 1.6 };
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const m of modules) {
    const f = moduleFootprint(m);
    minX = Math.min(minX, f.x0);
    maxX = Math.max(maxX, f.x1);
    minZ = Math.min(minZ, f.z0);
    maxZ = Math.max(maxZ, f.z1);
  }
  return {
    minX: minX - margin,
    maxX: maxX + margin,
    minZ: minZ - margin,
    maxZ: maxZ + margin,
  };
}

export function moduleWidthInches(m: CabinetModule): number {
  return Math.round(m.width / 0.0254);
}

/** Short cabinet code/label for a module (e.g. B24, DB30, W36, SB33). */
export function cabinetCode(m: CabinetModule): string {
  const inches = moduleWidthInches(m);
  if (m.appliance === "sink") return `SB${inches}`;
  if (m.appliance === "range") return `Range ${inches}"`;
  if (m.appliance === "refrigerator") return "Fridge";
  if (m.appliance === "dishwasher") return "DW";
  if (m.isWall) return `W${inches}`;
  if (m.front === "drawers") return `DB${inches}`;
  return `B${inches}`;
}
