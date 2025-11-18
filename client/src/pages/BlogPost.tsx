import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type BlogPost as BlogPostType } from "@shared/schema";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: post, isLoading } = useQuery<BlogPostType>({
    queryKey: ['/api/blog', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse mb-4" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-8" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <a href="/blog">Back to Blog</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen">
        <article className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              {/* Back button */}
              <Button variant="ghost" asChild className="mb-8" data-testid="button-back">
                <a href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </a>
              </Button>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <div key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-title">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-12 pb-8 border-b">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                </span>
                <span>By {post.author}</span>
                <span>{post.category}</span>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert" data-testid="content-post">
                {post.content.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-12 pt-8 border-t">
                <div className="bg-muted/50 rounded-md p-8 text-center">
                  <h3 className="text-2xl font-bold mb-3">
                    Need Professional Lawn Care?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Let our experienced team take care of your yard
                  </p>
                  <Button size="lg" asChild data-testid="button-get-quote">
                    <a href="/contact">Get Free Quote</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
  );
}
