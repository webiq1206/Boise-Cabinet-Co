import Link from "next/link";
import type { CabinetProduct } from "@/shared/catalog";
import { formatCabinetDimensions, getCabinetNeedLabel } from "@/shared/catalog";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CatalogActionBar } from "@/components/catalog/CatalogActionBar";
import { Chip } from "@/components/marketing/Chip";
import { ProductConfigGallery } from "@/components/catalog/visual";

export interface ProductConfigurationCardProps {
  product: CabinetProduct;
  showGallery?: boolean;
}

export function ProductConfigurationCard({
  product,
  showGallery = true,
}: ProductConfigurationCardProps) {
  const cfg = product.configuration;
  const tags: string[] = [];
  if (cfg.doors) tags.push(`${cfg.doors} door${cfg.doors > 1 ? "s" : ""}`);
  if (cfg.drawers) tags.push(`${cfg.drawers} drawer${cfg.drawers > 1 ? "s" : ""}`);
  if (cfg.shelves) tags.push(`${cfg.shelves} shelf${cfg.shelves > 1 ? "ves" : ""}`);
  if (cfg.rollouts) tags.push("rollout");
  if (cfg.partitions) tags.push("partition");

  return (
    <MarketingCard className="h-full flex flex-col p-0 overflow-hidden">
      {showGallery && (
        <div className="p-4 pb-0">
          <ProductConfigGallery product={product} />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <p
          className="text-xs text-accent uppercase tracking-wider mb-1"
          data-testid={`text-need-${product.slug}`}
        >
          {getCabinetNeedLabel(product)}
        </p>
        <h3 className="text-lg font-medium">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 flex-1">{product.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((t) => (
            <Chip key={t} className="text-xs">
              {t}
            </Chip>
          ))}
          <Chip className="text-xs">{formatCabinetDimensions(product)}</Chip>
        </div>
        <CatalogActionBar
          className="mt-4"
          primaryHref="/estimate"
          productsHref="/catalog"
        />
        <Link
          href="/catalog"
          className="text-sm text-accent mt-2 inline-block hover:underline"
        >
          Full specifications
        </Link>
      </div>
    </MarketingCard>
  );
}
