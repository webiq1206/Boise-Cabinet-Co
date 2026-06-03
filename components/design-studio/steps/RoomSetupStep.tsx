"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RoomStep } from "./RoomStep";
import { RoomScanPanel } from "../RoomScanPanel";
import { useDesignStudio } from "../DesignStudioProvider";
import { wizardCopy } from "@/shared/designStudioCopy";

function applyFixtureRoom(
  updateDesign: ReturnType<typeof useDesignStudio>["updateDesign"],
  widthIn: number,
  depthIn: number,
  source: "ar-scan" | "manual" = "ar-scan",
) {
  const w = widthIn * 0.0254;
  const d = depthIn * 0.0254;
  updateDesign({
    roomMeta: {
      widthIn,
      depthIn,
      ceilingIn: 96,
      obstacles: [],
      userConfirmed: true,
      source,
      scanConfidence: source === "manual" ? "medium" : "high",
    },
    roomBounds: {
      minX: -w / 2,
      maxX: w / 2,
      minZ: -d / 2,
      maxZ: d / 2,
    },
  });
}

/** E2E/dev: ?fixtureScan=1 or ?fixtureManual=1 applies room size without AR. */
/** Pre-select room from ?roomType=kitchen (e.g. estimator handoff). */
function RoomTypeFromQuery() {
  const params = useSearchParams();
  const { design, updateDesign } = useDesignStudio();

  useEffect(() => {
    const rt = params.get("roomType");
    if (!rt || design.roomType) return;
    const allowed = ["kitchen", "bathroom", "laundry", "home-office", "closet", "mudroom"];
    if (allowed.includes(rt)) {
      updateDesign({ roomType: rt });
    }
  }, [params, design.roomType, updateDesign]);

  return null;
}

function ScanFixtureLoader() {
  const params = useSearchParams();
  const { design, updateDesign } = useDesignStudio();

  useEffect(() => {
    const fixtureScan = params.get("fixtureScan") === "1";
    const fixtureManual = params.get("fixtureManual") === "1";
    if (!fixtureScan && !fixtureManual) return;
    if (design.roomMeta && design.roomMeta.userConfirmed) return;

    const widthIn = 120;
    const depthIn = 144;
    applyFixtureRoom(
      updateDesign,
      widthIn,
      depthIn,
      fixtureManual ? "manual" : "ar-scan",
    );
  }, [params, design.roomMeta, updateDesign]);

  return null;
}

export function RoomSetupStep() {
  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <RoomTypeFromQuery />
        <ScanFixtureLoader />
      </Suspense>
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          {wizardCopy.roomSetupTitle.split(" ")[0]}{" "}
          <em className="brc-accent text-accent">room</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.roomSetupHint}</p>
      </div>
      <RoomStep showHeader={false} />
      <RoomScanPanel />
    </div>
  );
}
