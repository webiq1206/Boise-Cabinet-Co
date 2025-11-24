import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type BlogPost } from "@shared/schema";
import { Calendar, Tag, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    enabled: true,
  });

  // Group posts by category
  const postsByCategory = useMemo(() => {
    if (!posts) return {};
    
    const grouped: Record<string, BlogPost[]> = {};
    posts.forEach(post => {
      if (!grouped[post.category]) {
        grouped[post.category] = [];
      }
      grouped[post.category].push(post);
    });
    
    // Sort posts within each category by date (newest first)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });
    
    return grouped;
  }, [posts]);

  const categories = useMemo(() => Object.keys(postsByCategory).sort(), [postsByCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
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
              {posts && posts.length > 0 && (
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{posts.length} Articles</span>
                  </div>
                  <span>•</span>
                  <span>{categories.length} Categories</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Blog Posts by Category */}
        <section className="py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              {posts && posts.length > 0 ? (
                <div className="space-y-16">
                  {categories.map((category, categoryIndex) => (
                    <div key={category} className="space-y-8" data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {/* Category Header */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h2 className="text-3xl font-serif tracking-tight mb-2">{category}</h2>
                          <div className="h-1 w-20 bg-primary rounded-full"></div>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {postsByCategory[category].length} {postsByCategory[category].length === 1 ? 'Article' : 'Articles'}
                        </Badge>
                      </div>

                      {/* Posts in this category */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {postsByCategory[category].map((post) => (
                          <Card key={post.id} className="hover-elevate transition-all flex flex-col" data-testid={`card-post-${post.slug}`}>
                            <CardHeader className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <div key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                  </div>
                                ))}
                              </div>
                              <CardTitle className="text-xl mb-2 line-clamp-2">
                                <a href={`/blog/${post.slug}`} className="hover:text-primary transition-colors" data-testid={`link-${post.slug}`}>
                                  {post.title}
                                </a>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 text-sm mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                                </span>
                                <span>By {post.author}</span>
                              </CardDescription>
                              <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                            </CardHeader>
                            <CardContent>
                              <Button variant="outline" size="sm" asChild data-testid={`button-read-${post.slug}`}>
                                <a href={`/blog/${post.slug}`}>Read More</a>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Divider between categories (except last one) */}
                      {categoryIndex < categories.length - 1 && (
                        <div className="pt-8">
                          <div className="h-px bg-border"></div>
                        </div>
                      )}
                    </div>
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
