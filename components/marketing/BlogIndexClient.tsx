"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PenLine, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogCard } from "@/components/marketing/BlogCard";
import { Chip } from "@/components/marketing/Chip";
import { BLOG_POSTS } from "@/shared/blogContent";
import {
  CONTENT_HUBS,
  categoryHubPath,
  isCategoryHubIndexable,
} from "@/shared/contentHubs";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogIndexClient() {
  const sortedPosts = useMemo(
    () =>
      [...BLOG_POSTS].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    []
  );

  const indexableHubs = useMemo(
    () =>
      [...CONTENT_HUBS]
        .sort((a, b) => a.priorityTier - b.priorityTier)
        .filter((hub) => {
          const count = sortedPosts.filter((p) => p.hubSlug === hub.hubSlug).length;
          return count > 0 && isCategoryHubIndexable(hub.hubSlug, count);
        }),
    [sortedPosts],
  );

  const PAGE_SIZE = 9;
  const [activeHub, setActiveHub] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");

  function selectHub(hub: string | null) {
    setActiveHub(hub);
    setVisibleCount(PAGE_SIZE);
  }

  function resetFilters() {
    setActiveHub(null);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
  }

  const byHub = activeHub ? sortedPosts.filter((p) => p.hubSlug === activeHub) : sortedPosts;

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? byHub.filter(
        (p) =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.excerpt.toLowerCase().includes(normalizedQuery),
      )
    : byHub;

  const activeHubMeta = activeHub
    ? CONTENT_HUBS.find((h) => h.hubSlug === activeHub)
    : undefined;

  const hasActiveFilters = !!activeHub || !!normalizedQuery;

  // A search match skips the spotlighted "featured" card - search results
  // read better as an even grid than a single pick standing out from the rest.
  const featured = normalizedQuery ? undefined : filtered[0];
  const rest = normalizedQuery ? filtered : filtered.slice(1);

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" divider>
        <div className="container px-4">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Blog" }]} />
          <PageHeader
            eyebrow="Blog"
            title="Cabinet Planning Insights"
            description="Honest advice for Idaho homeowners planning kitchen cabinets, vanities, and storage."
          />
        </div>
      </Section>

      <Section spacing="default" className="!pt-0">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            {sortedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 space-y-6">
                <div className="rounded-full bg-muted p-6">
                  <PenLine className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-serif text-foreground">Articles coming soon</h2>
                <p className="text-muted-foreground max-w-md">
                  We&apos;re writing in-depth guides on budgeting, timelines, and more.
                </p>
                <Button variant="brand" asChild>
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="relative max-w-md mx-auto mb-6">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    role="searchbox"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    placeholder="Search articles"
                    aria-label="Search articles"
                    className="pl-10 pr-10"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {indexableHubs.length >= 2 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <Chip active={!activeHub} onClick={() => selectHub(null)}>
                      All topics
                    </Chip>
                    {indexableHubs.map((hub) => (
                      <Chip
                        key={hub.hubSlug}
                        active={activeHub === hub.hubSlug}
                        onClick={() => selectHub(hub.hubSlug)}
                      >
                        {hub.title}
                      </Chip>
                    ))}
                  </div>
                )}

                {activeHubMeta && (
                  <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
                    Showing articles in{' '}
                    <span className="text-foreground">{activeHubMeta.title}</span>.{' '}
                    <Link
                      href={categoryHubPath(activeHubMeta.hubSlug)}
                      className="text-accent hover:underline"
                    >
                      View topic hub
                    </Link>
                  </p>
                )}

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <div className="rounded-full bg-muted p-5">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-serif text-foreground">
                      No articles match{query ? ` "${query}"` : " this filter"}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                      Try a different search term or browse all topics instead.
                    </p>
                    {hasActiveFilters && (
                      <Button variant="brandOutline" onClick={resetFilters}>
                        Reset filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                {featured && (
                  <div className="mb-10">
                    <BlogCard post={featured} featured formatDate={formatDate} />
                  </div>
                )}

                {rest.length > 0 && (
                  <>
                    {featured && (
                      <div role="presentation" className="border-t border-border/60 mb-10" />
                    )}
                    <div className="ed-cards-3 gap-6">
                      {rest.slice(0, visibleCount).map((post) => (
                        <BlogCard key={post.slug} post={post} formatDate={formatDate} />
                      ))}
                    </div>
                    {rest.length > visibleCount && (
                      <div className="mt-10 flex flex-col items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                          Showing {(featured ? 1 : 0) + Math.min(visibleCount, rest.length)} of{' '}
                          {filtered.length} articles
                        </p>
                        <Button
                          variant="brandOutline"
                          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        >
                          Load more articles
                        </Button>
                      </div>
                    )}
                  </>
                )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
