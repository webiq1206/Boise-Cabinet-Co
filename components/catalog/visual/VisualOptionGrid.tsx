"use client";

import { VisualOptionTile, type VisualOptionVariant } from "./VisualOptionTile";
import { cn } from "@/lib/utils";

export interface VisualOptionItem {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  fallbackHex?: string;
  /** Optional recommendation badge, e.g. "Popular" or "Most loved". */
  badge?: string;
  /** Larger/alternate image for the lightbox (falls back to imageSrc). */
  zoomSrc?: string;
}

export interface VisualOptionGridProps {
  items: VisualOptionItem[];
  /** Single-select active id */
  selectedId?: string;
  /** Multi-select active ids */
  selectedIds?: string[];
  onSelect: (id: string) => void;
  testIdPrefix?: string;
  className?: string;
  columns?: "auto" | 2 | 3 | 4;
  /** Tile layout - "media" (image-forward) or "swatch" (compact square) */
  variant?: VisualOptionVariant;
  /** Show a zoom/lightbox control on each tile. */
  enableZoom?: boolean;
}

const COLUMN_CLASS: Record<NonNullable<VisualOptionGridProps["columns"]>, string> = {
  auto: "sm:grid-cols-2 lg:grid-cols-3",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function VisualOptionGrid({
  items,
  selectedId,
  selectedIds,
  onSelect,
  testIdPrefix = "option",
  className,
  columns = "auto",
  variant = "media",
  enableZoom = false,
}: VisualOptionGridProps) {
  const isSelected = (id: string) =>
    selectedIds ? selectedIds.includes(id) : selectedId === id;

  return (
    <div className={cn("grid gap-2", COLUMN_CLASS[columns], className)}>
      {items.map((item) => (
        <VisualOptionTile
          key={item.id}
          label={item.label}
          description={item.description}
          meta={typeof item.meta === "string" ? item.meta : undefined}
          imageSrc={item.imageSrc}
          imageAlt={item.imageAlt}
          fallbackHex={item.fallbackHex}
          badge={item.badge}
          enableZoom={enableZoom}
          zoomSrc={item.zoomSrc}
          selected={isSelected(item.id)}
          variant={variant}
          onSelect={() => onSelect(item.id)}
          testId={`${testIdPrefix}-${item.id}`}
        />
      ))}
    </div>
  );
}
