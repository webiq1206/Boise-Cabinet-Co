"use client";

import { VisualOptionTile } from "./VisualOptionTile";

export interface VisualOptionItem {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  imageSrc?: string;
  imageAlt?: string;
  fallbackHex?: string;
}

export interface VisualOptionGridProps {
  items: VisualOptionItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  testIdPrefix?: string;
  className?: string;
  columns?: "auto" | 2 | 3;
}

const COLUMN_CLASS: Record<NonNullable<VisualOptionGridProps["columns"]>, string> = {
  auto: "sm:grid-cols-2 lg:grid-cols-3",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function VisualOptionGrid({
  items,
  selectedId,
  onSelect,
  testIdPrefix = "option",
  className,
  columns = "auto",
}: VisualOptionGridProps) {
  return (
    <div className={`grid gap-2 ${COLUMN_CLASS[columns]} ${className ?? ""}`}>
      {items.map((item) => (
        <VisualOptionTile
          key={item.id}
          label={item.label}
          description={item.description}
          meta={item.meta}
          imageSrc={item.imageSrc}
          imageAlt={item.imageAlt}
          fallbackHex={item.fallbackHex}
          selected={selectedId === item.id}
          onSelect={() => onSelect(item.id)}
          testId={`${testIdPrefix}-${item.id}`}
        />
      ))}
    </div>
  );
}
