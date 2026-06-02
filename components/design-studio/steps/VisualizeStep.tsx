"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useDesignStudio } from "../DesignStudioProvider";
import { RoomPhotoOverlay } from "../RoomPhotoOverlay";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPreviewConfig, getFinishHex } from "@/lib/design/previewConfig";
import { COLLECTION_BY_SLUG } from "@/shared/catalog/collections";
import { DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import { LAYOUT_BY_SLUG } from "@/shared/catalog/layouts";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import { Loader2 } from "lucide-react";

const CabinetPreview3D = dynamic(
  () => import("../CabinetPreview3D").then((m) => m.CabinetPreview3D),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video flex items-center justify-center bg-muted rounded-sm border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

function displayLabel(
  value: string | null | undefined,
  lookup: Record<string, { name: string } | undefined>,
): string {
  if (!value) return "—";
  return lookup[value]?.name ?? value.replace(/-/g, " ");
}

export function VisualizeStep() {
  const { design, updateDesign } = useDesignStudio();
  const [view, setView] = useState<"3d" | "photo">("3d");

  const previewConfig = useMemo(
    () => buildPreviewConfig(design.layout, design.finish, design.doorStyle),
    [design.layout, design.finish, design.doorStyle],
  );

  const finishHex = getFinishHex(design.finish);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Preview your <em className="brc-accent text-accent">design</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore your layout in 3D or overlay finishes on a photo of your room.
        </p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "3d" | "photo")}>
        <TabsList>
          <TabsTrigger value="3d">3D view</TabsTrigger>
          <TabsTrigger value="photo">Room photo</TabsTrigger>
        </TabsList>
        <TabsContent value="3d" className="mt-4">
          <CabinetPreview3D config={previewConfig} />
          <p className="text-xs text-muted-foreground mt-2">
            Drag to rotate · Scroll to zoom
          </p>
        </TabsContent>
        <TabsContent value="photo" className="mt-4">
          <RoomPhotoOverlay
            photoUrl={design.photoUrl}
            finishColor={finishHex}
            onPhotoChange={(url) => updateDesign({ photoUrl: url })}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-2 text-sm">
          <SummaryRow label="Room" value={displayLabel(design.roomType, ROOM_BY_SLUG)} />
          <SummaryRow label="Collection" value={displayLabel(design.collection, COLLECTION_BY_SLUG)} />
          <SummaryRow label="Layout" value={displayLabel(design.layout, LAYOUT_BY_SLUG)} />
          <SummaryRow label="Door style" value={displayLabel(design.doorStyle, DOOR_STYLE_BY_SLUG)} />
          <SummaryRow label="Finish" value={displayLabel(design.finish, FINISH_BY_SLUG)} />
          <SummaryRow label="Hardware" value={displayLabel(design.hardware, HARDWARE_BY_SLUG)} />
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
