"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { RoomPhotoOverlay } from "../RoomPhotoOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { getFinishHex } from "@/lib/design/previewConfig";
import { COLLECTION_BY_SLUG } from "@/shared/catalog/collections";
import { DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import { LAYOUT_BY_SLUG } from "@/shared/catalog/layouts";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";

function displayLabel(
  value: string | null | undefined,
  lookup: Record<string, { name: string } | undefined>,
): string {
  if (!value) return "—";
  return lookup[value]?.name ?? value.replace(/-/g, " ");
}

export function VisualizeStep() {
  const { design, updateDesign } = useDesignStudio();
  const finishHex = getFinishHex(design.finish);
  const customizedCount = Object.keys(design.moduleOverrides).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Preview your <em className="brc-accent text-accent">design</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Use the live 3D preview to spin, walk around, and tap individual cabinets to
          customize them. Or overlay your finish on a photo of your room below.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Overlay on a room photo</p>
        <RoomPhotoOverlay
          photoUrl={design.photoUrl}
          finishColor={finishHex}
          onPhotoChange={(url) => updateDesign({ photoUrl: url })}
        />
      </div>

      <Card>
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-2 text-sm">
          <SummaryRow label="Room" value={displayLabel(design.roomType, ROOM_BY_SLUG)} />
          <SummaryRow label="Collection" value={displayLabel(design.collection, COLLECTION_BY_SLUG)} />
          <SummaryRow label="Layout" value={displayLabel(design.layout, LAYOUT_BY_SLUG)} />
          <SummaryRow label="Door style" value={displayLabel(design.doorStyle, DOOR_STYLE_BY_SLUG)} />
          <SummaryRow label="Finish" value={displayLabel(design.finish, FINISH_BY_SLUG)} />
          <SummaryRow label="Hardware" value={displayLabel(design.hardware, HARDWARE_BY_SLUG)} />
          {customizedCount > 0 && (
            <SummaryRow
              label="Custom cabinets"
              value={`${customizedCount} cabinet${customizedCount === 1 ? "" : "s"} customized`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-dashed last:border-0">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
