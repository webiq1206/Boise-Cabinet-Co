import Link from "next/link";
import type { CabinetProduct } from "@/shared/catalog";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CatalogActionBar } from "@/components/catalog/CatalogActionBar";
import { Chip } from "@/components/marketing/Chip";

export interface ProductConfigurationCardProps {
  product: CabinetProduct;
}

export function ProductConfigurationCard({ product }: ProductConfigurationCardProps) {
  const cfg = product.configuration;
  const tags: string[] = [];
  if (cfg.doors) tags.push(`${cfg.doors} door${cfg.doors > 1 ? "s" : ""}`);
  if (cfg.drawers) tags.push(`${cfg.drawers} drawer${cfg.drawers > 1 ? "s" : ""}`);
  if (cfg.shelves) tags.push(`${cfg.shelves} shelf${cfg.shelves > 1 ? "ves" : ""}`);
  if (cfg.rollouts) tags.push("rollout");
  if (cfg.partitions) tags.push("partition");

  return (
    <MarketingCard className="h-full flex flex-col">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {product.category}
      </p>
      <h3 className="font-mono text-lg font-medium">{product.oscCode}</h3>
      <p className="text-sm text-muted-foreground mt-2 flex-1">{product.description}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {tags.map((t) => (
          <Chip key={t} className="text-xs">
            {t}
          </Chip>
        ))}
        <Chip className="text-xs">
          {product.widthRange.minInches}"–{product.widthRange.maxInches}" wide
        </Chip>
      </div>
      <CatalogActionBar
        className="mt-4"
        designStudioHref={`/design-studio?product=${product.slug}`}
        productsHref={`/products/${product.category}/${product.slug}`}
      />
      <Link
        href={`/products/${product.category}/${product.slug}`}
        className="text-sm text-accent mt-2 inline-block hover:underline"
      >
        Full specifications
      </Link>
    </MarketingCard>
  );
}
