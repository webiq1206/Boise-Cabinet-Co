"use client";

import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { COLLECTIONS } from "@/shared/catalog/collections";
import { Badge } from "@/components/ui/badge";
import type { CabinetCollection } from "../DesignStudioProvider";

export function CollectionStep() {
  const { design, updateDesign } = useDesignStudio();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Choose your <em className="brc-accent text-accent">collection</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Sleek cabinets with soft-close doors on every line.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {COLLECTIONS.map((item) => {
          const selected = design.collection === item.slug;
          const tag = item.priceTier === "luxury" ? "Premium" : item.priceTier === "premium" ? "Popular" : undefined;

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => updateDesign({ collection: item.slug as CabinetCollection })}
              className={cn(
                "rounded-lg border-2 p-5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium">{item.name}</p>
                {tag && <Badge variant="secondary">{tag}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{item.tagline}</p>
              <p className="text-xs text-muted-foreground mt-2">Lead time: {item.leadTime}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}