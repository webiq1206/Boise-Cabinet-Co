import { getDoorStyleBySlug, getFinishBySlug, getCabinetProductBySlug } from "@/shared/catalog";
import { DoorStyleExplorer } from "@/components/catalog/DoorStyleExplorer";
import { FinishExplorer } from "@/components/catalog/FinishExplorer";
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
    return (
      <div className="my-8 rounded-xl border bg-card p-6">
        <DoorStyleExplorer style={style} maxFinishes={8} />
      </div>
    );
  }
  if (entity === "finish") {
    const finish = getFinishBySlug(slug);
    if (!finish) return null;
    return (
      <div className="my-8 rounded-xl border bg-card p-6">
        <FinishExplorer finish={finish} />
      </div>
    );
  }
  const product = getCabinetProductBySlug(slug);
  if (!product) return null;
  return (
    <div className="my-8">
      <ProductConfigurationCard product={product} />
    </div>
  );
}
