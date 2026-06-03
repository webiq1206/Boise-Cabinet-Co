"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { DOOR_STYLES } from "@/shared/catalog/doorStyles";
import { FINISHES, FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { Label } from "@/components/ui/label";
import { DoorStylePreview } from "../DoorStylePreview";

const DEFAULT_FINISH = FINISH_BY_SLUG["white-oak"];

export function StyleStep({ embedded = false }: { embedded?: boolean }) {
  const { design, updateDesign } = useDesignStudio();

  const [finishCategory, setFinishCategory] = useState<"all" | "matte" | "gloss" | "woodgrain">("all");

  const filteredFinishes =
    finishCategory === "all"
      ? FINISHES
      : FINISHES.filter((f) => f.category === finishCategory);

  const previewFinish =
    (design.finish ? FINISH_BY_SLUG[design.finish] : undefined) ?? DEFAULT_FINISH;
  const previewColor = previewFinish.hexColor;
  const previewCategory = previewFinish.category;

  return (
    <div className="space-y-8">
      {!embedded && (
        <div>
          <h2 className="text-2xl font-sans font-light tracking-tight">
            Door style & <em className="brc-accent text-accent">finish</em>
          </h2>
          <p className="text-muted-foreground mt-2">
            Pick the look of your cabinet doors and colors.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-sm font-medium">Door style</Label>
          <p className="text-xs text-muted-foreground">
            Previews shown in{" "}
            <span className="font-medium text-foreground">{previewFinish.name}</span>
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DOOR_STYLES.map((item) => {
            const selected = design.doorStyle === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => updateDesign({ doorStyle: item.slug as never })}
                className={cn(
                  "flex gap-3 rounded-lg border-2 px-4 py-3 text-sm text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/40",
                )}
                data-testid={`button-door-style-${item.slug}`}
              >
                <div className="h-16 w-12 shrink-0 self-start">
                  <DoorStylePreview slug={item.slug} color={previewColor} category={previewCategory} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-sm font-medium">Finish</Label>
          <div className="flex flex-wrap gap-1">
            {(["all", "matte", "gloss", "woodgrain"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFinishCategory(cat)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                  finishCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredFinishes.map((item) => {
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
