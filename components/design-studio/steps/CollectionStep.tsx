"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { COLLECTIONS } from "@/shared/catalog/collections";
import { VisualOptionGrid } from "@/components/catalog/visual";
import type { CabinetCollection } from "../DesignStudioProvider";

const COLLECTION_HINTS: Record<string, string> = {
  custom: "Most popular",
  reserve: "Premium colors",
};

export function CollectionStep() {
  const { design, updateDesign } = useDesignStudio();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Choose your <em className="brc-accent text-accent">collection</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose the cabinet line that fits your timeline and budget. Every line includes soft-close doors.
        </p>
      </div>

      <VisualOptionGrid
        columns={2}
        items={COLLECTIONS.map((item) => ({
          id: item.slug,
          label: item.name,
          description: item.tagline,
          meta: `${COLLECTION_HINTS[item.slug] ?? item.priceTier} · ${item.leadTime}`,
          imageSrc: item.heroImage,
          imageAlt: `${item.name} cabinet collection`,
        }))}
        selectedId={design.collection}
        onSelect={(slug) => updateDesign({ collection: slug as CabinetCollection })}
        testIdPrefix="button-collection"
      />
    </div>
  );
}
