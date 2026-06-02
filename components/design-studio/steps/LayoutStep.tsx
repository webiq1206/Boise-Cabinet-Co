"use client";

import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { getLayoutsForRoom, type LayoutSlug } from "@/shared/catalog/layouts";

export function LayoutStep() {
  const { design, updateDesign } = useDesignStudio();
  const layouts = getLayoutsForRoom(design.roomType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Pick a <em className="brc-accent text-accent">layout</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose the footprint that best matches your space. We&apos;ll refine dimensions during consultation.
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
                "rounded-lg border-2 p-5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className="aspect-[4/3] rounded-md bg-muted mb-3 flex items-center justify-center">
                <LayoutIcon type={item.slug as LayoutSlug} selected={selected} />
              </div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            </button>
          );
        })}
      </div>
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
