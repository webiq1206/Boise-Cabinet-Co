import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { type BlogPost as BlogPostType } from "@shared/schema";
import { Calendar, ArrowLeft, Tag, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: post, isLoading } = useQuery<BlogPostType>({
    queryKey: ['/api/blog', slug],
    enabled: !!slug,
  });

  // Calculate reading time (rough estimate: 200 words per minute)
  const readingTime = post ? Math.ceil(post.content.split(/\s+/).length / 200) : 0;

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
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <div className="mb-8">
                <Button variant="ghost" asChild data-testid="button-back">
                  <a href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Blog
                  </a>
                </Button>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-title">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-foreground/80">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <div key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground/70 text-xs font-medium rounded-md hover-elevate">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="py-12 md:py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="lg:flex lg:gap-12">
                {/* Article Content */}
                <div className="lg:flex-1 lg:min-w-0">
                  {/* Key Takeaways Box */}
                  <Card className="mb-12 bg-primary/5 border-primary/20">
                    <div className="p-6 md:p-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        Key Takeaways
                      </h3>
                      <ul className="space-y-2 text-sm text-foreground/80">
                        <li className="flex gap-3">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Expert lawn care tips specifically for the Treasure Valley climate</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Practical advice you can implement right away</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Professional insights from experienced lawn care specialists</span>
                        </li>
                      </ul>
                    </div>
                  </Card>

                  {/* Article Text */}
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert
                      prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/50
                      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                      prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-6
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-ul:my-6 prose-ul:space-y-2
                      prose-li:text-foreground/80
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    data-testid="content-post"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* FAQs Section */}
                  {post.faqs && post.faqs.length > 0 && (
                    <div className="mt-16" data-testid="section-faqs">
                      <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border/50">
                        Frequently Asked Questions
                      </h2>
                      <Accordion type="single" collapsible className="space-y-4">
                        {post.faqs.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`faq-${index}`}
                            className="border rounded-lg px-6 bg-muted/30"
                            data-testid={`faq-item-${index}`}
                          >
                            <AccordionTrigger 
                              className="text-left text-base font-semibold hover:no-underline py-5"
                              data-testid={`faq-question-${index}`}
                            >
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent 
                              className="text-muted-foreground text-sm pb-5"
                              data-testid={`faq-answer-${index}`}
                            >
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}

                  {/* Bottom CTA */}
                  <div className="mt-16 pt-8 border-t">
                    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                      <div className="p-8 md:p-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          Ready for a Beautiful Lawn?
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Get expert lawn care from our professional team. Serving Kuna, Boise, Meridian, Eagle, Star, and Middleton.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button size="lg" asChild data-testid="button-get-quote">
                            <a href="/contact">Get Free Quote</a>
                          </Button>
                          <Button size="lg" variant="outline" asChild>
                            <a href="/services">View All Services</a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block lg:w-[280px] lg:flex-shrink-0 lg:sticky lg:top-24">
                  <div className="space-y-6">
                    {/* Author Info */}
                    <Card>
                      <div className="p-6">
                        <h4 className="font-bold mb-3">About the Author</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{post.author}</p>
                            <p className="text-xs text-muted-foreground">Lawn Care Expert</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Professional lawn care specialists serving the Treasure Valley with expertise in Idaho's unique climate and soil conditions.
                        </p>
                      </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-muted/30">
                      <div className="p-6">
                        <h4 className="font-bold mb-4">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <a href="/services">View Services</a>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <a href="/contact">Contact Us</a>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <a href="/blog">More Articles</a>
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Categories */}
                    <Card>
                      <div className="p-6">
                        <h4 className="font-bold mb-4">Categories</h4>
                        <div className="space-y-2">
                          <a href="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                            Seasonal Guides
                          </a>
                          <a href="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                            Lawn Maintenance
                          </a>
                          <a href="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                            Lawn Problems
                          </a>
                        </div>
                      </div>
                    </Card>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </article>
      </div>
  );
}
