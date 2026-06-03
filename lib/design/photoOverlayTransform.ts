/** Persisted drag/scale state for RoomPhotoOverlay (percent-based). */

export interface PhotoOverlayTransform {
  xPct: number;
  yPct: number;
  scale: number;
  tilt: number;
  turn: number;
  opacity: number;
}

export const DEFAULT_PHOTO_OVERLAY_TRANSFORM: PhotoOverlayTransform = {
  xPct: 50,
  yPct: 64,
  scale: 0.7,
  tilt: 0,
  turn: 0,
  opacity: 0.95,
};

export function normalizePhotoOverlayTransform(
  raw: unknown,
): PhotoOverlayTransform | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const n = (k: string, fallback: number) =>
    typeof o[k] === "number" && Number.isFinite(o[k] as number)
      ? (o[k] as number)
      : fallback;
  return {
    xPct: n("xPct", DEFAULT_PHOTO_OVERLAY_TRANSFORM.xPct),
    yPct: n("yPct", DEFAULT_PHOTO_OVERLAY_TRANSFORM.yPct),
    scale: n("scale", DEFAULT_PHOTO_OVERLAY_TRANSFORM.scale),
    tilt: n("tilt", 0),
    turn: n("turn", 0),
    opacity: n("opacity", DEFAULT_PHOTO_OVERLAY_TRANSFORM.opacity),
  };
}
