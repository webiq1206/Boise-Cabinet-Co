"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RoomScanPanel } from "../RoomScanPanel";
import { useDesignStudio } from "../DesignStudioProvider";

/** E2E/dev: ?fixtureScan=1 applies a 120×144 kitchen scan without AR. */
function ScanFixtureLoader() {
  const params = useSearchParams();
  const { design, updateDesign } = useDesignStudio();

  useEffect(() => {
    if (params.get("fixtureScan") !== "1") return;
    if (design.roomMeta && design.roomMeta.userConfirmed) return;

    const widthIn = 120;
    const depthIn = 144;
    const w = widthIn * 0.0254;
    const d = depthIn * 0.0254;
    updateDesign({
      roomMeta: {
        widthIn,
        depthIn,
        ceilingIn: 96,
        obstacles: [],
        userConfirmed: true,
        source: "ar-scan",
        scanConfidence: "high",
      },
      roomBounds: {
        minX: -w / 2,
        maxX: w / 2,
        minZ: -d / 2,
        maxZ: d / 2,
      },
    });
  }, [params, design.roomMeta, updateDesign]);

  return null;
}

export function ScanStep() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <ScanFixtureLoader />
      </Suspense>
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Scan your <em className="brc-accent text-accent">space</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          We use your real room size, not a generic layout guess, so cabinets and
          clearances match what you actually have.
        </p>
      </div>
      <RoomScanPanel />
    </div>
  );
}
