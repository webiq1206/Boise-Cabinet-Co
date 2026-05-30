"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { BlogCard } from "@/components/marketing/BlogCard";
import { Chip } from "@/components/marketing/Chip";
import { BLOG_POSTS } from "@/shared/blogContent";

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

  const categories = useMemo(
    () => Array.from(new Set(sortedPosts.map((p) => p.category))).sort(),
    [sortedPosts]
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? sortedPosts.filter((p) => p.category === activeCategory)
    : sortedPosts;

  const [featured, ...rest] = filtered;

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" divider>
        <div className="container px-4">
          <PageHeader
            eyebrow="Blog"
            title="Remodeling Insights & Ideas"
            description="Honest advice for Idaho homeowners planning their next renovation."
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
                <h2 className="text-2xl font-sans font-light text-foreground">Articles coming soon</h2>
                <p className="text-muted-foreground max-w-md">
                  We&apos;re writing in-depth guides on budgeting, timelines, and more.
                </p>
                <Button variant="brand" asChild>
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <>
                {categories.length >= 3 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-10">
                    <Chip active={!activeCategory} onClick={() => setActiveCategory(null)}>
                      All
                    </Chip>
                    {categories.map((cat) => (
                      <Chip
                        key={cat}
                        active={activeCategory === cat}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </Chip>
                    ))}
                  </div>
                )}

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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rest.map((post) => (
                        <BlogCard key={post.slug} post={post} formatDate={formatDate} />
                      ))}
                    </div>
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
