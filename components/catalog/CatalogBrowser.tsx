"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/marketing/Chip";
import { Button } from "@/components/ui/button";
import {
  CABINET_PRODUCTS,
  COLLECTIONS,
  DOOR_STYLES,
  FINISHES,
  HARDWARE_OPTIONS,
  ACCESSORY_FAMILIES,
  FINISH_BY_SLUG,
  getDoorStyleImages,
  getProductImages,
  getHardwareImagePath,
  getAccessoryFamilyImagePath,
  searchCatalog,
  pickSearchResultImage,
  COLOR_FAMILIES,
  deriveColorFamily,
  getFinishTone,
  finishMatchesFilters,
  doorStyleAlt,
  finishAlt,
  cabinetAlt,
  collectionAlt,
  hardwareAlt,
  accessoryAlt,
  seoAlt,
  type ColorFamily,
  type FinishTone,
  type FinishCategory,
  type CabinetProductCategory,
  type Finish,
} from "@/shared/catalog";
import { catalogResultHref } from "@/lib/catalog-routes";

type BrowseTab =
  | "all"
  | "doorStyle"
  | "finish"
  | "cabinetProduct"
  | "collection"
  | "hardware"
  | "accessory";

interface BrowseItem {
  key: string;
  href: string;
  name: string;
  alt: string;
  meta?: string;
  imageSrc?: string;
  fallbackColor?: string;
  variant: "media" | "swatch";
  contain?: boolean;
  finish?: Finish;
}

const TABS: { id: BrowseTab; label: string; count: number }[] = [
  { id: "all", label: "Everything", count: 0 },
  { id: "doorStyle", label: "Door styles", count: DOOR_STYLES.length },
  { id: "finish", label: "Finishes", count: FINISHES.length },
  { id: "cabinetProduct", label: "Cabinets", count: CABINET_PRODUCTS.length },
  { id: "collection", label: "Collections", count: COLLECTIONS.length },
  { id: "hardware", label: "Hardware", count: HARDWARE_OPTIONS.length },
  { id: "accessory", label: "Accessories", count: ACCESSORY_FAMILIES.length },
];

const CABINET_CATEGORIES: { id: CabinetProductCategory; label: string }[] = [
  { id: "base", label: "Base" },
  { id: "wall", label: "Wall" },
  { id: "tall", label: "Tall" },
  { id: "vanity", label: "Vanity" },
  { id: "hood", label: "Hoods" },
  { id: "floating-shelf", label: "Shelves" },
  { id: "filler", label: "Fillers" },
  { id: "panel", label: "Panels" },
  { id: "end-panel", label: "End panels" },
];

const FINISH_CATEGORIES: { id: FinishCategory; label: string }[] = [
  { id: "matte", label: "Matte" },
  { id: "gloss", label: "Gloss" },
  { id: "woodgrain", label: "Woodgrain" },
];

const PAGE_SIZE = 24;

// ── Item builders (all driven by the catalog SSOT) ───────────────────────────

function doorItem(d: (typeof DOOR_STYLES)[number]): BrowseItem {
  return {
    key: `doorStyle-${d.slug}`,
    href: `/door-styles/${d.slug}`,
    name: d.name,
    alt: doorStyleAlt(d),
    meta: "Door style",
    imageSrc: getDoorStyleImages(d.slug, d.imagePath).primary,
    variant: "media",
  };
}

function finishItem(f: Finish): BrowseItem {
  return {
    key: `finish-${f.slug}`,
    href: `/finishes/${f.category}/${f.slug}`,
    name: f.name,
    alt: finishAlt(f),
    meta: `${f.category} · ${f.sheen}`,
    variant: "swatch",
    finish: f,
  };
}

function cabinetItem(p: (typeof CABINET_PRODUCTS)[number]): BrowseItem {
  return {
    key: `cabinetProduct-${p.slug}`,
    href: `/products/${p.category}/${p.slug}`,
    name: p.name,
    alt: cabinetAlt(p),
    meta: p.category.replace(/-/g, " "),
    imageSrc: getProductImages(p).thumb,
    variant: "media",
    contain: true,
  };
}

