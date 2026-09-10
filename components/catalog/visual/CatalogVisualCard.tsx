import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogImage } from "./CatalogImage";
import { cn } from "@/lib/utils";

export interface CatalogVisualSpec {
  label: string;
  value: string;
}

export interface CatalogVisualCardProps {
  name: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Flat color tile shown when no imageSrc is available (e.g. finish swatches) */
  fallbackColor?: string;
  specs?: CatalogVisualSpec[];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** CSS aspect-ratio for the image (doors 4/3, finishes/accessories 1/1, rooms 3/2). */
  aspectRatio?: string;
  className?: string;
}

export function CatalogVisualCard({
  name,
  description,
  imageSrc,
  imageAlt,
  fallbackColor,
  specs = [],
  primaryHref,
  primaryLabel = "View details",
  secondaryHref,
  secondaryLabel,
  aspectRatio = "16/9",
  className,
}: CatalogVisualCardProps) {
  return (
    <article data-catalog-visual-card className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card", className)}>
      {imageSrc ? (
        <CatalogImage
          src={imageSrc}
          alt={imageAlt ?? name}
          aspectRatio={aspectRatio}
          className="rounded-none"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      ) : fallbackColor ? (
        <div
          className="w-full"
          style={{ aspectRatio, backgroundColor: fallbackColor }}
          role="img"
          aria-label={imageAlt ?? name}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <h3 className="text-lg font-serif tracking-tight hyphens-auto break-words">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-4">{description}</p>
        )}
        {specs.length > 0 && (
          <dl className="mt-4 grid gap-2 text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="min-w-0 break-words font-medium text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto pt-6 flex flex-wrap gap-3">
          {primaryHref && (
            <Button variant="brand" size="sm" className="h-auto min-h-11 max-w-full whitespace-normal py-3 text-left leading-relaxed" asChild>
              <Link href={primaryHref}>
                {primaryLabel} <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
          )}
          {secondaryHref && (
            <Button variant="brandOutline" size="sm" className="h-auto min-h-11 max-w-full whitespace-normal py-3 text-left leading-relaxed" asChild>
              <Link href={secondaryHref}>{secondaryLabel ?? "Learn more"}</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
