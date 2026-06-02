import type { LayoutSlug } from "@/shared/catalog/layouts";
import type { CabinetModule } from "./previewConfig";
import {
  buildAutoRoomMeta,
  expandRoomMetaToFitModules,
  inferObstaclesFromModules,
} from "./autoRoomSizing";
import { roomMetaToBounds, type RoomMeta } from "./roomMeta";
import { isScannedRoom } from "./roomScanGeometry";

export function syncRoomForModules(input: {
  layout: LayoutSlug | string | null;
  roomType: string | null;
  modules: CabinetModule[];
  roomMeta: RoomMeta | null;
}): { roomMeta: RoomMeta; roomBounds: ReturnType<typeof roomMetaToBounds> } {
  if (input.roomMeta && isScannedRoom(input.roomMeta)) {
    const meta = expandRoomMetaToFitModules(input.roomMeta, input.modules);
    const bounds = roomMetaToBounds(meta);
    const obstacles = inferObstaclesFromModules(input.modules, bounds);
    const finalMeta = { ...meta, obstacles };
    return { roomMeta: finalMeta, roomBounds: roomMetaToBounds(finalMeta) };
  }

  let meta =
    input.roomMeta ??
    buildAutoRoomMeta(input.layout, input.roomType, input.modules);

  if (meta.source !== "manual") {
    meta = expandRoomMetaToFitModules(meta, input.modules);
    const bounds = roomMetaToBounds(meta);
    meta = {
      ...meta,
      obstacles: inferObstaclesFromModules(input.modules, bounds),
    };
  } else {
    meta = expandRoomMetaToFitModules(meta, input.modules);
  }

  return { roomMeta: meta, roomBounds: roomMetaToBounds(meta) };
}
