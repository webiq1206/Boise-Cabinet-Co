"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface VisualOptionTileProps {
  label: string;
  description?: string;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Flat color tile shown when no swatch image is available */
  fallbackHex?: string;
  selected?: boolean;
  onSelect: () => void;
  testId?: string;
}

export function VisualOptionTile({
  label,
  description,
  meta,
  imageSrc,
  imageAlt,
  fallbackHex,
  selected,
  onSelect,
  testId,
}: VisualOptionTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const useHexFallback = Boolean(fallbackHex) && (!imageSrc || imageFailed);

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={testId}
      className={cn(
        "flex gap-3 rounded-lg border-2 px-4 py-3 text-sm text-left transition-colors w-full",
        selected
          ? "border-primary bg-primary/5 font-medium"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="relative h-14 w-14 shrink-0 self-start overflow-hidden rounded-sm border border-border/50 bg-muted">
        {useHexFallback ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: fallbackHex }}
            role="img"
            aria-label={`${label} color swatch`}
          />
        ) : imageSrc && !imageFailed ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? label}
            fill
            sizes="48px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {meta && <p className="text-xs text-muted-foreground capitalize mt-0.5">{meta}</p>}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{description}</p>
        )}
      </div>
    </button>
  );
}
