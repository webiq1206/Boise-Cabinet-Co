"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBlurDataURL } from "@/shared/generated/imageBlur";

export type VisualOptionVariant = "media" | "swatch";

export interface VisualOptionTileProps {
  label: string;
  description?: string;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Flat color tile shown when no swatch image is available */
  fallbackHex?: string;
  selected?: boolean;
  /** "media" = image-forward 4:3 card, "swatch" = compact square tile */
  variant?: VisualOptionVariant;
  /** Optional recommendation badge, e.g. "Popular" or "Most loved". */
  badge?: string;
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
  variant = "media",
  badge,
  onSelect,
  testId,
}: VisualOptionTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const useHexFallback = Boolean(fallbackHex) && (!imageSrc || imageFailed);
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={testId}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-md border bg-card p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        selected
          ? "border-primary ring-2 ring-primary/40 bg-primary/5 shadow-sm"
          : "border-border hover:border-foreground/30 hover:shadow-sm",
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      {badge && !selected && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground shadow-sm">
          {badge}
        </span>
      )}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm border border-border/50 bg-muted",
          variant === "swatch" ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        {useHexFallback ? (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: fallbackHex }}
            role="img"
            aria-label={`${label} color swatch`}
          />
        ) : showImage ? (
          <Image
            src={imageSrc as string}
            alt={imageAlt ?? label}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            placeholder={getBlurDataURL(imageSrc as string) ? "blur" : undefined}
            blurDataURL={getBlurDataURL(imageSrc as string)}
            className="object-cover img-brand-grade"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>
      <div className="min-w-0 px-0.5 pb-0.5">
        <p
          className={cn(
            "font-medium text-foreground",
            variant === "swatch" ? "text-xs leading-snug line-clamp-2" : "text-sm",
          )}
        >
          {label}
        </p>
        {meta && (
          <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">{meta}</p>
        )}
        {description && variant === "media" && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
    </button>
  );
}
