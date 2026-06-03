"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { DOOR_STYLES } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import { getFinishesForDoorStyle, getDoorStyleImages, getFinishImages } from "@/shared/catalog";
import { Label } from "@/components/ui/label";
import { VisualOptionGrid } from "@/components/catalog/visual";

const DEFAULT_FINISH = FINISH_BY_SLUG["woodgrain-canyon-oak"] ?? FINISH_BY_SLUG["matte-vanilla-orchid"];

export function StyleStep({ embedded = false }: { embedded?: boolean }) {
  const { design, updateDesign } = useDesignStudio();

  const [finishCategory, setFinishCategory] = useState<"all" | "matte" | "gloss" | "woodgrain">("all");

  const doorFinishes = design.doorStyle
    ? getFinishesForDoorStyle(design.doorStyle)
    : getFinishesForDoorStyle("modern-shaker");

  const filteredFinishes =
    finishCategory === "all"
      ? doorFinishes
      : doorFinishes.filter((f) => f.category === finishCategory);

  const previewFinish =
    (design.finish ? FINISH_BY_SLUG[design.finish] : undefined) ?? DEFAULT_FINISH;

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
        <VisualOptionGrid
          items={DOOR_STYLES.map((item) => {
            const images = getDoorStyleImages(item.slug, item.imagePath);
            return {
              id: item.slug,
              label: item.name,
              description: item.description,
              imageSrc: images.primary,
              imageAlt: `${item.name} door profile`,
            };
          })}
          selectedId={design.doorStyle}
          onSelect={(slug) => updateDesign({ doorStyle: slug as never })}
          testIdPrefix="button-door-style"
        />
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
        <VisualOptionGrid
          className="max-h-[420px] overflow-y-auto pr-1 gap-3"
          columns={3}
          items={filteredFinishes.map((item) => ({
            id: item.slug,
            label: item.name,
            meta: item.category,
            imageSrc: getFinishImages(item.slug, item.imagePath).swatch,
            imageAlt: `${item.name} finish swatch`,
            fallbackHex: item.hexColor,
          }))}
          selectedId={design.finish}
          onSelect={(slug) => updateDesign({ finish: slug })}
          testIdPrefix="button-finish"
        />
      </div>
    </div>
  );
}
