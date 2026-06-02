import { metersToInches, roomMetaToBounds, type RoomMeta } from "./roomMeta";

export interface ScanPoint3 {
  x: number;
  y: number;
  z: number;
}

/** Minimum floor corners for a rectangular room outline. */
export const SCAN_CORNERS_REQUIRED = 4;

export const SCAN_CORNER_LABELS = [
  "Back left",
  "Back right",
  "Front right",
  "Front left",
] as const;

/**
 * Build room dimensions from AR floor-corner points (metres, Y-up).
 * Uses axis-aligned bounding box on the floor plane.
 */
export function roomMetaFromScanPoints(
  points: ScanPoint3[],
  opts?: { ceilingIn?: number },
): RoomMeta | null {
  if (points.length < SCAN_CORNERS_REQUIRED) return null;

  const xs = points.map((p) => p.x);
  const zs = points.map((p) => p.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  const widthM = maxX - minX;
  const depthM = maxZ - minZ;
  if (widthM < 0.5 || depthM < 0.5) return null;

  const widthIn = metersToInches(widthM);
  const depthIn = metersToInches(depthM);

  return {
    widthIn: Math.max(48, Math.min(480, widthIn)),
    depthIn: Math.max(48, Math.min(480, depthIn)),
    ceilingIn: opts?.ceilingIn ?? 96,
    obstacles: [],
    userConfirmed: true,
    source: "ar-scan",
  };
}

/** Centre scan-derived bounds on origin for the 2D planner. */
export function boundsFromScanPoints(points: ScanPoint3[]) {
  const xs = points.map((p) => p.x);
  const zs = points.map((p) => p.z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const meta = roomMetaFromScanPoints(points);
  if (!meta) return null;
  const centredMeta: RoomMeta = {
    ...meta,
    scanPoints: points.map((p) => ({ x: p.x - cx, y: p.y, z: p.z - cz })),
  };
  const b = roomMetaToBounds(centredMeta);
  return {
    meta: centredMeta,
    roomBounds: b,
    /** Offset applied so room stays centred at origin. */
    centerOffset: { x: cx, z: cz },
  };
}

export function isScannedRoom(meta: RoomMeta | null | undefined): boolean {
  if (!meta?.userConfirmed || meta.widthIn < 48 || meta.depthIn < 48) return false;
  return (
    meta.source === "ar-scan" ||
    meta.source === "vision-scan" ||
    meta.source === "manual"
  );
}
