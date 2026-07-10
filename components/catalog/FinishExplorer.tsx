import Link from "next/link";
import type { Finish } from "@/shared/catalog";
import {
  getDoorStylesForFinish,
  getCollectionsForFinish,
  getSimilarFinishes,
  formatPriceTier,
} from "@/shared/catalog";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { FinishDualPreview } from "@/components/catalog/visual";
import { CatalogAvailabilityStrip } from "@/components/catalog/CatalogAvailabilityStrip";
import { CatalogActionBar } from "@/components/catalog/CatalogActionBar";

export interface FinishExplorerProps {
  finish: Finish;
}

export function FinishExplorer({ finish }: FinishExplorerProps) {
  const doorStyles = getDoorStylesForFinish(finish.slug);
  const collections = getCollectionsForFinish(finish.slug);
  const similar = getSimilarFinishes(finish.slug, 6);

  return (
    <div className="space-y-8">
      <FinishDualPreview finish={finish} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-sans font-light tracking-tight">{finish.name} Cabinet Finish</h1>
          <p className="text-muted-foreground mt-1 capitalize">
            {finish.category} · {finish.sheen}
          </p>
          <CatalogAvailabilityStrip
            collections={collections.map((c) => ({
              label: c.name,
              href: `/collections/${c.slug}`,
            }))}
            doorStyles={doorStyles.map((d) => ({
              label: d.name,
              href: `/door-styles/${d.slug}`,
            }))}
            specs={[
              finish.sidedness === "double" ? "Double-sided" : "Single-sided",
              formatPriceTier(finish),
            ]}
          />
        </div>
      </div>
      <CatalogActionBar
        primaryHref="/estimate"
        compareHref={`/compare?finishes=${finish.slug}`}
      />
      {similar.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Similar finishes</h3>
          <FinishSwatchGrid finishes={similar} />
        </div>
      )}
      <Link
        href={`/finishes/${finish.category}`}
        className="text-sm text-accent hover:underline"
      >
        Browse all {finish.category} finishes
      </Link>
    </div>
  );
}
