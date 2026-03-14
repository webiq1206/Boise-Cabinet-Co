import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, User, BookOpen, Phone, Tag, Leaf } from "lucide-react";
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
    return {
      title: "Post Not Found",
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.metaDescription || (post.excerpt.length > 160 
    ? post.excerpt.substring(0, 157) + "..." 
    : post.excerpt);

  return {
    title,
    description,
    alternates: {
      canonical: `https://lawncarekuna.com/blog/${post.slug}`,
    },
    openGraph: {
      title: `${title} | Lawn Care Kuna Blog`,
      description,
      url: `https://lawncarekuna.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary",
      title: `${title} | Lawn Care Kuna Blog`,
      description,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 4);

  const moreRelated = relatedPosts.length < 3
    ? BLOG_POSTS.filter((p) => p.slug !== post.slug && !relatedPosts.find(r => r.slug === p.slug)).slice(0, 3 - relatedPosts.length)
    : [];

  const allRelated = [...relatedPosts, ...moreRelated];

  const bottomRelated = BLOG_POSTS
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

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
      
    <div className="flex flex-col">
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
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

              {/* Tags at bottom of article */}
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

              {/* Mobile-only CTA (below article, shown on small screens) */}
              <div className="lg:hidden mt-10">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Get a Free Quote</h3>
                    <p className="text-sm text-muted-foreground">
                      Ready to transform your lawn? Get a free, no-obligation quote from our team.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/get-quote" data-testid="link-mobile-cta-quote">
                        Get Your Free Quote
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      Or call (208) 352-2011
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar - Desktop only */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0" data-testid="blog-sidebar">
              <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
                {/* CTA Card */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <Leaf className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm">Free Quote</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ready to transform your lawn? Get a free, no-obligation quote from our team.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/get-quote" data-testid="link-sidebar-cta-quote">
                        Get Your Free Quote
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                      <Phone className="h-3 w-3" />
                      (208) 352-2011
                    </p>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                {allRelated.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">Related Articles</h3>
                      </div>
                      <ul className="space-y-3">
                        {allRelated.map((related) => (
                          <li key={related.slug}>
                            <Link 
                              href={`/blog/${related.slug}`}
                              className="group flex gap-3 items-start"
                              data-testid={`link-related-${related.slug}`}
                            >
                              <div className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                  {related.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(related.publishedAt)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-3 border-t">
                        <Link 
                          href="/blog"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          data-testid="link-view-all-articles"
                        >
                          View All Articles
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
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
          <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 mb-6">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help With Your Lawn?
            </h2>
            <p className="text-white/85 mb-8 max-w-lg mx-auto">
              Our team of professionals is ready to help you achieve the perfect lawn. Get a free quote today!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-green-900 hover:bg-white/90 border-0">
                <Link href="/get-quote" data-testid="link-bottom-cta-quote">
                  Get Your Free Lawn Care Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20">
                <Link href="tel:2083522011" data-testid="link-bottom-cta-call">
                  <Phone className="mr-2 h-4 w-4" />
                  (208) 352-2011
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {bottomRelated.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">More Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {bottomRelated.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                    data-testid={`link-more-article-${relatedPost.slug}`}
                  >
                    <Card className="h-full hover-elevate transition-all">
                      <CardContent className="p-5 space-y-3">
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(relatedPost.publishedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
    </>
  );
}
