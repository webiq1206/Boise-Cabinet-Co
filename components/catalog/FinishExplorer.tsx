import Link from "next/link";
import type { Finish } from "@/shared/catalog";
import {
  getDoorStylesForFinish,
  getCollectionsForFinish,
  getSimilarFinishes,
} from "@/shared/catalog";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
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
      <div className="flex gap-6 items-start">
        <div
          className="h-24 w-24 rounded-lg border shadow-sm shrink-0"
          style={{ backgroundColor: finish.hexColor }}
          role="img"
          aria-label={`${finish.name} swatch`}
        />
        <div>
          <h2 className="text-2xl font-sans font-light tracking-tight">{finish.name}</h2>
          <p className="text-muted-foreground mt-1">
            {finish.panelBrand} · {finish.panelSeries} · {finish.category}
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
              `Tier ${finish.priceTierMarker}`,
            ]}
          />
        </div>
      </div>
      <CatalogActionBar
        designStudioHref={`/design-studio?finish=${finish.slug}`}
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
