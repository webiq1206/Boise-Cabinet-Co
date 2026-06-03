"use client";

import { useState, useMemo } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { searchCatalogWithFacets } from "@/shared/catalog";
import type { FinishCategory, CabinetProductCategory } from "@/shared/catalog";
import Link from "next/link";
import { catalogResultHref } from "@/lib/catalog-routes";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [finishCategory, setFinishCategory] = useState<FinishCategory | "">("");
  const [productCategory, setProductCategory] = useState<CabinetProductCategory | "">("");

  const results = useMemo(
    () =>
      searchCatalogWithFacets(query, {
        finishCategory: finishCategory || undefined,
        productCategory: productCategory || undefined,
      }),
    [query, finishCategory, productCategory],
  );

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4 max-w-2xl">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Search" }]} />
          <PageHeader
            align="left"
            className="mt-6"
            title="Search catalog"
            description="Find finishes, door styles, collections, and cabinet configurations."
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code…"
            className="w-full mt-6 rounded-md border border-input bg-background px-4 py-3 text-sm"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {(["matte", "gloss", "woodgrain"] as FinishCategory[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFinishCategory(finishCategory === c ? "" : c)}
                className={`text-xs rounded-full border px-3 py-1 capitalize ${finishCategory === c ? "border-primary bg-primary/5" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {results.slice(0, 40).map((r) => (
              <li key={`${r.type}-${r.slug}`}>
                <Link
                  href={catalogResultHref(r)}
                  className="block rounded-lg border p-3 hover:border-primary/50"
                >
                  <span className="text-xs text-muted-foreground uppercase">{r.type}</span>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{r.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
