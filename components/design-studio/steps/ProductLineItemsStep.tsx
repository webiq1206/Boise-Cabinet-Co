"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { CABINET_PRODUCTS_BY_CATEGORY } from "@/shared/catalog";
import type { CabinetProductCategory } from "@/shared/catalog";
import { getProductImages } from "@/shared/catalog/entityImages";
import { Label } from "@/components/ui/label";
import { VisualOptionGrid } from "@/components/catalog/visual";

const CATEGORIES: CabinetProductCategory[] = [
  "base",
  "wall",
  "tall",
  "vanity",
  "floating-shelf",
];

const CATEGORY_LABELS: Record<CabinetProductCategory, string> = {
  base: "Base",
  wall: "Wall",
  tall: "Tall",
  vanity: "Vanity",
  "end-panel": "End panel",
  filler: "Filler",
  hood: "Hood",
  "floating-shelf": "Floating shelf",
  panel: "Panel",
};

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
        <h2 className="text-2xl font-serif tracking-tight">
          Cabinet <em className="brc-accent text-accent">configurations</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Select cabinet configurations for your layout. Tap a card to add or remove it from your project.
        </p>
        {selected.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {selected.length} configuration{selected.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>
      {CATEGORIES.map((cat) => {
        const products = (CABINET_PRODUCTS_BY_CATEGORY[cat] ?? []).slice(0, 16);
        if (products.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <Label>{CATEGORY_LABELS[cat]}</Label>
            <VisualOptionGrid
              columns={4}
              className="gap-3"
              items={products.map((p) => {
                const imgs = getProductImages(p);
                const cfg = p.configuration;
                const tags = [
                  cfg.doors ? `${cfg.doors}D` : null,
                  cfg.drawers ? `${cfg.drawers}Dr` : null,
                  cfg.rollouts ? "ROT" : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return {
                  id: p.slug,
                  label: p.name,
                  description: tags || undefined,
                  imageSrc: imgs.thumb,
                  imageAlt: `${p.name} configuration`,
                };
              })}
              selectedIds={selected}
              onSelect={toggle}
              testIdPrefix="button-line-item"
            />
          </div>
        );
      })}
    </div>
  );
}
