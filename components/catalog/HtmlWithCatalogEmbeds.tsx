/**
 * Article HTML with catalog embeds spliced in. A server component on purpose:
 * it has no state or effects, and as a client component it shipped the whole
 * generated product catalog to every article and location page only to redraw
 * markup the server had already rendered. The swatch, gallery and action-bar
 * islands inside an embed stay client components.
 */
import { CatalogEmbed } from "@/components/catalog/CatalogEmbed";
import { splitCatalogEmbeds } from "@/lib/catalog/parseCatalogEmbeds";
import { cn } from "@/lib/utils";

interface HtmlWithCatalogEmbedsProps {
  html: string;
  className?: string;
}

export function HtmlWithCatalogEmbeds({ html, className }: HtmlWithCatalogEmbedsProps) {
  const parts = splitCatalogEmbeds(html);

  return (
    <div className={cn(className)}>
      {parts.map((part, index) =>
        part.type === "html" ? (
          <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          <CatalogEmbed key={`embed-${part.slug}-${index}`} entity={part.entity} slug={part.slug} />
        ),
      )}
    </div>
  );
}
