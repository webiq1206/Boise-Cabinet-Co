"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { CABINET_PRODUCTS_BY_CATEGORY } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const CATEGORIES: CabinetProductCategory[] = ["base", "wall", "tall", "vanity"];

export function ProductLineItemsStep() {
  const { design, updateDesign } = useDesignStudio();
  const selected = design.lineItemSlugs ?? [];

  const toggle = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    updateDesign({ lineItemSlugs: next });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Cabinet <em className="brc-accent text-accent">configurations</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Select One Source SKU configurations for your layout. Only catalog products are shown.
        </p>
      </div>
      {CATEGORIES.map((cat) => {
        const products = (CABINET_PRODUCTS_BY_CATEGORY[cat] ?? []).slice(0, 12);
        if (products.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <Label className="capitalize">{cat.replace(/-/g, " ")}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => {
                const on = selected.includes(p.slug);
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => toggle(p.slug)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm font-mono transition-colors",
                      on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                    )}
                  >
                    {p.oscCode}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
