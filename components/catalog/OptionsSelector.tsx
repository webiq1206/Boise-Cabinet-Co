"use client";

/**
 * One reusable, three-layer options selector used everywhere options appear
 * (finishes, doors):
 *   1. Curated start - opens on a small "most-loved" / "most popular" set.
 *   2. Filter by how people think - chip filters (color, light/dark, type, price).
 *   3. Reveal on demand - a single "See all N" control expands the full library.
 *
 * It never renders the full wall up front, and accepts pre-applied filters /
 * expansion so the finder and Design Studio can drive it later.
 */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Finish, FinishCategory, FinishFilters, CabinetProduct, Accessory } from "@/shared/catalog";
import {
  FINISHES,
  DOOR_STYLES,
  CABINET_PRODUCTS,
  ACCESSORIES,
  formatPriceTier,
  formatCabinetDimensions,
  getCabinetNeedLabel,
  getMostLovedFinishes,
  getPopularDoorStyles,
  deriveColorFamily,
  getFinishTone,
  colorFamiliesPresent,
  priceTiersPresent,
  type DoorStyle,
} from "@/shared/catalog";
import { getProductImages } from "@/shared/catalog/entityImages";
import { getAccessoryImagePath } from "@/shared/catalog/catalogImages";
import { Chip } from "@/components/marketing/Chip";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FinishSwatch } from "./FinishSwatchGrid";
import { DoorStyleHero } from "./DoorStyleHero";

// ── Generic shell ─────────────────────────────────────────────────────────────

export interface OptionsFilterGroup<T> {
  id: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  match: (item: T, value: string) => boolean;
}

export interface OptionsSelectorProps<T> {
  items: T[];
  curated: T[];
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  filterGroups?: OptionsFilterGroup<T>[];
  curatedLabel: string;
  nounSingular: string;
  nounPlural: string;
  initialFilters?: Record<string, string>;
  initialExpanded?: boolean;
  gridClassName?: string;
  className?: string;
}

const DEFAULT_GRID = "ed-cards-3 gap-4 md:gap-6";

