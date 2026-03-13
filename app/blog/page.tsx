import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import { BLOG_POSTS } from "@/shared/blogContent";
import { generateWebPageSchema, generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Care Blog | Tips & Guides | Lawn Care Kuna",
  description: "Expert lawn care tips, guides, and advice for Idaho homeowners. Learn about lawn maintenance, landscaping, irrigation, and seasonal care from Lawn Care Kuna.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Lawn Care Blog | Lawn Care Kuna",
    description: "Expert lawn care tips and guides for Idaho homeowners.",
    url: "/blog",
    type: "website",
  },
};

// Schema markup
const webPageSchema = generateWebPageSchema({
  title: "Lawn Care Blog",
  description: "Expert lawn care tips, guides, and advice for Idaho homeowners.",
  url: "/blog",
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Blog", url: "/blog" },
]);

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BlogPage() {
  // Sort blog posts by date (newest first)
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Lawn Care Blog</h1>
            <p className="text-lg text-muted-foreground">
              Expert tips, guides, and advice for maintaining a beautiful lawn in Idaho
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPosts.map((post) => (
                <Card key={post.slug} className="hover-elevate flex flex-col bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-primary" asChild>
                      <Link href={`/blog/${post.slug}`}>
                        Read More <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Need Professional Lawn Care Help?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              While our blog is full of helpful tips, sometimes you need the professionals. Contact us for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                <Link href="/services">View Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
