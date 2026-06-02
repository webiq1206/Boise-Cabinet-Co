"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Lightbulb, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDesignStudio } from "../DesignStudioProvider";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";
import { Room2DPlanner } from "../Room2DPlanner";
import {
  detectIssues,
  getRecommendations,
} from "@/lib/design/planAdvisor";
import { computeRoomBounds } from "@/lib/design/previewConfig";

export function LayoutStep() {
  const { design, updateDesign, setModules } = useDesignStudio();
  const layouts = getLayoutsForRoom(design.roomType);
  const recommended = layouts[0]?.slug;

  const bounds = design.roomBounds ?? computeRoomBounds(design.modules);

  const issues = useMemo(
    () => detectIssues(design.modules, bounds),
    [design.modules, bounds],
  );
  const recommendations = useMemo(
    () => getRecommendations(design.modules, design.roomType, design.accessories),
    [design.modules, design.roomType, design.accessories],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Pick a <em className="brc-accent text-accent">layout</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Start with a smart layout, then fine-tune it in the planner below. We&apos;ll confirm exact dimensions during consultation.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {layouts.map((item) => {
          const selected = design.layout === item.slug;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => updateDesign({ layout: item.slug as LayoutSlug })}
              className={cn(
                "relative rounded-lg border-2 p-5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
              data-testid={`button-layout-${item.slug}`}
            >
              {item.slug === recommended && (
                <Badge
                  className="absolute right-3 top-3"
                  data-testid={`badge-recommended-${item.slug}`}
                >
                  Recommended
                </Badge>
              )}
              <div className="aspect-[4/3] rounded-md bg-muted mb-3 flex items-center justify-center">
                <LayoutIcon type={item.slug as LayoutSlug} selected={selected} />
              </div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            </button>
          );
        })}
      </div>

      {design.layout && (
        <div className="space-y-5 border-t pt-6">
          <div>
            <h3 className="text-lg font-medium">Arrange your cabinets</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Drag, resize, and add cabinets. Your 3D preview updates as you go.
            </p>
          </div>

          <Room2DPlanner />

          {issues.length > 0 && (
            <div className="space-y-2" data-testid="panel-issues">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    "flex flex-wrap items-start gap-3 rounded-md border p-3",
                    issue.severity === "error"
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-muted/40",
                  )}
                  data-testid={`issue-${issue.id}`}
                >
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      issue.severity === "error"
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.message}
                    </p>
                  </div>
                  {issue.fix && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setModules(issue.fix!.apply(design.modules))
                      }
                      data-testid={`button-fix-${issue.id}`}
                    >
                      <Wand2 className="h-4 w-4" /> {issue.fix.label}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {issues.length === 0 && (
            <div
              className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
              data-testid="text-no-issues"
            >
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Looks good — no layout problems spotted.
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-2" data-testid="panel-recommendations">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" /> Ideas to make it
                work better
              </p>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-wrap items-start gap-3 rounded-md border border-border p-3"
                  data-testid={`rec-${rec.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground">{rec.message}</p>
                  </div>
                  {rec.fix && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setModules(rec.fix!.apply(design.modules))}
                      data-testid={`button-rec-${rec.id}`}
                    >
                      <Wand2 className="h-4 w-4" /> {rec.fix.label}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
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
              previewType === "island" ? "left-6 top-4 w-6 h-4" : "left-10 top-5 w-5 h-3"
            )}
          />
        </>
      )}
    </div>
  );
}
