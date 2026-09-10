"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchCatalog, type CatalogSearchResult } from "@/shared/catalog";
import { catalogResultHref } from "@/lib/catalog-routes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<CatalogSearchResult["type"], string> = {
  collection: "Collection",
  doorStyle: "Door style",
  finish: "Finish",
  room: "Room",
  accessory: "Accessory",
  hardware: "Hardware",
  cabinetType: "Cabinet type",
  cabinetProduct: "Cabinet product",
};

export interface CatalogSearchProps {
  placeholder?: string;
  className?: string;
  maxResults?: number;
}

export function CatalogSearch({
  placeholder = "Search collections, finishes, door styles…",
  className,
  maxResults = 8,
}: CatalogSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setResults([]);
        setOpen(false);
        return;
      }
      setResults(searchCatalog(trimmed).slice(0, maxResults));
      setOpen(true);
    },
    [maxResults],
  );

  useEffect(() => {
    const id = window.setTimeout(() => runSearch(query), 200);
    return () => window.clearTimeout(id);
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative max-w-xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          aria-label="Search product catalog"
          role="combobox"
          aria-expanded={open}
          aria-controls="catalog-search-results"
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id="catalog-search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-md border border-border bg-card shadow-lg overflow-hidden"
        >
          {results.map((result) => (
            <li key={`${result.type}-${result.slug}`} role="option" aria-selected={false}>
              <Link
                href={catalogResultHref(result)}
                className="block px-4 py-3 hover:bg-muted/60 transition-colors"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {TYPE_LABELS[result.type]}
                </span>
                <p className="text-sm font-medium text-foreground">{result.name}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {result.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <p className="absolute z-50 mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
          No catalog matches. Try collections, finishes, or room names.
        </p>
      )}
    </div>
  );
}
