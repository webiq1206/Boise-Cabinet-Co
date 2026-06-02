import {
  computeRoomBounds,
  type CabinetModule,
  type RoomBounds,
} from "./previewConfig";
import {
  hasUserRoomDimensions,
  roomMetaToBounds,
  type RoomMeta,
} from "./roomMeta";

/**
 * Single source for planner / validation bounds.
 * User-measured room wins; else persisted roomBounds; else module envelope.
 */
export function resolveRoomBounds(
  modules: CabinetModule[],
  roomBounds: RoomBounds | null,
  roomMeta: RoomMeta | null,
): RoomBounds {
  if (hasUserRoomDimensions(roomMeta)) {
    return roomMetaToBounds(roomMeta!);
  }
  if (roomBounds) return roomBounds;
  return computeRoomBounds(modules);
}
