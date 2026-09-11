"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { RoomStep } from "./RoomStep";
import { RoomScanPanel } from "../RoomScanPanel";
import { useDesignStudio } from "../DesignStudioProvider";
import { presetsForRoomType } from "@/shared/roomSizePresets";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";

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
    // Keep in lockstep with the room picker (nav + estimator rooms).
    const allowed = [
      "kitchen",
      "bathroom",
      "laundry",
      "mudroom",
      "home-office",
      "entertainment",
      "built-ins",
      "pantry",
    ];
    if (!allowed.includes(rt)) return;
    updateDesign({ roomType: rt });

    // Pre-size the room from the estimator's linear feet of cabinetry (the wall
    // run is the dimension that drives how many cabinets fit). Depth falls back
    // to a typical size for the room. Marked as a planning estimate the visitor
    // can refine.
    const lfRaw = params.get("lf");
    const lf = lfRaw ? parseInt(lfRaw, 10) : NaN;
    if (!design.roomMeta && Number.isFinite(lf) && lf > 0) {
      const widthIn = Math.min(360, Math.max(72, lf * 12));
      const depthIn = presetsForRoomType(rt)[0]?.depthIn ?? 120;
      applyFixtureRoom(updateDesign, widthIn, depthIn, "manual");
    }
  }, [params, design.roomType, design.roomMeta, updateDesign]);

  return null;
}

function ScanFixtureLoader() {
  const params = useSearchParams();
  const { design, updateDesign } = useDesignStudio();

  useEffect(() => {
    const fixtureScan = params.get("fixtureScan") === "1";
    const fixtureManual = params.get("fixtureManual") === "1";
    if (!fixtureScan && !fixtureManual) return;
    if (!design.roomType) return;
    if (design.roomMeta && design.roomMeta.userConfirmed) return;

    const widthIn = 120;
    const depthIn = 144;
    applyFixtureRoom(
      updateDesign,
      widthIn,
      depthIn,
      fixtureManual ? "manual" : "ar-scan",
    );
  }, [params, design.roomType, design.roomMeta, updateDesign]);

  return null;
}

export function RoomSetupStep() {
  const { design } = useDesignStudio();
  const sizeRef = useRef<HTMLDivElement>(null);
  const prevRoomRef = useRef(design.roomType);

  // The Room step needs both a room type and a size before it can advance, so
  // picking a room can't auto-advance on its own. Instead, the moment a room is
  // chosen we smooth-scroll down to the size panel so the next action is obvious
  // (this is what makes clicking "Kitchen" visibly do something).
  useEffect(() => {
    const prev = prevRoomRef.current;
    prevRoomRef.current = design.roomType;
    if (prev === design.roomType || !design.roomType) return;
    if (isScannedRoom(design.roomMeta)) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    sizeRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }, [design.roomType, design.roomMeta]);

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <RoomTypeFromQuery />
        <ScanFixtureLoader />
      </Suspense>
      <RoomStep showHeader={false} />
      <div ref={sizeRef} className="scroll-mt-4">
        <RoomScanPanel />
      </div>
    </div>
  );
}
