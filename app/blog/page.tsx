import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, PenLine } from "lucide-react";
import { BLOG_POSTS } from "@/shared/blogContent";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  kind: "blog",
  path: "/blog",
});

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const sortedPosts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {/* Hero */}
      <section className="section-y section-divider">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="brc-label justify-center mb-2">Blog</p>
            <h1 className="text-4xl md:text-5xl font-sans font-light tracking-tight text-foreground">
              Remodeling Insights &amp; Ideas
            </h1>
            <p className="text-lg text-muted-foreground">
              Honest advice for Idaho homeowners planning their next renovation.
            </p>
          </div>
        </div>
      </section>

      {/* Posts grid or empty state */}
      <section className="section-y">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            {sortedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 space-y-6">
                <div className="rounded-full bg-muted p-6">
                  <PenLine className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-sans font-light text-foreground">
                    Articles coming soon
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    We&apos;re writing in-depth guides on budgeting, timelines, material selection, and more. Check back soon.
                  </p>
                </div>
                <Button variant="brand" asChild>
                  <Link href="/">
                    Back to home
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPosts.map((post) => (
                  <Card key={post.slug} className="marketing-card hover-elevate flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 font-sans">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" asChild>
                        <Link href={`/blog/${post.slug}`}>
                          Read article <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
