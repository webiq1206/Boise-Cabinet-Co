import type { CatalogEmbedEntity } from "@/components/catalog/CatalogEmbed";

/** Inline marker: `[[catalog door modern-shaker]]` */
export const CATALOG_EMBED_RE =
  /\[\[catalog\s+(door|finish|product)\s+([a-z0-9-]+)\]\]/gi;

export type CatalogEmbedPart =
  | { type: "html"; content: string }
  | { type: "embed"; entity: CatalogEmbedEntity; slug: string };

function mapEntity(token: string): CatalogEmbedEntity {
  if (token === "door") return "doorStyle";
  if (token === "finish") return "finish";
  return "product";
}

export function splitCatalogEmbeds(html: string): CatalogEmbedPart[] {
  const parts: CatalogEmbedPart[] = [];
  let lastIndex = 0;
  const re = new RegExp(CATALOG_EMBED_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", content: html.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "embed",
      entity: mapEntity(match[1].toLowerCase()),
      slug: match[2],
    });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < html.length) {
    parts.push({ type: "html", content: html.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts.push({ type: "html", content: html });
  }

  return parts;
}

export function htmlContainsCatalogEmbeds(html: string): boolean {
  CATALOG_EMBED_RE.lastIndex = 0;
  return CATALOG_EMBED_RE.test(html);
}
