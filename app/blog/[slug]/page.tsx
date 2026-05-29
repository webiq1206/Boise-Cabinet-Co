import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, User, Phone, Tag, Wrench } from "lucide-react";
import { BLOG_POSTS } from "@/shared/blogContent";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/schema";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.seoTitle || post.title;
  const description =
    post.metaDescription ||
    (post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + "..." : post.excerpt);

  return {
    title,
    description,
    alternates: {
      canonical: `https://boiseremodeling.co/blog/${post.slug}`,
    },
    openGraph: {
      title: `${title} | Boise Remodeling Co Blog`,
      description,
      url: `https://boiseremodeling.co/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Boise Remodeling Co Blog`,
      description,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    publishedAt: post.publishedAt,
    author: post.author,
    slug: post.slug,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="flex flex-col pb-20 md:pb-0">
        {/* Hero */}
        <section className="relative py-12 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto lg:mx-0 lg:max-w-4xl">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                data-testid="link-back-to-blog"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0" data-testid="badge-category">
                  {post.category}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content + Sidebar */}
        <section className="py-10 md:py-14">
          <div className="container px-4">
            <div className="flex gap-10 max-w-6xl mx-auto">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <article className="blog-content" data-testid="blog-content">
                  {post.content && (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  )}
                </article>

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t" data-testid="blog-tags">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile-only CTA */}
                <div className="lg:hidden mt-10">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Book a Free Visit</h3>
                      <p className="text-sm text-muted-foreground">
                        Ready to start your project? Schedule a free in-home consultation — no pressure.
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/#consult" data-testid="link-mobile-cta-consult">
                          Book a Free Visit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Phone className="h-3 w-3" />
                        Or call (208) 555-0100
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar - Desktop only */}
              <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0" data-testid="blog-sidebar">
                <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm">Free Consultation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Planning a remodel? Get a free in-home visit and rough estimate from our team.
                      </p>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/#consult" data-testid="link-sidebar-cta-consult">
                          Book a Free Visit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                        <Phone className="h-3 w-3" />
                        (208) 555-0100
                      </p>
                    </CardContent>
                  </Card>

                  {post.tags && post.tags.length > 0 && (
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-sm">Topics</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 md:py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto rounded-md bg-foreground text-background p-10 md:p-16 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-6">
                <Wrench className="h-7 w-7 text-primary/80" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                Ready to start your project?
              </h2>
              <p className="text-background/80 mb-8 max-w-lg mx-auto">
                Book a free in-home visit. We&apos;ll walk your space, hear your goals, and give you a range on the spot — no obligation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/#consult" data-testid="link-bottom-cta-consult">
                    Book a Free Visit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-background/30 text-background bg-background/10" asChild>
                  <a href="tel:2085550100" data-testid="link-bottom-cta-call">
                    <Phone className="mr-2 h-4 w-4" />
                    (208) 555-0100
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
