import { metersToInches, roomMetaToBounds, type RoomMeta } from "./roomMeta";
import type { ScanPoint3 } from "./roomScanGeometry";
import type { RoomBounds } from "./previewConfig";

/** Minimum floor taps for an L/U outline (wall-run mode). */
export const WALL_SCAN_MIN_POINTS = 6;

export interface WallScanResult {
  meta: RoomMeta;
  roomBounds: RoomBounds;
  floorPolygon: { x: number; z: number }[];
}

/** Build centred bounds + polygon from ordered floor taps (metres). */
export function roomMetaFromWallPoints(
  points: ScanPoint3[],
  opts?: { ceilingIn?: number },
): WallScanResult | null {
  if (points.length < WALL_SCAN_MIN_POINTS) return null;

  const xs = points.map((p) => p.x);
  const zs = points.map((p) => p.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const widthM = maxX - minX;
  const depthM = maxZ - minZ;
  if (widthM < 0.5 || depthM < 0.5) return null;

  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;

  const widthIn = Math.max(48, Math.min(480, metersToInches(widthM)));
  const depthIn = Math.max(48, Math.min(480, metersToInches(depthM)));

  const meta: RoomMeta = {
    widthIn,
    depthIn,
    ceilingIn: opts?.ceilingIn ?? 96,
    obstacles: [],
    userConfirmed: true,
    source: "ar-scan",
    scanPoints: points.map((p) => ({ x: p.x, y: p.y, z: p.z })),
    floorPolygon: points.map((p) => ({ x: p.x - cx, z: p.z - cz })),
  };

  const b = roomMetaToBounds(meta);
  return {
    meta,
    roomBounds: {
      minX: b.minX,
      maxX: b.maxX,
      minZ: b.minZ,
      maxZ: b.maxZ,
    },
    floorPolygon: meta.floorPolygon!,
  };
}
