import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type BlogPost } from "@shared/schema";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-64 bg-muted rounded animate-pulse mb-4" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse mb-12" />
            <div className="grid gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Lawn Care Blog
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Expert tips and seasonal guides for beautiful Idaho lawns
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {posts && posts.length > 0 ? (
                <div className="grid gap-8">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover-elevate transition-all" data-testid={`card-post-${post.slug}`}>
                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <div key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </div>
                          ))}
                        </div>
                        <CardTitle className="text-2xl mb-2">
                          <a href={`/blog/${post.slug}`} className="hover:text-primary transition-colors" data-testid={`link-${post.slug}`}>
                            {post.title}
                          </a>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                          </span>
                          <span>By {post.author}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                        <Button variant="outline" asChild data-testid={`button-read-${post.slug}`}>
                          <a href={`/blog/${post.slug}`}>Read More</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
  );
}
