/**
 * Unit checks for scan geometry and layout fit (run: npm run verify:room-scan).
 */
import {
  boundsFromScanPoints,
  isScannedRoom,
  isUserMeasuredRoom,
  isAutoPlanningRoom,
  roomMetaFromScanPoints,
  SCAN_CORNERS_REQUIRED,
} from "../lib/design/roomScanGeometry";
import { rankLayoutsForRoom, layoutFitsScannedRoom } from "../lib/design/layoutFit";
import { roomMetaFromWallPoints, WALL_SCAN_MIN_POINTS } from "../lib/design/wallScanGeometry";
import { getLayoutsForRoom } from "../shared/catalog/layouts";
import { roomMetaToBounds } from "../lib/design/roomMeta";
import { SCAN_CORNER_USER_LABELS } from "../shared/designStudioCopy";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const corners = [
  { x: -1.9, y: 0, z: -1.65 },
  { x: 1.9, y: 0, z: -1.65 },
  { x: 1.9, y: 0, z: 1.65 },
  { x: -1.9, y: 0, z: 1.65 },
];

assert(corners.length === SCAN_CORNERS_REQUIRED, "fixture corners");
assert(
  SCAN_CORNER_USER_LABELS.length === SCAN_CORNERS_REQUIRED,
  "user-facing corner labels",
);

const meta = roomMetaFromScanPoints(corners);
assert(meta !== null && meta.widthIn >= 48, "roomMetaFromScanPoints");

const bounded = boundsFromScanPoints(corners);
assert(bounded !== null, "boundsFromScanPoints");
assert(
  bounded.meta.scanPoints?.length === SCAN_CORNERS_REQUIRED,
  "scanPoints persisted on meta",
);
assert(
  Math.abs(bounded.roomBounds.minX + bounded.roomBounds.maxX) < 0.01,
  "bounds centred on origin",
);

const wallPts = [
  ...corners,
  { x: -1.5, y: 0, z: 0 },
  { x: 0, y: 0, z: 1.2 },
];
const wall = roomMetaFromWallPoints(wallPts);
assert(wall !== null && (wall.meta.floorPolygon?.length ?? 0) >= WALL_SCAN_MIN_POINTS, "wall polygon");

const scanMeta = bounded.meta;
const bounds = bounded.roomBounds;
const layouts = getLayoutsForRoom("kitchen");
const ranked = rankLayoutsForRoom(layouts, scanMeta, "kitchen", bounds);
assert(ranked.length > 0, "rankLayoutsForRoom");
assert(ranked.some((r) => r.fits), "at least one layout fits 120x144 scan");

const top = ranked.find((r) => r.fits);
if (top) {
  assert(
    layoutFitsScannedRoom(top.slug, scanMeta, bounds, "kitchen"),
    "layoutFitsScannedRoom agrees with rank",
  );
}

const tinyMeta = {
  widthIn: 52,
  depthIn: 52,
  obstacles: [],
  userConfirmed: true,
  source: "ar-scan" as const,
};
const tinyBounds = roomMetaToBounds(tinyMeta);
const fitCount = rankLayoutsForRoom(layouts, tinyMeta, "kitchen", tinyBounds).filter(
  (r) => r.fits,
).length;
assert(fitCount === 0, "tiny room should block all layouts");

assert(isUserMeasuredRoom(tinyMeta), "ar-scan counts as user measured");
assert(
  !isScannedRoom({
    widthIn: 144,
    depthIn: 132,
    obstacles: [],
    userConfirmed: true,
    source: "auto-fit",
  }),
  "auto-fit must not pass wizard room gate",
);
assert(
  isAutoPlanningRoom({
    widthIn: 144,
    depthIn: 132,
    obstacles: [],
    userConfirmed: true,
    source: "auto-layout",
  }),
  "auto-layout is planning-only",
);

console.log("verify-room-scan: all checks passed");
