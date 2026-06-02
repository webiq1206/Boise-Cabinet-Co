"use client";

import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { DOOR_STYLES } from "@/shared/catalog/doorStyles";
import { FINISHES } from "@/shared/catalog/finishes";
import { Label } from "@/components/ui/label";

export function StyleStep() {
  const { design, updateDesign } = useDesignStudio();

  const featuredFinishes = FINISHES.slice(0, 12);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Door style & <em className="brc-accent text-accent">finish</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Define the look of your cabinet faces — browse all {FINISHES.length}+ finishes on our site.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Door style</Label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DOOR_STYLES.map((item) => {
            const selected = design.doorStyle === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => updateDesign({ doorStyle: item.slug as never })}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/40",
                )}
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Finish</Label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredFinishes.map((item) => {
            const selected = design.finish === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => updateDesign({ finish: item.slug })}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm text-left transition-colors",
                  selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span
                  className="h-8 w-8 rounded-full shrink-0 border border-border/50"
                  style={{ backgroundColor: item.hexColor }}
                />
                <span>
                  <span className="block font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
