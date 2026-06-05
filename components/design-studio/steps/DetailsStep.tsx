"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCESSORY_FAMILIES, HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog";
import {
  getAccessoryFamilyImagePath,
  getHardwareImagePath,
} from "@/shared/catalog/catalogImages";
import { VisualOptionGrid } from "@/components/catalog/visual";

const SELECTABLE_HARDWARE_CATEGORIES = new Set(["pull", "knob", "handleless"]);

const HARDWARE_OPTIONS = CATALOG_HARDWARE.filter((h) =>
  SELECTABLE_HARDWARE_CATEGORIES.has(h.category),
);

interface DetailsStepShow {
  hardware?: boolean;
  accessories?: boolean;
  notes?: boolean;
}

export function DetailsStep({
  embedded = false,
  show = { hardware: true, accessories: true, notes: true },
}: {
  embedded?: boolean;
  show?: DetailsStepShow;
}) {
  const { design, updateDesign } = useDesignStudio();

  const toggleAccessoryFamily = (slug: string) => {
    const next = design.accessories.includes(slug)
      ? design.accessories.filter((a) => a !== slug)
      : [...design.accessories, slug];
    updateDesign({ accessories: next });
  };

  return (
    <div className="space-y-8">
      {!embedded && (
        <div>
          <h2 className="text-2xl font-sans font-light tracking-tight">
            Hardware & <em className="brc-accent text-accent">details</em>
          </h2>
          <p className="text-muted-foreground mt-2">
            Pick handles and any extras for your project.
          </p>
        </div>
      )}

      {show.hardware && (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Decorative hardware (consultation)</Label>
        <VisualOptionGrid
          columns={3}
          className="gap-3"
          items={HARDWARE_OPTIONS.map((item) => ({
            id: item.slug,
            label: item.name,
            meta: item.category,
            imageSrc: getHardwareImagePath(item.slug),
            imageAlt: item.name,
          }))}
          selectedId={design.hardware ?? undefined}
          onSelect={(slug) => updateDesign({ hardware: slug })}
          testIdPrefix="button-hardware"
        />
      </div>
      )}

      {show.accessories && (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Accessory families (optional)</Label>
        <VisualOptionGrid
          columns={3}
          className="gap-3"
          items={ACCESSORY_FAMILIES.map((family) => ({
            id: family.slug,
            label: family.name,
            description: family.description,
            imageSrc: getAccessoryFamilyImagePath(family.slug),
            imageAlt: family.name,
          }))}
          selectedIds={design.accessories}
          onSelect={toggleAccessoryFamily}
          testIdPrefix="button-accessory-family"
        />
      </div>
      )}

      {show.notes && (
      <div className="space-y-2">
        <Label htmlFor="notes">Notes for your designer</Label>
        <Textarea
          id="notes"
          placeholder="Appliance models, special requests, inspiration links…"
          value={design.notes}
          onChange={(e) => updateDesign({ notes: e.target.value })}
          rows={4}
        />
      </div>
      )}
    </div>
  );
}
