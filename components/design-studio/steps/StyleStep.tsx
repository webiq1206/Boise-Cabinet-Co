"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "../DesignStudioProvider";
import { DOOR_STYLES } from "@/shared/catalog/doorStyles";
import { FINISH_BY_SLUG } from "@/shared/catalog/finishes";
import {
  getFinishesForDoorStyle,
  getDoorStyleImages,
  getFinishImages,
} from "@/shared/catalog";
import {
  getMostLovedFinishes,
  deriveColorFamily,
  getFinishTone,
  colorFamiliesPresent,
  type ColorFamily,
  type FinishTone,
} from "@/shared/catalog/finishFilters";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VisualOptionGrid } from "@/components/catalog/visual";

/** Curated subset shown before the homeowner asks to see every compatible color. */
const CURATED_FINISH_COUNT = 12;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-8",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function StyleStep({
  embedded = false,
  section = "both",
}: {
  embedded?: boolean;
  /** Render only the door grid, only the finish grid, or both. */
  section?: "door" | "finish" | "both";
}) {
  const { design, updateDesign } = useDesignStudio();
  const showDoor = section === "door" || section === "both";
  const showFinish = section === "finish" || section === "both";

  const [family, setFamily] = useState<ColorFamily | "all">("all");
  const [tone, setTone] = useState<FinishTone | "all">("all");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const doorFinishes = design.doorStyle
    ? getFinishesForDoorStyle(design.doorStyle)
    : getFinishesForDoorStyle("modern-shaker");

  const families = useMemo(
    () => colorFamiliesPresent(doorFinishes),
    [doorFinishes],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      doorFinishes.filter((f) => {
        if (family !== "all" && deriveColorFamily(f) !== family) return false;
        if (tone !== "all" && getFinishTone(f) !== tone) return false;
        if (q && !f.name.toLowerCase().includes(q)) return false;
        return true;
      }),
    [doorFinishes, family, tone, q],
  );
  const filtersActive = family !== "all" || tone !== "all" || q !== "";

  // Progressive disclosure: lead with a curated, most-loved subset, then let the
  // homeowner filter or expand - never a wall of 299 swatches.
  const inScope = useMemo(() => new Set(filtered.map((f) => f.id)), [filtered]);
  const curatedFinishes = useMemo(() => {
    const loved = getMostLovedFinishes(CURATED_FINISH_COUNT).filter((f) =>
      inScope.has(f.id),
    );
    const seen = new Set(loved.map((f) => f.id));
    const filler = filtered.filter((f) => !seen.has(f.id));
    const list = [...loved, ...filler].slice(0, CURATED_FINISH_COUNT);
    const selected = design.finish ? FINISH_BY_SLUG[design.finish] : undefined;
    if (
      selected &&
      inScope.has(selected.id) &&
      !list.some((f) => f.id === selected.id) &&
      list.length > 0
    ) {
      list[list.length - 1] = selected;
    }
    return list;
  }, [filtered, inScope, design.finish]);

  const hasMoreFinishes = !filtersActive && filtered.length > curatedFinishes.length;
  const visibleFinishes = filtersActive || showAll ? filtered : curatedFinishes;

  // Surface a "Most loved" badge on the top few crowd favorites in scope.
  const lovedSet = new Set(
    getMostLovedFinishes(3)
      .filter((f) => inScope.has(f.id))
      .map((f) => f.slug),
  );

  return (
    <div className="space-y-8">
      {!embedded && (
        <div>
          <h2 className="text-2xl font-serif tracking-tight">
            Door style & <em className="brc-accent text-accent">finish</em>
          </h2>
          <p className="text-muted-foreground mt-2">
            Pick the look of your cabinet doors and colors.
          </p>
        </div>
      )}

      {showDoor && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Door style</Label>
          <VisualOptionGrid
            enableZoom
            items={DOOR_STYLES.map((item) => {
              const images = getDoorStyleImages(item.slug, item.imagePath);
              return {
                id: item.slug,
                label: item.name,
                description: item.description,
                imageSrc: images.primary,
                imageAlt: `${item.name} door profile`,
                badge: item.slug === "modern-shaker" ? "Popular" : undefined,
              };
            })}
            selectedId={design.doorStyle ?? undefined}
            onSelect={(slug) => updateDesign({ doorStyle: slug as never })}
            testIdPrefix="button-door-style"
          />
        </div>
      )}

      {showFinish && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="finish-search" className="text-sm font-medium">
              Finish
            </Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {filtered.length} color{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="finish-search"
              type="search"
              placeholder="Search colors (e.g. white, oak, grey)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAll(false);
              }}
              className="h-10 pl-8"
              data-testid="input-finish-search"
            />
          </div>

          <div className="flex flex-wrap gap-1" role="group" aria-label="Color family">
            <FilterChip active={family === "all"} onClick={() => setFamily("all")}>
              All colors
            </FilterChip>
            {families.map((fam) => (
              <FilterChip
                key={fam}
                active={family === fam}
                onClick={() => {
                  setFamily(fam);
                  setShowAll(false);
                }}
              >
                {fam}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap gap-1" role="group" aria-label="Tone">
            {(["all", "light", "dark"] as const).map((t) => (
              <FilterChip
                key={t}
                active={tone === t}
                onClick={() => {
                  setTone(t);
                  setShowAll(false);
                }}
              >
                {t === "all" ? "Any tone" : t === "light" ? "Light" : "Dark"}
              </FilterChip>
            ))}
          </div>

          {visibleFinishes.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No colors match those filters. Try clearing the search or picking
              another family.
            </p>
          ) : (
            <VisualOptionGrid
              className="max-h-[420px] overflow-y-auto pr-1 gap-3"
              columns={4}
              variant="swatch"
              enableZoom
              items={visibleFinishes.map((item) => {
                const images = getFinishImages(item.slug, item.imagePath);
                return {
                  id: item.slug,
                  label: item.name,
                  meta: item.category,
                  imageSrc: images.swatch,
                  imageAlt: `${item.name} finish swatch`,
                  fallbackHex: item.hexColor,
                  badge: lovedSet.has(item.slug) ? "Loved" : undefined,
                  // Lightbox prefers an in-room render, falling back to the swatch.
                  zoomSrc: images.inRoom,
                };
              })}
              selectedId={design.finish ?? undefined}
              onSelect={(slug) => updateDesign({ finish: slug })}
              testIdPrefix="button-finish"
            />
          )}

          {hasMoreFinishes && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              data-testid="button-show-all-finishes"
            >
              See all {filtered.length} compatible colors
            </button>
          )}
          {showAll && !filtersActive && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Show fewer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
