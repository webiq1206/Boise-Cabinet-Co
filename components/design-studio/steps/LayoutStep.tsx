"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDesignStudio } from "../DesignStudioProvider";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";
import { Room2DPlanner } from "../Room2DPlanner";
import { PlanIssuesPanel } from "../PlanIssuesPanel";
import {
  detectIssues,
  getRecommendations,
} from "@/lib/design/planAdvisor";
import { resolveRoomBounds } from "@/lib/design/resolveRoomBounds";
import { rankLayoutsForRoom } from "@/lib/design/layoutFit";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import {
  buildFloorPlanSvg,
  downloadFloorPlanSvg,
} from "@/lib/design/floorPlanExport";
import { Download, ScanLine } from "lucide-react";
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import { wizardCopy } from "@/shared/designStudioCopy";

export function LayoutStep() {
  const { design, updateDesign, setModules } = useDesignStudio();
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
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Pick a <em className="brc-accent text-accent">layout</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          {wizardCopy.layoutHint(
            design.roomMeta!.widthIn,
            design.roomMeta!.depthIn,
          )}
        </p>
      </div>

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
                "relative rounded-lg border-2 p-5 text-left transition-colors",
                disabled && "opacity-45 cursor-not-allowed",
                selected
                  ? "border-primary bg-primary/5"
                  : !disabled &&
                      "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
              data-testid={`button-layout-${item.slug}`}
            >
              {index === 0 && fit.fits && (
                <Badge className="absolute right-3 top-3">Best fit</Badge>
              )}
              {!fit.fits && (
                <Badge variant="destructive" className="absolute right-3 top-3">
                  Too large
                </Badge>
              )}
              <div className="aspect-[4/3] rounded-md bg-muted mb-3 flex items-center justify-center">
                <LayoutIcon type={item.slug as LayoutSlug} selected={selected} />
              </div>
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

      {!design.layout && topFit && (
        <Button
          type="button"
          variant="outline"
          onClick={() => updateDesign({ layout: topFit.slug as LayoutSlug })}
          data-testid="button-use-best-layout"
        >
          Use recommended layout ({layouts.find((l) => l.slug === topFit.slug)?.name})
        </Button>
      )}

      {design.layout && (
        <div className="space-y-5 border-t pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-medium">Place cabinets on your scan</h3>
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

          <Room2DPlanner />

          <PlanIssuesPanel
            issues={issues}
            recommendations={recommendations}
            onApplyFix={(apply) => setModules(apply(design.modules))}
          />
        </div>
      )}
    </div>
  );
}

function LayoutIcon({ type, selected }: { type: LayoutSlug; selected: boolean }) {
  const fill = selected ? "bg-primary" : "bg-muted-foreground/30";
  const previewType =
    type === "single-vanity" || type === "double-vanity"
      ? "peninsula"
      : type === "wall-run" || type === "floor-to-ceiling"
        ? "galley"
        : type;

  return (
    <div className="w-16 h-12 relative">
      {previewType === "galley" && (
        <>
          <div className={cn("absolute left-2 top-1 bottom-1 w-3 rounded-sm", fill)} />
          <div className={cn("absolute right-2 top-1 bottom-1 w-3 rounded-sm", fill)} />
        </>
      )}
      {previewType === "l-shape" && (
        <>
          <div className={cn("absolute left-1 top-1 bottom-1 w-3 rounded-sm", fill)} />
          <div className={cn("absolute left-1 bottom-1 right-1 h-3 rounded-sm", fill)} />
        </>
      )}
      {previewType === "u-shape" && (
        <>
          <div className={cn("absolute left-1 top-1 bottom-1 w-3 rounded-sm", fill)} />
          <div className={cn("absolute right-1 top-1 bottom-1 w-3 rounded-sm", fill)} />
          <div className={cn("absolute left-1 bottom-1 right-1 h-3 rounded-sm", fill)} />
        </>
      )}
      {(previewType === "island" || previewType === "peninsula") && (
        <>
          <div className={cn("absolute left-1 top-1 bottom-4 w-3 rounded-sm", fill)} />
          <div className={cn("absolute left-1 bottom-1 w-10 h-3 rounded-sm", fill)} />
          <div
            className={cn(
              "absolute rounded-sm",
              fill,
              previewType === "island" ? "left-6 top-4 w-6 h-4" : "left-10 top-5 w-5 h-3",
            )}
          />
        </>
      )}
    </div>
  );
}
