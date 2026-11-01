"use client";

/**
 * One finish swatch. Its own module so article catalog embeds (server
 * rendered) can show a swatch without importing FinishSwatchGrid, which loads
 * the full finish library for its grid. FinishSwatchGrid re-exports it.
 */
import Image from "next/image";
import { useState } from "react";
import type { Finish } from "@/shared/catalog";
import { finishAlt } from "@/shared/catalog/altText";
import { cn } from "@/lib/utils";

export function FinishSwatch({ finish }: { finish: Finish }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(finish.imagePath) && !imageFailed;
  const alt = finishAlt(finish);

  return (
    <div
      className={cn(
        "aspect-square rounded-sm border border-border shadow-sm overflow-hidden relative",
        finish.category === "woodgrain" && "ring-1 ring-inset ring-black/5",
      )}
      role="img"
      aria-label={alt}
    >
      {/* Flat color tile always renders beneath, so there is never a blank or
          broken swatch; a real image (when one exists) layers on top. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: finish.hexColor || "hsl(var(--muted))" }}
      />
      {showImage && (
        <Image
          src={finish.imagePath!}
          alt={alt}
          fill
          sizes="120px"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
