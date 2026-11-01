"use client";

import Image from "next/image";
import { useState } from "react";
import type { CabinetProduct } from "@/shared/catalog";
import { cn } from "@/lib/utils";

export interface ProductConfigGalleryProps {
  product: CabinetProduct;
  className?: string;
}

export function ProductConfigGallery({ product, className }: ProductConfigGalleryProps) {
  // Same result as entityImages.getProductImages: every catalog product carries its
  // generated boxImage, so the by-slug lookup there (which imports the whole
  // product catalog into this client bundle) never changes the answer here.
  const box = product.boxImage ?? `/generated/cabinets/${product.slug}.svg`;
  const images = { hero: box, diagram: box };
  const [active, setActive] = useState<"hero" | "diagram">("hero");
  const [failed, setFailed] = useState(false);

  const src = active === "hero" ? images.hero : images.diagram;
  const alt =
    active === "hero"
      ? `${product.name} cabinet configuration`
      : `${product.name} elevation diagram`;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted">
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain p-2"
            priority
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {product.name}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setActive("hero");
            setFailed(false);
          }}
          className={cn(
            "text-xs rounded-full border px-3 py-1 transition-colors",
            active === "hero"
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Configuration
        </button>
        <button
          type="button"
          onClick={() => {
            setActive("diagram");
            setFailed(false);
          }}
          className={cn(
            "text-xs rounded-full border px-3 py-1 transition-colors",
            active === "diagram"
              ? "border-primary bg-primary/5 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Elevation
        </button>
      </div>
    </div>
  );
}
