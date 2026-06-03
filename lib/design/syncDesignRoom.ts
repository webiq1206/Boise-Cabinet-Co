import type { LayoutSlug } from "@/shared/catalog/layouts";
import type { CabinetModule } from "./previewConfig";
import {
  buildAutoRoomMeta,
  expandRoomMetaToFitModules,
  inferObstaclesFromModules,
} from "./autoRoomSizing";
import { roomMetaToBounds, type RoomMeta } from "./roomMeta";
import { isUserMeasuredRoom } from "./roomScanGeometry";

export function syncRoomForModules(input: {
  layout: LayoutSlug | string | null;
  roomType: string | null;
  modules: CabinetModule[];
  roomMeta: RoomMeta | null;
}): { roomMeta: RoomMeta; roomBounds: ReturnType<typeof roomMetaToBounds> } {
  if (input.roomMeta && isUserMeasuredRoom(input.roomMeta)) {
    const bounds = roomMetaToBounds(input.roomMeta);
    const obstacles =
      input.roomMeta.source === "manual"
        ? input.roomMeta.obstacles
        : inferObstaclesFromModules(input.modules, bounds);
    const finalMeta = { ...input.roomMeta, obstacles };
    return { roomMeta: finalMeta, roomBounds: bounds };
  }

  let meta =
    input.roomMeta ??
    buildAutoRoomMeta(input.layout, input.roomType, input.modules);

  if (meta.source === "manual") {
    return { roomMeta: meta, roomBounds: roomMetaToBounds(meta) };
  }

  meta = expandRoomMetaToFitModules(meta, input.modules);
  const bounds = roomMetaToBounds(meta);
  meta = {
    ...meta,
    obstacles: inferObstaclesFromModules(input.modules, bounds),
  };

  return { roomMeta: meta, roomBounds: roomMetaToBounds(meta) };
}
