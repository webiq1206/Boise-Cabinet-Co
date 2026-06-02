import type { RoomBounds } from "./previewConfig";

export type RoomWallId = "back" | "front" | "left" | "right";

export type ObstacleType = "window" | "door" | "appliance" | "column";

export interface RoomObstacle {
  id: string;
  type: ObstacleType;
  wall: RoomWallId;
  /** Distance from the wall's start corner, in inches. */
  offsetIn: number;
  widthIn: number;
  label?: string;
}

export type RoomDimensionSource =
  | "ar-scan"
  | "vision-scan"
  | "auto-layout"
  | "auto-fit"
  | "photo"
  | "manual";

/** Room dimensions (inches). Origin-centered bounds in metres. */
export interface RoomMeta {
  widthIn: number;
  depthIn: number;
  ceilingIn?: number;
  obstacles: RoomObstacle[];
  /** Ready for layout validation (set automatically or by user). */
  userConfirmed: boolean;
  /** How the size was determined — shown in UI for transparency. */
  source?: RoomDimensionSource;
  /** AR floor corner points (metres), persisted for reload. */
  scanPoints?: { x: number; y: number; z: number }[];
  /** Vision scan confidence when source is vision-scan. */
  scanConfidence?: "low" | "medium" | "high";
  /** Optional floor polygon vertices (metres, centred xz). */
  floorPolygon?: { x: number; z: number }[];
}

export const INCH_TO_M = 0.0254;

export function inchesToM(inches: number): number {
  return inches * INCH_TO_M;
}

export function metersToInches(meters: number): number {
  return Math.round(meters / INCH_TO_M);
}

/** Default starter room for a layout template before the user measures. */
export function defaultRoomMetaFromBounds(bounds: RoomBounds): RoomMeta {
  const widthIn = metersToInches(bounds.maxX - bounds.minX);
  const depthIn = metersToInches(bounds.maxZ - bounds.minZ);
  return {
    widthIn,
    depthIn,
    obstacles: [],
    userConfirmed: false,
    source: undefined,
  };
}

export function roomMetaToBounds(meta: RoomMeta): RoomBounds {
  const w = inchesToM(meta.widthIn);
  const d = inchesToM(meta.depthIn);
  return {
    minX: -w / 2,
    maxX: w / 2,
    minZ: -d / 2,
    maxZ: d / 2,
  };
}

export function hasUserRoomDimensions(meta: RoomMeta | null | undefined): boolean {
  return Boolean(
    meta?.userConfirmed && meta.widthIn >= 48 && meta.depthIn >= 48,
  );
}

/** Obstacle span along a wall in metres (room coordinate space). */
export function obstacleSpansOnWall(
  meta: RoomMeta,
  wall: RoomWallId,
  bounds: RoomBounds,
): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];
  for (const o of meta.obstacles) {
    if (o.wall !== wall || o.widthIn <= 0) continue;
    const off = inchesToM(o.offsetIn);
    const len = inchesToM(o.widthIn);
    if (wall === "back" || wall === "front") {
      const base = bounds.minX + off;
      spans.push({ start: base, end: base + len });
    } else {
      const base = bounds.minZ + off;
      spans.push({ start: base, end: base + len });
    }
  }
  return spans;
}

export function wallLengthIn(meta: RoomMeta, wall: RoomWallId): number {
  return wall === "back" || wall === "front" ? meta.widthIn : meta.depthIn;
}
