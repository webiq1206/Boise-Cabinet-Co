import { getDoorStyleBySlug, getFinishBySlug, getCabinetProductBySlug } from "@/shared/catalog";
import { DoorStyleStrip, FinishStrip } from "@/components/catalog/ArticleCatalogStrip";
import { ProductConfigurationCard } from "@/components/catalog/ProductConfigurationCard";

export type CatalogEmbedEntity = "doorStyle" | "finish" | "product";

export interface CatalogEmbedProps {
  entity: CatalogEmbedEntity;
  slug: string;
}

export function CatalogEmbed({ entity, slug }: CatalogEmbedProps) {
  if (entity === "doorStyle") {
    const style = getDoorStyleBySlug(slug);
    if (!style) return null;
    return <DoorStyleStrip style={style} />;
  }
  if (entity === "finish") {
    const finish = getFinishBySlug(slug);
    if (!finish) return null;
    return <FinishStrip finish={finish} />;
  }
  const product = getCabinetProductBySlug(slug);
  if (!product) return null;
  return (
    <div className="my-8">
      <ProductConfigurationCard product={product} />
    </div>
  );
}
