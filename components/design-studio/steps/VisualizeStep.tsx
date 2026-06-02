"use client";

import { useMemo } from "react";
import { useDesignStudio } from "../DesignStudioProvider";
import { RoomPhotoOverlay } from "../RoomPhotoOverlay";
import { ARLauncher } from "../ARLauncher";
import { PlanIssuesPanel } from "../PlanIssuesPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getFinishHex } from "@/lib/design/previewConfig";
import { detectIssues, getRecommendations } from "@/lib/design/planAdvisor";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { hasUserRoomDimensions } from "@/lib/design/roomMeta";
import {
  buildFloorPlanSvg,
  downloadFloorPlanSvg,
} from "@/lib/design/floorPlanExport";
import {
  buildFloorPlanPdf,
  downloadFloorPlanPdf,
} from "@/lib/design/floorPlanPdf";
import { COLLECTION_BY_SLUG } from "@/shared/catalog/collections";
import { DOOR_STYLE_BY_SLUG } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { ROOM_BY_SLUG } from "@/shared/catalog/roomCategories";
import { LAYOUT_BY_SLUG } from "@/shared/catalog/layouts";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import { Info, Download } from "lucide-react";

function displayLabel(
  value: string | null | undefined,
  lookup: Record<string, { name: string } | undefined>,
): string {
  if (!value) return "—";
  return lookup[value]?.name ?? value.replace(/-/g, " ");
}

export function VisualizeStep() {
  const { design, setModules, updateDesign } = useDesignStudio();
  const finishHex = getFinishHex(design.finish);
  const customizedCount = Object.keys(design.moduleOverrides).length;
  const bounds = resolveRoomBounds(
    design.modules,
    design.roomBounds,
    design.roomMeta,
  );

  const issues = useMemo(
    () => detectIssues(design.modules, bounds, design.roomMeta),
    [design.modules, bounds, design.roomMeta],
  );
  const recommendations = useMemo(
    () =>
      getRecommendations(
        design.modules,
        design.roomType,
        design.accessories,
      ),
    [design.modules, design.roomType, design.accessories],
  );

  const roomDimsSet = hasUserRoomDimensions(design.roomMeta);

  function exportPlanSvg() {
    const svg = buildFloorPlanSvg({
      modules: design.modules,
      bounds,
      roomMeta: design.roomMeta,
      designName: design.designName,
    });
    downloadFloorPlanSvg(
      svg,
      `${(design.designName || "cabinet-layout").replace(/\s+/g, "-")}.svg`,
    );
  }

  async function exportPlanPdf() {
    const bytes = await buildFloorPlanPdf({
      modules: design.modules,
      bounds,
      roomMeta: design.roomMeta,
      designName: design.designName,
    });
    downloadFloorPlanPdf(
      bytes,
      `${(design.designName || "cabinet-layout").replace(/\s+/g, "-")}.pdf`,
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Preview your <em className="brc-accent text-accent">design</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Use the live 3D preview to explore finishes and cabinet sizes. AR and
          photo overlay help you visualize — they do not scan or measure your
          room.
        </p>
      </div>

      {design.photoUrl && design.roomMeta?.source === "photo" && (
        <Alert data-testid="alert-room-photo-sized">
          <Info className="h-4 w-4" />
          <AlertTitle>Room sized from your photo</AlertTitle>
          <AlertDescription className="mt-1">
            Layout checks use an automatic estimate from your image. Tap two
            points on the back wall in the Layout step to refine width, or
            collapse &quot;Adjust room size&quot; for exact numbers.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">See it in your space (AR)</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Cabinets export at <strong>true scale</strong> (same sizes as the
              2D planner). AR places them on your floor for visualization only —
              it does not map walls, windows, or room size. A small 12&quot;
              reference square is included so you can sanity-check scale on your
              phone.
            </p>
          </div>
          <ARLauncher />
        </CardContent>
      </Card>

      {design.modules.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Layout check</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={exportPlanSvg}
              data-testid="button-export-floor-plan"
            >
              <Download className="h-4 w-4" />
              Floor plan (.svg)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void exportPlanPdf()}
              data-testid="button-export-floor-plan-pdf"
            >
              <Download className="h-4 w-4" />
              Planning PDF
            </Button>
          </div>
          <PlanIssuesPanel
            issues={issues}
            recommendations={recommendations}
            onApplyFix={(apply) => setModules(apply(design.modules))}
          />
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-1">Room photo overlay</p>
        <p className="text-sm text-muted-foreground mb-3">
          Align finish color manually — not a measured overlay. For scale, use
          AR or the floor plan export.
        </p>
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
          {roomDimsSet && design.roomMeta && (
            <SummaryRow
              label="Room size"
              value={`${design.roomMeta.widthIn}" × ${design.roomMeta.depthIn}"`}
            />
          )}
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
