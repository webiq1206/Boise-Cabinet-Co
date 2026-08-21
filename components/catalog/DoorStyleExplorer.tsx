import Link from "next/link";
import type { DoorStyle, Finish } from "@/shared/catalog";
import {
  getFinishesForDoorStyle,
  getProductCountForDoorStyle,
  getCollectionsForDoorStyle,
} from "@/shared/catalog";
import { DoorStyleHero } from "@/components/catalog/DoorStyleHero";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { CatalogAvailabilityStrip } from "@/components/catalog/CatalogAvailabilityStrip";
import { CatalogActionBar } from "@/components/catalog/CatalogActionBar";

export interface DoorStyleExplorerProps {
  style: DoorStyle;
  showFinishes?: boolean;
  maxFinishes?: number;
}

export function DoorStyleExplorer({
  style,
  showFinishes = true,
  maxFinishes = 12,
}: DoorStyleExplorerProps) {
  const finishes: Finish[] = getFinishesForDoorStyle(style.slug).slice(0, maxFinishes);
  const productCount = getProductCountForDoorStyle(style.slug);
  const collections = getCollectionsForDoorStyle(style.slug);

  return (
    <div className="space-y-8">
      <DoorStyleHero slug={style.slug} name={style.name} />
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">{style.name} Door Style</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{style.description}</p>
      </div>
      <CatalogAvailabilityStrip
        finishCount={getFinishesForDoorStyle(style.slug).length}
        productCount={productCount}
        collections={collections.map((c) => ({
          label: c.name,
          href: "/catalog",
        }))}
        specs={[style.drawerFrontDefault === "slab" ? "Slab drawer fronts" : "Five-piece drawers"]}
      />
      <p className="text-sm text-muted-foreground">{style.constructionNotes}</p>
      <CatalogActionBar
        primaryHref="/estimate"
        compareHref="/compare"
        productsHref="/catalog"
      />
      {showFinishes && finishes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Available finishes</h3>
          <FinishSwatchGrid finishes={finishes} />
          <Link
            href="/catalog"
            className="tap-target text-sm text-accent mt-4 inline-flex items-center hover:underline"
          >
            View all compatible finishes
          </Link>
        </div>
      )}
    </div>
  );
}
