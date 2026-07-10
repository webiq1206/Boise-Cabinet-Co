"use client";

import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  roomDimensionAccuracy,
  type RoomDimensionAccuracy,
} from "@/lib/design/roomScanGeometry";
import type { RoomMeta } from "@/lib/design/roomMeta";
import { scanCopy } from "@/shared/designStudioCopy";

function copyFor(accuracy: RoomDimensionAccuracy): string {
  switch (accuracy) {
    case "site-measure":
      return scanCopy.accuracySiteMeasure;
    case "estimated":
      return scanCopy.accuracyEstimated;
    case "planning-only":
      return scanCopy.accuracyPlanningOnly;
  }
}

export function RoomAccuracyNotice({ meta }: { meta: RoomMeta | null | undefined }) {
  if (!meta || meta.widthIn < 48 || meta.depthIn < 48) return null;

  const accuracy = roomDimensionAccuracy(meta);
  const isEstimate = accuracy !== "site-measure";

  return (
    <Alert
      variant={isEstimate ? "default" : "default"}
      className={
        isEstimate
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-accent/30 bg-accent/5"
      }
      data-testid={`room-accuracy-${accuracy}`}
    >
      {isEstimate ? (
        <AlertCircle className="h-4 w-4 text-amber-400" />
      ) : (
        <Info className="h-4 w-4 text-accent" />
      )}
      <AlertDescription className="text-sm">{copyFor(accuracy)}</AlertDescription>
    </Alert>
  );
}
