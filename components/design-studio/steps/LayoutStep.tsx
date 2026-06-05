"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDesignStudio } from "../DesignStudioProvider";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";
import { Room2DPlanner } from "../Room2DPlanner";
import { RoomPhotoOverlay } from "../RoomPhotoOverlay";
import { RoomPhotoQuickMeasure } from "../RoomPhotoQuickMeasure";
import { RoomAccuracyNotice } from "../RoomAccuracyNotice";
import { PlanIssuesPanel } from "../PlanIssuesPanel";
import { getPreviewFinishHex } from "@/lib/design/previewConfig";
import {
  detectIssues,
  getRecommendations,
} from "@/lib/design/planAdvisor";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { rankLayoutsForRoom } from "@/lib/design/layoutFit";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { buildLayoutDiagram } from "@/lib/design/layoutDiagram";
import {
  buildFloorPlanSvg,
  downloadFloorPlanSvg,
} from "@/lib/design/floorPlanExport";
import { Check, Download, ScanLine } from "lucide-react";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { wizardCopy } from "@/shared/designStudioCopy";

export function LayoutStep() {
  const { design, updateDesign, setModules } = useDesignStudio();
  const finishHex = getPreviewFinishHex(design);
  const layouts = getLayoutsForRoom(design.roomType);
  const scanned = isScannedRoom(design.roomMeta);

  const ranked = useMemo(
    () =>
      rankLayoutsForRoom(
        layouts,
        design.roomMeta,
        design.roomType,
        design.roomBounds,
      ),
    [layouts, design.roomMeta, design.roomType, design.roomBounds],
  );

  const widthIn = design.roomMeta?.widthIn;
  const depthIn = design.roomMeta?.depthIn;
  const diagrams = useMemo(() => {
    const map: Record<string, { svg: string; aspect: number }> = {};
    for (const l of layouts) {
      map[l.slug] = buildLayoutDiagram(l.slug, { widthIn, depthIn });
    }
    return map;
  }, [layouts, widthIn, depthIn]);

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
    () => getRecommendations(design.modules, design.roomType, design.accessories),
    [design.modules, design.roomType, design.accessories],
  );

  function exportPlan() {
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

  useEffect(() => {
    if (!scanned) trackDesignEvent("layout_blocked_no_scan");
  }, [scanned]);

  if (!scanned) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <ScanLine className="h-4 w-4" />
          <AlertTitle>{wizardCopy.layoutNeedScan}</AlertTitle>
          <AlertDescription>{wizardCopy.layoutNeedScanHint}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const topFit = ranked.find((r) => r.fits);

  return (
    <div className="space-y-6">
      <RoomAccuracyNotice meta={design.roomMeta} />

      <p className="text-sm text-muted-foreground">
        {wizardCopy.layoutHint(
          design.roomMeta!.widthIn,
          design.roomMeta!.depthIn,
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((fit, index) => {
          const item = layouts.find((l) => l.slug === fit.slug)!;
          const selected = design.layout === item.slug;
          const disabled = !fit.fits;

          return (
            <button
              key={item.slug}
              type="button"
              disabled={disabled}
              onClick={() => updateDesign({ layout: item.slug as LayoutSlug })}
              className={cn(
                "relative rounded-md border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                disabled && "opacity-45 cursor-not-allowed",
                selected
                  ? "border-primary ring-2 ring-primary/40 bg-primary/5 shadow-sm"
                  : !disabled &&
                      "border-border hover:border-foreground/30 hover:bg-muted/40 hover:shadow-sm",
              )}
              data-testid={`button-layout-${item.slug}`}
            >
              {selected && (
                <span className="absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              {!selected && index === 0 && fit.fits && (
                <Badge className="absolute right-3 top-3">Best fit</Badge>
              )}
              {!selected && !fit.fits && (
                <Badge variant="destructive" className="absolute right-3 top-3">
                  Too large
                </Badge>
              )}
              <div
                className="relative w-full rounded-md bg-muted mb-3 overflow-hidden"
                style={{ aspectRatio: diagrams[item.slug]?.aspect ?? 4 / 3 }}
                role="img"
                aria-label={`${item.name} cabinet layout floor plan, scaled to your ${Math.round((widthIn ?? 0) / 12)} by ${Math.round((depthIn ?? 0) / 12)} foot room`}
                dangerouslySetInnerHTML={{
                  __html: diagrams[item.slug]?.svg ?? "",
                }}
              />
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
              {fit.fits && (
                <p className="text-xs text-muted-foreground mt-2">
                  {wizardCopy.layoutSlack(fit.widthSlackIn, fit.depthSlackIn)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {ranked.length > 0 && ranked.every((r) => !r.fits) && (
        <p
          className="text-sm text-amber-800 dark:text-amber-200 rounded-md border border-amber-500/30 bg-amber-500/10 p-3"
          data-testid="layout-all-too-large"
        >
          {wizardCopy.layoutTooLargeHint}
        </p>
      )}

      {!design.layout && topFit && (
        <Button
          type="button"
          variant="brand"
          onClick={() => updateDesign({ layout: topFit.slug as LayoutSlug })}
          data-testid="button-use-best-layout"
        >
          Use recommended layout ({layouts.find((l) => l.slug === topFit.slug)?.name})
        </Button>
      )}

      {design.layout && (
        <div className="border-t pt-6 space-y-6">
          {design.photoUrl && (
            <div className="space-y-3" data-testid="layout-room-photo-section">
              <div>
                <h3 className="text-lg font-medium">{wizardCopy.layoutPhotoTitle}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {wizardCopy.layoutPhotoHint}
                </p>
              </div>
              <RoomPhotoQuickMeasure />
              <RoomPhotoOverlay
                photoUrl={design.photoUrl}
                finishColor={finishHex}
                onPhotoChange={(url) => updateDesign({ photoUrl: url })}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-medium">Edit layout in your room</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={exportPlan}
                data-testid="button-export-floor-plan-layout"
              >
                <Download className="h-4 w-4" />
                Export floor plan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag cabinet boxes in the floor plan, or adjust the photo overlay above.
            </p>
            <Room2DPlanner />
            <PlanIssuesPanel
              issues={issues}
              recommendations={recommendations}
              onApplyFix={(apply) => setModules(apply(design.modules))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

