"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Finish, FinishCategory } from "@/shared/catalog";
import { FINISHES, formatPriceTier } from "@/shared/catalog";
import { Chip } from "@/components/marketing/Chip";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<FinishCategory, string> = {
  matte: "Matte",
  gloss: "Gloss",
  woodgrain: "Woodgrain",
};

const FILTER_OPTIONS: Array<{ id: "all" | FinishCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "matte", label: "Matte" },
  { id: "gloss", label: "Gloss" },
  { id: "woodgrain", label: "Woodgrain" },
];

export function FinishSwatch({ finish }: { finish: Finish }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(finish.imagePath) && !imageFailed;

  return (
    <div
      className={cn(
        "aspect-square rounded-sm border border-border shadow-sm overflow-hidden relative",
        finish.category === "woodgrain" && "ring-1 ring-inset ring-black/5",
      )}
      role="img"
      aria-label={`${finish.name} finish swatch`}
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
          alt={`${finish.name} cabinet finish swatch`}
          fill
          sizes="120px"
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}

export interface FinishSwatchGridProps {
  finishes?: Finish[];
  initialCategory?: FinishCategory;
  showCategoryLinks?: boolean;
  className?: string;
}

export function FinishSwatchGrid({
  finishes = FINISHES,
  initialCategory,
  showCategoryLinks = true,
  className,
}: FinishSwatchGridProps) {
  const [active, setActive] = useState<"all" | FinishCategory>(
    initialCategory ?? "all",
  );

  const filtered =
    active === "all" ? finishes : finishes.filter((f) => f.category === active);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            active={active === opt.id}
            onClick={() => setActive(opt.id)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {filtered.map((finish) => {
          return (
            <MarketingCard
              key={finish.id}
              className="p-4 flex flex-col gap-3"
              padding="default"
            >
              <FinishSwatch finish={finish} />
              <div>
                <p className="text-sm font-medium text-foreground">{finish.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {finish.category} · {finish.sheen}
                </p>
                <p
                  className="text-xs text-accent mt-1"
                  data-testid={`text-pricetier-${finish.slug}`}
                >
                  {formatPriceTier(finish)}
                </p>
              </div>
              {showCategoryLinks && (
                <Link
                  href={`/finishes/${finish.category}/${finish.slug}`}
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                >
                  View {finish.name} details
                </Link>
              )}
            </MarketingCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No finishes in this category. Try another filter.
        </p>
      )}
    </div>
  );
}
