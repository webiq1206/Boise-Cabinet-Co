import type { LayoutSlug } from "@/shared/catalog/layouts";
import {
  computeRoomBounds,
  moduleFootprint,
  type CabinetModule,
  type RoomBounds,
} from "./previewConfig";
import { inchesToM, metersToInches, roomMetaToBounds } from "./roomMeta";

import type { RoomDimensionSource, RoomMeta, RoomObstacle, RoomWallId } from "./roomMeta";

/** Typical wall-to-wall sizes (inches) for Treasure Valley homes by layout. */
const TYPICAL_ROOM_IN: Record<
  string,
  { widthIn: number; depthIn: number; ceilingIn: number }
> = {
  galley: { widthIn: 120, depthIn: 132, ceilingIn: 96 },
  "l-shape": { widthIn: 144, depthIn: 132, ceilingIn: 96 },
  "u-shape": { widthIn: 156, depthIn: 144, ceilingIn: 96 },
  island: { widthIn: 168, depthIn: 156, ceilingIn: 96 },
  peninsula: { widthIn: 156, depthIn: 132, ceilingIn: 96 },
  "single-vanity": { widthIn: 96, depthIn: 84, ceilingIn: 96 },
  "double-vanity": { widthIn: 120, depthIn: 84, ceilingIn: 96 },
  "wall-run": { widthIn: 108, depthIn: 96, ceilingIn: 96 },
  "floor-to-ceiling": { widthIn: 120, depthIn: 96, ceilingIn: 96 },
};

const ROOM_DEFAULTS: Record<string, { widthIn: number; depthIn: number }> = {
  kitchen: { widthIn: 144, depthIn: 132 },
  "wet-bar": { widthIn: 120, depthIn: 108 },
  bathroom: { widthIn: 96, depthIn: 84 },
  laundry: { widthIn: 108, depthIn: 96 },
  mudroom: { widthIn: 108, depthIn: 96 },
  closet: { widthIn: 120, depthIn: 96 },
  garage: { widthIn: 240, depthIn: 168 },
};

function nearestWall(
  m: CabinetModule,
  bounds: RoomBounds,
): RoomWallId | null {
  const f = moduleFootprint(m);
  const dBack = f.z0 - bounds.minZ;
  const dFront = bounds.maxZ - f.z1;
  const dLeft = f.x0 - bounds.minX;
  const dRight = bounds.maxX - f.x1;
  const min = Math.min(dBack, dFront, dLeft, dRight);
  if (min > 0.25) return null;
  if (min === dBack) return "back";
  if (min === dFront) return "front";
  if (min === dLeft) return "left";
  return "right";
}

/** Place obstacles for existing appliances along their wall (automated). */
export function inferObstaclesFromModules(
  modules: CabinetModule[],
  bounds: RoomBounds,
): RoomObstacle[] {
  const obstacles: RoomObstacle[] = [];
  const applianceWidth: Record<string, number> = {
    sink: 36,
    range: 30,
    refrigerator: 36,
    dishwasher: 24,
  };

  for (const m of modules) {
    if (!m.appliance) continue;
    const wall = nearestWall(m, bounds);
    if (!wall) continue;
    const f = moduleFootprint(m);
    const widthIn = applianceWidth[m.appliance] ?? metersToInches(m.width);
    let offsetIn = 0;
    if (wall === "back" || wall === "front") {
      offsetIn = metersToInches(f.x0 - bounds.minX);
    } else {
      offsetIn = metersToInches(f.z0 - bounds.minZ);
    }
    obstacles.push({
      id: `auto-${m.appliance}-${m.id}`,
      type: "appliance",
      wall,
      offsetIn: Math.max(0, offsetIn),
      widthIn,
      label: m.appliance,
    });
  }
  return obstacles;
}

export function typicalRoomInches(
  layout: LayoutSlug | string | null,
  roomType: string | null,
): { widthIn: number; depthIn: number; ceilingIn: number } {
  if (layout && TYPICAL_ROOM_IN[layout]) {
    return TYPICAL_ROOM_IN[layout];
  }
  const room = roomType && ROOM_DEFAULTS[roomType];
  if (room) {
    return { ...room, ceilingIn: 96 };
  }
  return { widthIn: 144, depthIn: 132, ceilingIn: 96 };
}

/** Build a ready-to-validate room from layout + seeded modules (no user clicks). */
export function buildAutoRoomMeta(
  layout: LayoutSlug | string | null,
  roomType: string | null,
  modules: CabinetModule[],
): RoomMeta {
  const typical = typicalRoomInches(layout, roomType);
  const moduleBounds = computeRoomBounds(modules, 0.08);
  const needW = metersToInches(moduleBounds.maxX - moduleBounds.minX);
  const needD = metersToInches(moduleBounds.maxZ - moduleBounds.minZ);

  const widthIn = Math.max(typical.widthIn, needW + 6);
  const depthIn = Math.max(typical.depthIn, needD + 6);
  const bounds = roomMetaToBounds({
    widthIn,
    depthIn,
    ceilingIn: typical.ceilingIn,
    obstacles: [],
    userConfirmed: true,
    source: "auto-layout",
  });

  return {
    widthIn,
    depthIn,
    ceilingIn: typical.ceilingIn,
    obstacles: inferObstaclesFromModules(modules, bounds),
    userConfirmed: true,
    source: "auto-layout",
  };
}

/** Grow room size when the user adds or resizes cabinets past the current box. */
export function expandRoomMetaToFitModules(
  meta: RoomMeta,
  modules: CabinetModule[],
  marginIn = 6,
): RoomMeta {
  if (modules.length === 0) return meta;
  const marginM = inchesToM(marginIn);
  const moduleBounds = computeRoomBounds(modules, marginM);
  const needW = metersToInches(moduleBounds.maxX - moduleBounds.minX);
  const needD = metersToInches(moduleBounds.maxZ - moduleBounds.minZ);
  const widthIn = Math.max(meta.widthIn, needW);
  const depthIn = Math.max(meta.depthIn, needD);
  const changed = widthIn !== meta.widthIn || depthIn !== meta.depthIn;
  const bounds = roomMetaToBounds({ ...meta, widthIn, depthIn });
  const obstacles =
    meta.source === "manual"
      ? meta.obstacles
      : inferObstaclesFromModules(modules, bounds);

  return {
    ...meta,
    widthIn,
    depthIn,
    obstacles,
    userConfirmed: true,
    source: changed && meta.source === "auto-layout" ? "auto-fit" : meta.source ?? "auto-fit",
  };
}

/** Apply photo tap span as room width; keep or derive depth from layout ratio. */
export function roomMetaFromPhotoSpan(
  prev: RoomMeta | null,
  layout: LayoutSlug | string | null,
  roomType: string | null,
  widthIn: number,
  depthIn?: number,
): RoomMeta {
  const typical = typicalRoomInches(layout, roomType);
  const ratio = typical.depthIn / typical.widthIn;
  const w = Math.round(Math.max(48, widthIn));
  const d = Math.round(
    depthIn ?? Math.max(48, w * ratio),
  );
  return {
    widthIn: w,
    depthIn: d,
    ceilingIn: prev?.ceilingIn ?? typical.ceilingIn,
    obstacles: prev?.obstacles ?? [],
    userConfirmed: true,
    source: "photo",
  };
}
