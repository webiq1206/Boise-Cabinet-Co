import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { type Testimonial } from "@shared/schema";
import { Star, Quote } from "lucide-react";

interface TestimonialsProps {
  serviceType?: string;
  limit?: number;
}

export function Testimonials({ serviceType, limit }: TestimonialsProps) {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: serviceType ? ['/api/testimonials', serviceType] : ['/api/testimonials'],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const displayTestimonials = limit ? testimonials.slice(0, limit) : testimonials;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="hover-elevate transition-all" data-testid={`card-testimonial-${testimonial.id}`}>
          <CardContent className="p-6 space-y-4">
            {/* Stars */}
            <div className="flex gap-1" data-testid="rating-stars">
              {Array.from({ length: parseInt(testimonial.rating) }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>

            {/* Quote */}
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 h-6 w-6 text-muted-foreground/20" />
              <p className="text-sm leading-relaxed pl-4" data-testid="text-testimonial">
                {testimonial.testimonial}
              </p>
            </div>

            {/* Author */}
            <div className="pt-4 border-t">
              <div className="font-medium" data-testid="text-name">{testimonial.customerName}</div>
              <div className="text-sm text-muted-foreground" data-testid="text-location">
                {testimonial.city.charAt(0).toUpperCase() + testimonial.city.slice(1)}, ID
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
