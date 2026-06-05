"use client";

import { useCallback, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useDesignStudio } from "./DesignStudioProvider";
import { widthInFromPhotoWallTap } from "@/lib/design/photoRoomEstimate";
import { roomMetaFromPhotoSpan } from "@/lib/design/autoRoomSizing";
import { syncRoomForModules } from "@/lib/design/syncDesignRoom";

type Point = { x: number; y: number };

export function RoomPhotoQuickMeasure() {
  const { design, updateDesign } = useDesignStudio();
  const [tapPoints, setTapPoints] = useState<Point[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const applyMeta = useCallback(
    (widthIn: number, depthIn?: number) => {
      const meta = roomMetaFromPhotoSpan(
        design.roomMeta,
        design.layout,
        design.roomType,
        widthIn,
        depthIn,
      );
      const synced = syncRoomForModules({
        layout: design.layout,
        roomType: design.roomType,
        modules: design.modules,
        roomMeta: meta,
      });
      updateDesign(synced);
    },
    [design, updateDesign],
  );

  function onImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!design.photoUrl || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const next = [...tapPoints, { x }];
    setTapPoints(next);
    if (next.length < 2) return;

    const img = containerRef.current.querySelector("img");
    const imgW = img?.clientWidth ?? rect.width;
    const widthIn = widthInFromPhotoWallTap(
      next[0].x,
      next[1].x,
      imgW,
      design.layout,
      design.roomType,
    );
    applyMeta(widthIn);
    setTapPoints([]);
  }

  if (!design.photoUrl) return null;

  return (
    <div
      className="rounded-md border bg-muted/20 p-3 space-y-2"
      data-testid="photo-quick-measure"
    >
      <p className="text-sm font-medium flex items-center gap-2">
        <Camera className="h-4 w-4 text-accent" />
        Refine size from photo
      </p>
      <p className="text-xs text-muted-foreground">
        We automatically estimated room size from your photo. Optional: tap both
        ends of your back wall on the image below to refine width.
      </p>
      <div
        ref={containerRef}
        role="application"
        aria-label="Tap two points along your back wall to refine room width. Prefer the keyboard? Type exact sizes under 'I know my wall measurements'."
        tabIndex={0}
        className="relative rounded-md overflow-hidden border cursor-crosshair max-h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onImageClick}
        data-testid="photo-measure-target"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.photoUrl}
          alt="Room for measurement"
          className="w-full h-auto max-h-48 object-cover"
        />
        {tapPoints.map((p, i) => (
          <span
            key={i}
            className="absolute h-5 w-5 -ml-2.5 -mt-2.5 rounded-full bg-accent border-2 border-background shadow"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </div>
    </div>
  );
}