export function OptionsSelector<T>({
  items,
  curated,
  getId,
  renderItem,
  filterGroups = [],
  curatedLabel,
  nounSingular,
  nounPlural,
  initialFilters,
  initialExpanded = false,
  gridClassName = DEFAULT_GRID,
  className,
}: OptionsSelectorProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters ?? {});
  const [expanded, setExpanded] = useState(initialExpanded);

  const groupById = useMemo(
    () => new Map(filterGroups.map((g) => [g.id, g] as const)),
    [filterGroups],
  );

  const activeEntries = Object.entries(filters).filter(([, v]) => Boolean(v));
  const hasActiveFilters = activeEntries.length > 0;
  const showFull = expanded || hasActiveFilters;

  const filtered = useMemo(() => {
    if (!hasActiveFilters) return items;
    return items.filter((item) =>
      activeEntries.every(([gid, value]) => {
        const g = groupById.get(gid);
        return g ? g.match(item, value) : true;
      }),
    );
  }, [items, activeEntries, groupById, hasActiveFilters]);

  const visible = showFull ? filtered : curated;

  function toggle(groupId: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (next[groupId] === value) delete next[groupId];
      else next[groupId] = value;
      return next;
    });
  }

  function reset() {
    setFilters({});
    setExpanded(false);
  }

  return (
    <div className={className}>
      {filterGroups.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {filterGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={filters[group.id] === opt.value}
                    onClick={() => toggle(group.id, opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-muted-foreground" data-testid="text-options-count">
          {showFull
            ? `Showing ${visible.length} of ${items.length} ${
                items.length === 1 ? nounSingular : nounPlural
              }`
            : `${curatedLabel} · ${curated.length} to start`}
        </p>
        {showFull ? (
          <Button variant="ghost" size="sm" onClick={reset} data-testid="button-options-reset">
            Back to {curatedLabel.toLowerCase()}
          </Button>
        ) : (
          <Button
            variant="brandOutline"
            size="sm"
            onClick={() => setExpanded(true)}
            data-testid="button-options-seeall"
          >
            See all {items.length} {nounPlural}
          </Button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className={gridClassName}>
          {visible.map((item) => (
            <div key={getId(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">
          No {nounPlural} match those filters. Try fewer.
        </p>
      )}
    </div>
  );
}

// ── Finish selector ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<FinishCategory, string> = {
  matte: "Matte",
  gloss: "Gloss",
  woodgrain: "Woodgrain",
};

function FinishCard({ finish, showLink }: { finish: Finish; showLink: boolean }) {
  return (
    <MarketingCard className="p-4 flex flex-col gap-3 h-full" padding="default">
      <FinishSwatch finish={finish} />
      <div>
        <p className="text-sm font-medium text-foreground" data-testid={`text-finish-${finish.slug}`}>
          {finish.name}
        </p>
        <p className="text-sm text-muted-foreground">{deriveColorFamily(finish)}</p>
        <p className="text-sm text-accent mt-1" data-testid={`text-pricetier-${finish.slug}`}>
          {formatPriceTier(finish)}
        </p>
      </div>
      {showLink && (
        <Link
          href="/catalog"
          className="mt-auto text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          View {finish.name} details
        </Link>
      )}
    </MarketingCard>
  );
}

export interface FinishOptionsSelectorProps {
  finishes?: Finish[];
  curated?: Finish[];
  initialFilters?: FinishFilters;
  initialExpanded?: boolean;
  /** When true, the finish-type chips are hidden (the page already scopes a category). */
  lockCategory?: boolean;
  showLinks?: boolean;
  className?: string;
}

export function FinishOptionsSelector({
  finishes = FINISHES,
  curated,
  initialFilters,
  initialExpanded = false,
  lockCategory = false,
  showLinks = true,
  className,
}: FinishOptionsSelectorProps) {
  const idsInScope = new Set(finishes.map((f) => f.id));
  let curatedList = (curated ?? getMostLovedFinishes(6)).filter((f) => idsInScope.has(f.id));
  if (curatedList.length === 0) curatedList = finishes.slice(0, 6);

  const groups: OptionsFilterGroup<Finish>[] = [];

  const families = colorFamiliesPresent(finishes);
  if (families.length > 1) {
    groups.push({
      id: "colorFamily",
      label: "Color",
      options: families.map((f) => ({ value: f, label: f })),
      match: (it, v) => deriveColorFamily(it) === v,
    });
  }

  const tones = new Set(finishes.map((f) => getFinishTone(f)));
  if (tones.size > 1) {
    groups.push({
      id: "tone",
      label: "Light or dark",
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ],
      match: (it, v) => getFinishTone(it) === v,
    });
  }

  if (!lockCategory) {
    const cats = new Set(finishes.map((f) => f.category));
    if (cats.size > 1) {
      groups.push({
        id: "category",
        label: "Finish type",
        options: (["matte", "gloss", "woodgrain"] as FinishCategory[])
          .filter((c) => cats.has(c))
          .map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
        match: (it, v) => it.category === v,
      });
    }
  }

  const tiers = priceTiersPresent(finishes);
  if (tiers.length > 1) {
    groups.push({
      id: "price",
      label: "Price",
      options: tiers.map((t) => ({
        value: String(t),
        label: formatPriceTier({ priceTierMarker: t }),
      })),
      match: (it, v) => String(it.priceTierMarker || 1) === v,
    });
  }

  const initRecord: Record<string, string> = {};
  if (initialFilters?.colorFamily) initRecord.colorFamily = initialFilters.colorFamily;
  if (initialFilters?.tone) initRecord.tone = initialFilters.tone;
  if (initialFilters?.category && !lockCategory) initRecord.category = initialFilters.category;
  if (initialFilters?.priceTier) initRecord.price = String(initialFilters.priceTier);

  return (
    <OptionsSelector<Finish>
      className={className}
      items={finishes}
      curated={curatedList}
      filterGroups={groups}
      getId={(f) => f.id}
      renderItem={(f) => <FinishCard finish={f} showLink={showLinks} />}
      curatedLabel="Most-loved finishes"
      nounSingular="finish"
      nounPlural="finishes"
      initialFilters={initRecord}
      initialExpanded={initialExpanded}
    />
  );
}

// ── Door selector ─────────────────────────────────────────────────────────────

function DoorCard({ style }: { style: DoorStyle }) {
  return (
    <Link
      href="/catalog"
      className="block h-full group"
      data-testid={`link-door-${style.slug}`}
    >
      <MarketingCard className="h-full flex flex-col p-0 overflow-hidden brc-lift transition-colors">
        <DoorStyleHero slug={style.slug} name={style.name} className="rounded-none" />
        <div className="p-6 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {style.compatibleFinishCategories.map((cat) => (
              <Chip key={cat} className="capitalize">
                {cat}
              </Chip>
            ))}
          </div>
          <h2 className="text-lg font-serif tracking-tight mb-2 group-hover:text-primary transition-colors">
            {style.name}
          </h2>
          <p className="text-base text-muted-foreground flex-1 line-clamp-4 leading-relaxed">
            {style.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
            View details →
          </span>
        </div>
      </MarketingCard>
    </Link>
  );
}

export interface DoorOptionsSelectorProps {
  doors?: DoorStyle[];
  initialExpanded?: boolean;
  className?: string;
}

export function DoorOptionsSelector({
  doors = DOOR_STYLES,
  initialExpanded = false,
  className,
}: DoorOptionsSelectorProps) {
  const idsInScope = new Set(doors.map((d) => d.id));
  let curatedList = getPopularDoorStyles(3).filter((d) => idsInScope.has(d.id));
  if (curatedList.length === 0) curatedList = doors.slice(0, 3);

  return (
    <OptionsSelector<DoorStyle>
      className={className}
      items={doors}
      curated={curatedList}
      getId={(d) => d.id}
      renderItem={(d) => <DoorCard style={d} />}
      curatedLabel="Most popular doors"
      nounSingular="door style"
      nounPlural="door styles"
      initialExpanded={initialExpanded}
      gridClassName="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    />
  );
}

// ── Cabinet selector ──────────────────────────────────────────────────────────

function CabinetCard({ product }: { product: CabinetProduct }) {
  const diagram = getProductImages(product).diagram;
  const need = getCabinetNeedLabel(product);
  const dims = formatCabinetDimensions(product);
  return (
    <Link
      href="/catalog"
      className="group block h-full"
    >
      <MarketingCard className="p-0 flex flex-col h-full overflow-hidden" padding="none">
        <div className="relative aspect-[3/4] bg-muted">
          {/* Generated front-elevation box diagram; never shows the SKU code. */}
          <Image
            src={diagram}
            alt={`${product.name} front elevation`}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-contain"
          />
        </div>
        <div className="p-4 flex flex-col gap-1">
          <Chip className="self-start mb-1">{need}</Chip>
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <p className="text-sm text-muted-foreground">{dims}</p>
        </div>
      </MarketingCard>
    </Link>
  );
}

export interface CabinetOptionsSelectorProps {
  cabinets?: CabinetProduct[];
  curated?: CabinetProduct[];
  initialFilters?: Record<string, string>;
  initialExpanded?: boolean;
  className?: string;
}

export function CabinetOptionsSelector({
  cabinets = CABINET_PRODUCTS,
  curated,
  initialFilters,
  initialExpanded = false,
  className,
}: CabinetOptionsSelectorProps) {
  // Start with different cabinet types instead of six size variants of one box.
  const seenCategories = new Set<string>();
  const typeExamples = cabinets.filter((cabinet) => {
    if (seenCategories.has(cabinet.category)) return false;
    seenCategories.add(cabinet.category);
    return true;
  }).slice(0, 3);
  const curatedList = curated?.length ? curated : typeExamples;

  const groups: OptionsFilterGroup<CabinetProduct>[] = [];

  // Need-based filter (homeowner-first): "Pots & pans", "Corner storage", etc.
  const needs = Array.from(new Set(cabinets.map((c) => getCabinetNeedLabel(c)))).sort();
  if (needs.length > 1) {
    groups.push({
      id: "need",
      label: "What it's for",
      options: needs.map((n) => ({ value: n, label: n })),
      match: (it, v) => getCabinetNeedLabel(it) === v,
    });
  }

  // Cabinet type filter.
  const CAT_LABELS: Record<string, string> = {
    base: "Base",
    wall: "Wall",
    tall: "Tall",
    vanity: "Vanity",
    "floating-shelf": "Open shelf",
    hood: "Range hood",
    filler: "Trim",
    "end-panel": "End panel",
    panel: "Panel",
  };
  const cats = Array.from(new Set(cabinets.map((c) => c.category)));
  if (cats.length > 1) {
    groups.push({
      id: "category",
      label: "Cabinet type",
      options: cats.map((c) => ({ value: c, label: CAT_LABELS[c] ?? c })),
      match: (it, v) => it.category === v,
    });
  }

  return (
    <OptionsSelector<CabinetProduct>
      className={className}
      items={cabinets}
      curated={curatedList}
      filterGroups={groups}
      getId={(c) => c.slug}
      renderItem={(c) => <CabinetCard product={c} />}
      curatedLabel="Explore cabinet types"
      nounSingular="cabinet"
      nounPlural="cabinets"
      initialFilters={initialFilters}
      initialExpanded={initialExpanded}
      gridClassName="ed-cards-3 gap-4 md:gap-6"
    />
  );
}

// ── Accessory selector ────────────────────────────────────────────────────────

function AccessoryCard({ accessory }: { accessory: Accessory }) {
  const img = getAccessoryImagePath(accessory.slug);
  return (
    <MarketingCard className="p-0 flex flex-col h-full overflow-hidden" padding="none">
      <div className="relative aspect-square bg-muted">
        {img ? (
          <Image
            src={img}
            alt={accessory.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <Chip className="self-start mb-1 capitalize">{accessory.category}</Chip>
        <p className="text-sm font-medium text-foreground">{accessory.name}</p>
        <p className="text-sm text-muted-foreground line-clamp-3">{accessory.description}</p>
      </div>
    </MarketingCard>
  );
}

export interface AccessoryOptionsSelectorProps {
  accessories?: Accessory[];
  initialFilters?: Record<string, string>;
  initialExpanded?: boolean;
  className?: string;
}

export function AccessoryOptionsSelector({
  accessories = ACCESSORIES,
  initialFilters,
  initialExpanded = true,
  className,
}: AccessoryOptionsSelectorProps) {
  const groups: OptionsFilterGroup<Accessory>[] = [];
  const cats = Array.from(new Set(accessories.map((a) => a.category)));
  if (cats.length > 1) {
    groups.push({
      id: "category",
      label: "Type",
      options: cats.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
      match: (it, v) => it.category === v,
    });
  }

  return (
    <OptionsSelector<Accessory>
      className={className}
      items={accessories}
      curated={accessories}
      filterGroups={groups}
      getId={(a) => a.slug}
      renderItem={(a) => <AccessoryCard accessory={a} />}
      curatedLabel="All accessories"
      nounSingular="accessory"
      nounPlural="accessories"
      initialFilters={initialFilters}
      initialExpanded={initialExpanded}
      gridClassName="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6"
    />
  );
}
