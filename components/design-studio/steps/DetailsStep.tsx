"use client";

import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog/hardware";

const SELECTABLE_HARDWARE_CATEGORIES = new Set(["pull", "knob", "handleless"]);

const HARDWARE_OPTIONS = CATALOG_HARDWARE.filter((h) =>
  SELECTABLE_HARDWARE_CATEGORIES.has(h.category),
).map((h) => ({ value: h.slug, label: h.name, category: h.category }));

const ACCESSORY_OPTIONS = [
  "Soft-close drawers",
  "Pull-out trash",
  "Spice rack insert",
  "Glass uppers",
  "Under-cabinet lighting prep",
  "Lazy Susan corner",
];

export function DetailsStep({ embedded = false }: { embedded?: boolean }) {
  const { design, updateDesign } = useDesignStudio();

  const toggleAccessory = (item: string) => {
    const next = design.accessories.includes(item)
      ? design.accessories.filter((a) => a !== item)
      : [...design.accessories, item];
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

      <div className="space-y-3">
        <Label className="text-sm font-medium">Hardware</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {HARDWARE_OPTIONS.map((item) => {
            const selected = design.hardware === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => updateDesign({ hardware: item.value })}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/40"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Accessories (optional)</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACCESSORY_OPTIONS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer hover:bg-muted/50"
            >
              <Checkbox
                checked={design.accessories.includes(item)}
                onCheckedChange={() => toggleAccessory(item)}
              />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
      </div>

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
    </div>
  );
}
