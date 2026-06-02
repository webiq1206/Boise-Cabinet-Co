"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDesignStudio } from "./DesignStudioProvider";
import { RoomPhotoQuickMeasure } from "./RoomPhotoQuickMeasure";
import { metersToInches, type RoomMeta } from "@/lib/design/roomMeta";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { syncRoomForModules } from "@/lib/design/syncDesignRoom";

const SOURCE_LABEL: Record<string, string> = {
  "ar-scan": "Measured with AR floor scan",
  "vision-scan": "Estimated from room photo",
  "auto-layout": "Set automatically for your layout",
  "auto-fit": "Expanded automatically to fit your cabinets",
  photo: "Estimated from your room photo",
  manual: "Custom size",
};

function parseInches(raw: string, fallback: number): number {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function RoomDimensionsForm({ className }: { className?: string }) {
  const { design, updateDesign } = useDesignStudio();
  const bounds = resolveRoomBounds(
    design.modules,
    design.roomBounds,
    design.roomMeta,
  );
  const meta = design.roomMeta;

  const [open, setOpen] = useState(false);
  const [widthStr, setWidthStr] = useState(String(meta?.widthIn ?? 144));
  const [depthStr, setDepthStr] = useState(String(meta?.depthIn ?? 132));
  const [ceilingStr, setCeilingStr] = useState(
    meta?.ceilingIn ? String(meta.ceilingIn) : "",
  );

  useEffect(() => {
    if (!meta) return;
    setWidthStr(String(meta.widthIn));
    setDepthStr(String(meta.depthIn));
    setCeilingStr(meta.ceilingIn ? String(meta.ceilingIn) : "");
  }, [meta?.widthIn, meta?.depthIn, meta?.ceilingIn]);

  function applyManual(partial: {
    widthIn?: number;
    depthIn?: number;
    ceilingIn?: number;
  }) {
    if (!meta) return;
    const next: RoomMeta = {
      ...meta,
      widthIn: partial.widthIn ?? meta.widthIn,
      depthIn: partial.depthIn ?? meta.depthIn,
      ceilingIn: partial.ceilingIn ?? meta.ceilingIn,
      userConfirmed: true,
      source: "manual",
    };
    const synced = syncRoomForModules({
      layout: design.layout,
      roomType: design.roomType,
      modules: design.modules,
      roomMeta: next,
    });
    updateDesign(synced);
  }

  if (!meta) return null;

  if (meta.source === "ar-scan" || meta.source === "vision-scan") {
    return null;
  }

  return (
    <div className={className} data-testid="room-dimensions-form">
      <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 p-3">
        <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Room size applied automatically</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {meta.widthIn}&quot; × {meta.depthIn}&quot;
            {meta.ceilingIn ? `, ${meta.ceilingIn}" ceiling` : ""} , {" "}
            {SOURCE_LABEL[meta.source ?? "auto-layout"] ?? "Ready for layout checks"}.
            Appliance zones are marked automatically. The room expands when you
            add or resize cabinets.
          </p>
        </div>
      </div>

      <RoomPhotoQuickMeasure />

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-between"
            data-testid="button-adjust-room-toggle"
          >
            Adjust room size manually
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="room-width-in">Width (in)</Label>
              <Input
                id="room-width-in"
                type="number"
                min={48}
                max={480}
                value={widthStr}
                onChange={(e) => {
                  setWidthStr(e.target.value);
                  applyManual({ widthIn: parseInches(e.target.value, meta.widthIn) });
                }}
                data-testid="input-room-width"
              />
            </div>
            <div>
              <Label htmlFor="room-depth-in">Depth (in)</Label>
              <Input
                id="room-depth-in"
                type="number"
                min={48}
                max={480}
                value={depthStr}
                onChange={(e) => {
                  setDepthStr(e.target.value);
                  applyManual({ depthIn: parseInches(e.target.value, meta.depthIn) });
                }}
                data-testid="input-room-depth"
              />
            </div>
            <div>
              <Label htmlFor="room-ceiling-in">Ceiling (in)</Label>
              <Input
                id="room-ceiling-in"
                type="number"
                min={84}
                max={144}
                placeholder="96"
                value={ceilingStr}
                onChange={(e) => {
                  setCeilingStr(e.target.value);
                  applyManual({
                    ceilingIn: e.target.value
                      ? parseInches(e.target.value, 96)
                      : meta.ceilingIn,
                  });
                }}
                data-testid="input-room-ceiling"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Planner outline: ~{metersToInches(bounds.maxX - bounds.minX)}&quot; ×{" "}
            {metersToInches(bounds.maxZ - bounds.minZ)}&quot;
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
