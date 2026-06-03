"use client";

import { useMemo } from "react";
import { useDesignStudio } from "./DesignStudioProvider";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { metersToInches } from "@/lib/design/roomMeta";

const SCALE = 80;

export function ScannedRoomPreview({ className }: { className?: string }) {
  const { design } = useDesignStudio();
  const meta = design.roomMeta;

  const bounds = useMemo(
    () =>
      resolveRoomBounds(design.modules, design.roomBounds, design.roomMeta),
    [design.modules, design.roomBounds, design.roomMeta],
  );

  if (!meta || !isScannedRoom(meta)) {
    return (
      <div
        className={`rounded-md border bg-card aspect-[4/3] flex items-center justify-center p-6 text-center text-sm text-muted-foreground ${className ?? ""}`}
      >
        Add a room photo or size to see your floor plan here.
      </div>
    );
  }

  const w = (bounds.maxX - bounds.minX) * SCALE;
  const h = (bounds.maxZ - bounds.minZ) * SCALE;
  const poly = meta.floorPolygon;

  return (
    <div
      className={`rounded-md border bg-card overflow-hidden ${className ?? ""}`}
      data-testid="scanned-room-preview"
    >
      <div className="px-3 py-2 border-b text-xs text-muted-foreground">
        Scanned room, {meta.widthIn}&quot; × {meta.depthIn}&quot;
        {meta.source === "ar-scan" ? " (AR)" : " (photo)"}
      </div>
      <svg
        viewBox={`0 0 ${w + 40} ${h + 40}`}
        className="w-full aspect-[4/3] bg-muted/30"
      >
        <g transform="translate(20 20)">
          {poly && poly.length >= 3 ? (
            <polygon
              points={poly
                .map((p) => {
                  const px = (p.x - bounds.minX) * SCALE;
                  const pz = (p.z - bounds.minZ) * SCALE;
                  return `${px},${pz}`;
                })
                .join(" ")}
              fill="hsl(var(--accent) / 0.15)"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
            />
          ) : (
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill="hsl(var(--accent) / 0.12)"
              stroke="hsl(var(--foreground))"
              strokeOpacity={0.4}
              strokeWidth={2}
            />
          )}
          <text x={w / 2} y={h + 14} textAnchor="middle" fontSize={10} fill="currentColor">
            {meta.widthIn}&quot;
          </text>
          <text
            x={-8}
            y={h / 2}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            transform={`rotate(-90 -8 ${h / 2})`}
          >
            {meta.depthIn}&quot;
          </text>
        </g>
      </svg>
      <p className="px-3 py-2 text-xs text-muted-foreground border-t">
        Planner area ≈ {metersToInches(bounds.maxX - bounds.minX)}&quot; ×{" "}
        {metersToInches(bounds.maxZ - bounds.minZ)}&quot;, pick a layout next.
      </p>
    </div>
  );
}