function collectionItem(c: (typeof COLLECTIONS)[number]): BrowseItem {
  return {
    key: `collection-${c.slug}`,
    href: `/collections/${c.slug}`,
    name: c.name,
    alt: collectionAlt(c),
    meta: c.tagline,
    imageSrc: c.heroImage,
    variant: "media",
  };
}

function hardwareItem(h: (typeof HARDWARE_OPTIONS)[number]): BrowseItem {
  return {
    key: `hardware-${h.slug}`,
    href: "/hardware",
    name: h.name,
    alt: hardwareAlt(h),
    meta: h.category,
    imageSrc: getHardwareImagePath(h.slug),
    variant: "swatch",
  };
}

function accessoryItem(a: (typeof ACCESSORY_FAMILIES)[number]): BrowseItem {
  return {
    key: `accessory-${a.slug}`,
    href: `/products/base?family=${a.slug}`,
    name: a.name,
    alt: accessoryAlt(a),
    meta: "Accessory family",
    imageSrc: getAccessoryFamilyImagePath(a.slug),
    variant: "swatch",
  };
}

export function CatalogBrowser({ className }: { className?: string }) {
  const [tab, setTab] = useState<BrowseTab>("all");
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [colorFamily, setColorFamily] = useState<ColorFamily | "">("");
  const [tone, setTone] = useState<FinishTone | "">("");
  const [finishCategory, setFinishCategory] = useState<FinishCategory | "">("");
  const [cabinetCategory, setCabinetCategory] = useState<CabinetProductCategory | "">("");
  const [sort, setSort] = useState<"featured" | "az">("featured");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Debounce the search input so typing stays smooth across the full catalog.
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 180);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Reset pagination whenever the active view changes.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [tab, query, colorFamily, tone, finishCategory, cabinetCategory, sort]);

  const finishFilters = useMemo(
    () => ({
      colorFamily: colorFamily || undefined,
      tone: tone || undefined,
      category: finishCategory || undefined,
    }),
    [colorFamily, tone, finishCategory],
  );

  // Build the full (unpaginated) result set for the current view.
  const items = useMemo<BrowseItem[]>(() => {
    if (query) {
      const results = searchCatalog(query);
      const mapped: BrowseItem[] = [];
      for (const r of results) {
        if (tab !== "all" && r.type !== tab) continue;
        if (r.type === "finish") {
          const f = FINISH_BY_SLUG[r.slug];
          if (f && !finishMatchesFilters(f, finishFilters)) continue;
        }
        if (
          r.type === "cabinetProduct" &&
          cabinetCategory &&
          CABINET_PRODUCTS.find((p) => p.slug === r.slug)?.category !== cabinetCategory
        ) {
          continue;
        }
        const swatch = r.type === "finish" || r.type === "hardware" || r.type === "accessory";
        mapped.push({
          key: `${r.type}-${r.slug}`,
          href: catalogResultHref(r),
          name: r.name,
          alt: seoAlt(r.name, "custom cabinetry", r.slug),
          meta: r.type.replace(/([A-Z])/g, " $1").toLowerCase(),
          imageSrc: pickSearchResultImage({ type: r.type, slug: r.slug, imagePath: r.imagePath }),
          variant: swatch ? "swatch" : "media",
          contain: r.type === "cabinetProduct",
          finish: r.type === "finish" ? FINISH_BY_SLUG[r.slug] : undefined,
        });
      }
      return mapped;
    }

    let list: BrowseItem[] = [];
    switch (tab) {
      case "doorStyle":
        list = DOOR_STYLES.map(doorItem);
        break;
      case "finish":
        list = FINISHES.filter((f) => finishMatchesFilters(f, finishFilters)).map(finishItem);
        break;
      case "cabinetProduct":
        list = CABINET_PRODUCTS.filter(
          (p) => !cabinetCategory || p.category === cabinetCategory,
        ).map(cabinetItem);
        break;
      case "collection":
        list = COLLECTIONS.map(collectionItem);
        break;
      case "hardware":
        list = HARDWARE_OPTIONS.map(hardwareItem);
        break;
      case "accessory":
        list = ACCESSORY_FAMILIES.map(accessoryItem);
        break;
      case "all":
      default:
        list = [
          ...DOOR_STYLES.map(doorItem),
          ...COLLECTIONS.map(collectionItem),
          ...FINISHES.filter((f) => finishMatchesFilters(f, finishFilters)).map(finishItem),
          ...CABINET_PRODUCTS.map(cabinetItem),
          ...HARDWARE_OPTIONS.map(hardwareItem),
          ...ACCESSORY_FAMILIES.map(accessoryItem),
        ];
        break;
    }

    if (sort === "az") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [tab, query, finishFilters, cabinetCategory, sort]);

  const visible = items.slice(0, limit);
  const showFinishFilters = !query && (tab === "finish" || tab === "all");
  const showCabinetFilters = !query && tab === "cabinetProduct";

  return (
    <div className={cn("flex flex-col gap-6", className)} ref={gridTopRef}>
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="Search the entire catalog by name…"
          aria-label="Search the catalog"
          data-testid="catalog-search-input"
          className="w-full rounded-md border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Entity-type tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catalog categories">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            data-testid={`catalog-tab-${t.id}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === t.id
                ? "border-foreground/40 bg-muted/50 font-medium text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contextual filters + sort */}
      {(showFinishFilters || showCabinetFilters) && (
        <div className="flex flex-col gap-3 border-y py-4">
          {showFinishFilters && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Color
                </span>
                {COLOR_FAMILIES.map((fam) => (
                  <Chip
                    key={fam}
                    active={colorFamily === fam}
                    onClick={() => setColorFamily(colorFamily === fam ? "" : fam)}
                  >
                    {fam}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </span>
                {FINISH_CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    active={finishCategory === c.id}
                    onClick={() => setFinishCategory(finishCategory === c.id ? "" : c.id)}
                  >
                    {c.label}
                  </Chip>
                ))}
                {(["light", "dark"] as FinishTone[]).map((t) => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(tone === t ? "" : t)}>
                    {t === "light" ? "Light" : "Dark"}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {showCabinetFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </span>
              {CABINET_CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  active={cabinetCategory === c.id}
                  onClick={() => setCabinetCategory(cabinetCategory === c.id ? "" : c.id)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {items.length} {items.length === 1 ? "result" : "results"}
          {query && (
            <>
              {" "}
              for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
            </>
          )}
        </p>
        {!query && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "featured" | "az")}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              aria-label="Sort results"
            >
              <option value="featured">Featured</option>
              <option value="az">Name (A–Z)</option>
            </select>
          </label>
        )}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No matches. Try a different search or clear the filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item) => (
            <BrowseTileLink key={item.key} item={item} />
          ))}
        </div>
      )}

      {visible.length < items.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="brandOutline"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
            data-testid="catalog-load-more"
          >
            Show more ({items.length - visible.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

function BrowseTileLink({ item }: { item: BrowseItem }) {
  return (
    <Link
      href={item.href}
      data-testid={`catalog-item-${item.key}`}
      className="group flex flex-col gap-2 rounded-md border border-border bg-card p-2 transition-colors hover:border-accent/60"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border/50 bg-muted">
        {item.finish ? (
          <>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: item.finish.hexColor || "hsl(var(--muted))" }}
            />
            {item.finish.imagePath && (
              <Image
                src={item.finish.imagePath}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, 220px"
                className="object-cover"
              />
            )}
          </>
        ) : item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 50vw, 220px"
            className={cn(item.contain ? "object-contain p-2" : "object-cover img-brand-grade")}
          />
        ) : item.fallbackColor ? (
          <div className="absolute inset-0" style={{ backgroundColor: item.fallbackColor }} />
        ) : null}
      </div>
      <div className="min-w-0 px-0.5 pb-0.5">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        {item.meta && (
          <p className="truncate text-[11px] capitalize text-muted-foreground">{item.meta}</p>
        )}
      </div>
      <span className="mt-auto flex items-center gap-1 px-0.5 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        View details <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
