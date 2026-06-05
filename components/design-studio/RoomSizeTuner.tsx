"use client";

import { Button } from "@/components/ui/button";
import type { RoomBounds } from "@/lib/design/previewConfig";
import type { RoomMeta } from "@/lib/design/roomMeta";
import { scanCopy } from "@/shared/designStudioCopy";

function clampDim(n: number): number {
  return Math.max(48, Math.min(480, Math.round(n)));
}

export function RoomSizeTuner({
  roomMeta,
  onApply,
}: {
  roomMeta: RoomMeta;
  onApply: (meta: RoomMeta, bounds: RoomBounds) => void;
}) {
  function scaleRoom(factor: number) {
    const widthIn = clampDim(roomMeta.widthIn * factor);
    const depthIn = clampDim(roomMeta.depthIn * factor);
    const next: RoomMeta = {
      ...roomMeta,
      widthIn,
      depthIn,
      userConfirmed: true,
      source: roomMeta.source ?? "vision-scan",
    };
    const wm = widthIn * 0.0254;
    const dm = depthIn * 0.0254;
    onApply(next, {
      minX: -wm / 2,
      maxX: wm / 2,
      minZ: -dm / 2,
      maxZ: dm / 2,
    });
  }

  return (
    <div className="space-y-2" data-testid="room-size-tuner">
      <p className="text-sm font-medium">{scanCopy.tunerTitle}</p>
      <p className="text-xs text-muted-foreground">{scanCopy.tunerHint}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => scaleRoom(0.92)}
          data-testid="button-room-smaller"
        >
          {scanCopy.tunerSmaller}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={() => scaleRoom(1.08)}
          data-testid="button-room-larger"
        >
          {scanCopy.tunerLarger}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {scanCopy.tunerCurrent(roomMeta.widthIn, roomMeta.depthIn)}
      </p>
    </div>
  );
}
