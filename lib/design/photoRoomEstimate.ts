import type { LayoutSlug } from "@/shared/catalog/layouts";
import { typicalRoomInches } from "./autoRoomSizing";
import type { RoomMeta } from "./roomMeta";

/** Heuristic room size from photo proportions + layout defaults (zero taps). */
export function estimateRoomFromPhotoAspect(
  imageWidth: number,
  imageHeight: number,
  layout: LayoutSlug | string | null,
  roomType: string | null,
  prev: RoomMeta | null,
): RoomMeta {
  const typical = typicalRoomInches(layout, roomType);
  const photoAspect = imageWidth / Math.max(imageHeight, 1);
  const roomAspect = typical.widthIn / typical.depthIn;

  let widthIn = typical.widthIn;
  let depthIn = typical.depthIn;

  if (photoAspect > roomAspect * 1.08) {
    widthIn = Math.round(typical.widthIn * (photoAspect / roomAspect));
  } else if (photoAspect < roomAspect * 0.92) {
    depthIn = Math.round(typical.depthIn * (roomAspect / photoAspect));
  }

  widthIn = Math.max(48, Math.min(480, widthIn));
  depthIn = Math.max(48, Math.min(480, depthIn));

  return {
    widthIn,
    depthIn,
    ceilingIn: prev?.ceilingIn ?? typical.ceilingIn,
    obstacles: prev?.obstacles ?? [],
    userConfirmed: true,
    source: "vision-scan",
    scanConfidence: "medium",
  };
}

/** Client-side fallback when /api/design-studio/scan-room is unavailable. */
export function estimateRoomFromDataUrl(
  dataUrl: string,
  roomType: string | null,
  layout: LayoutSlug | string | null = null,
): Promise<RoomMeta> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(
        estimateRoomFromPhotoAspect(
          img.naturalWidth,
          img.naturalHeight,
          layout,
          roomType,
          null,
        ),
      );
    };
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = dataUrl;
  });
}

/** Refine width from two taps on the back wall in image coordinates. */
export function widthInFromPhotoWallTap(
  x1: number,
  x2: number,
  imageWidth: number,
  layout: LayoutSlug | string | null,
  roomType: string | null,
): number {
  const typical = typicalRoomInches(layout, roomType);
  const spanPx = Math.abs(x2 - x1);
  const refSpan = imageWidth * 0.72;
  const scale = typical.widthIn / refSpan;
  return Math.max(48, Math.min(480, Math.round(spanPx * scale)));
}
