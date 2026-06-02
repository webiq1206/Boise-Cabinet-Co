import type { LayoutSlug } from "@/shared/catalog/layouts";
import { typicalRoomInches } from "./autoRoomSizing";
import { detectIssues } from "./planAdvisor";
import { fitModulesIntoRoomBounds, modulesFitBounds } from "./fitModulesToRoom";
import { layoutToModules, type RoomBounds } from "./previewConfig";
import type { RoomMeta } from "./roomMeta";
import { isScannedRoom } from "./roomScanGeometry";
import { roomMetaToBounds } from "./roomMeta";

export interface LayoutFitResult {
  slug: LayoutSlug;
  fits: boolean;
  widthSlackIn: number;
  depthSlackIn: number;
  score: number;
}

/** Check if seeded + fitted modules fit scanned bounds without layout errors. */
export function layoutFitsScannedRoom(
  layout: LayoutSlug,
  roomMeta: RoomMeta,
  roomBounds: RoomBounds,
  roomType: string | null,
): boolean {
  const typical = typicalRoomInches(layout, roomType);
  if (roomMeta.widthIn < typical.widthIn - 6 || roomMeta.depthIn < typical.depthIn - 6) {
    return false;
  }
  const seeded = layoutToModules(layout);
  const fitted = fitModulesIntoRoomBounds(seeded, roomBounds);
  if (!modulesFitBounds(fitted, roomBounds)) return false;
  const errors = detectIssues(fitted, roomBounds, roomMeta).filter(
    (i) => i.severity === "error",
  );
  return errors.length === 0;
}

/** Rank layouts that fit inside a scanned room (larger slack = better). */
export function rankLayoutsForRoom(
  layouts: { slug: LayoutSlug }[],
  roomMeta: RoomMeta | null,
  roomType: string | null,
  roomBounds?: RoomBounds | null,
): LayoutFitResult[] {
  if (!roomMeta || !isScannedRoom(roomMeta)) {
    return layouts.map((l, i) => ({
      slug: l.slug,
      fits: true,
      widthSlackIn: 0,
      depthSlackIn: 0,
      score: -i,
    }));
  }

  const bounds = roomBounds ?? roomMetaToBounds(roomMeta);
  const { widthIn: scanW, depthIn: scanD } = roomMeta;

  return layouts
    .map((l) => {
      const typical = typicalRoomInches(l.slug, roomType);
      const widthSlackIn = scanW - typical.widthIn;
      const depthSlackIn = scanD - typical.depthIn;
      const templateOk = widthSlackIn >= -6 && depthSlackIn >= -6;
      const footprintOk = layoutFitsScannedRoom(l.slug, roomMeta, bounds, roomType);
      const fits = templateOk && footprintOk;
      const score = fits
        ? widthSlackIn + depthSlackIn + (typical.widthIn + typical.depthIn) * 0.01
        : widthSlackIn + depthSlackIn - 1000;
      return {
        slug: l.slug,
        fits,
        widthSlackIn,
        depthSlackIn,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}
