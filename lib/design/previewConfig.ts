import type { LayoutSlug } from "@/shared/catalog/layouts";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";

export interface CabinetModule {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  isWall?: boolean;
}

export interface PreviewConfig {
  finishColor: string;
  doorStyle: string;
  layout: LayoutSlug;
  modules: CabinetModule[];
}

const BASE_HEIGHT = 0.9;
const WALL_HEIGHT = 0.7;
const WALL_Y = 1.5;
const DEPTH = 0.6;

export function getFinishHex(finish: string | null): string {
  if (!finish) return "#F5F3EF";
  const catalogFinish = FINISH_BY_SLUG[finish];
  if (catalogFinish?.hexColor) return catalogFinish.hexColor;

  const legacy: Record<string, string> = {
    "white-oak-natural": "#D4A574",
    "white-oak-espresso": "#3D2314",
    "painted-white": "#F5F3EF",
    "painted-navy": "#1E293B",
  };
  return legacy[finish] ?? "#E8E4DF";
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

export function layoutToModules(layout: LayoutSlug | null): CabinetModule[] {
  const previewLayout = previewLayoutSlug(layout);
  switch (previewLayout) {
    case "galley":
      return [
        { x: -1.8, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.1, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.4, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.3, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 1.0, z: -0.5, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.1, z: 0.5, width: 1.2, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.8, z: -0.5, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: -0.4, z: -0.5, width: 1.2, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: 1.0, z: -0.5, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
    case "u-shape":
      return [
        { x: -1.5, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.9, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.3, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.5, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.5, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.3, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.9, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.9, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.9, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.9, z: -0.6, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
    case "island":
      return [
        { x: -1.2, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: -0.8, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.3, z: 0.2, width: 1.2, height: BASE_HEIGHT, depth: 0.9 },
        { x: -0.6, z: -0.8, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
    case "peninsula":
      return [
        { x: -1.2, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0.6, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 1.8, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
    case "l-shape":
    default:
      return [
        { x: -1.2, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: 0, z: -0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.2, z: 0, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -1.2, z: 0.6, width: 0.6, height: BASE_HEIGHT, depth: DEPTH },
        { x: -0.6, z: -0.6, width: 1.2, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
        { x: -1.2, z: 0, width: 0.6, height: WALL_HEIGHT, depth: DEPTH, isWall: true },
      ];
  }
}

export function buildPreviewConfig(
  layout: LayoutSlug | null,
  finish: string | null,
  doorStyle: string | null,
): PreviewConfig {
  const resolvedLayout = previewLayoutSlug(layout);
  return {
    finishColor: getFinishHex(finish),
    doorStyle: doorStyle ?? "slab",
    layout: resolvedLayout,
    modules: layoutToModules(layout),
  };
}
