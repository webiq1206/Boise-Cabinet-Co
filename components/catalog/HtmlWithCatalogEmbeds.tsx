"use client";

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
