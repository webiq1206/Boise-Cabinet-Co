"use client";

import Image from "next/image";
import { useState } from "react";
import type { Finish } from "@/shared/catalog";
import { getFinishImages } from "@/shared/catalog/entityImages";
import { cn } from "@/lib/utils";

export interface FinishDualPreviewProps {
  finish: Finish;
  className?: string;
}

export function FinishDualPreview({ finish, className }: FinishDualPreviewProps) {
  const { swatch, inRoom } = getFinishImages(finish.slug, finish.imagePath);
  const [swatchFailed, setSwatchFailed] = useState(false);
  const [inRoomFailed, setInRoomFailed] = useState(false);

  return (
    <div className={cn("grid sm:grid-cols-2 gap-4", className)}>
      <figure className="space-y-2">
        <div className="relative aspect-square max-w-[200px] rounded-lg border border-border overflow-hidden bg-muted shadow-sm">
          {!swatchFailed ? (
            <Image
              src={swatch}
              alt={`${finish.name} finish swatch`}
              fill
              sizes="200px"
              className="object-cover"
              priority
              onError={() => setSwatchFailed(true)}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: finish.hexColor }} />
          )}
        </div>
        <figcaption className="text-xs text-muted-foreground">Swatch</figcaption>
      </figure>
      <figure className="space-y-2">
        <div className="relative aspect-[16/10] rounded-lg border border-border overflow-hidden bg-muted shadow-sm">
          {!inRoomFailed ? (
            <Image
              src={inRoom}
              alt={`${finish.name} on kitchen cabinets`}
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-cover"
              onError={() => setInRoomFailed(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"
              style={{ backgroundColor: finish.hexColor }}
            >
              In-room preview
            </div>
          )}
        </div>
        <figcaption className="text-xs text-muted-foreground">In kitchen context</figcaption>
      </figure>
    </div>
  );
}
