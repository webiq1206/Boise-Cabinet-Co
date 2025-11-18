import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { type Testimonial } from "@shared/schema";
import { Star } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-card-border">
            <CardContent className="p-8">
              <div className="h-4 bg-muted rounded animate-pulse mb-6" />
              <div className="space-y-3">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayTestimonials.map((testimonial) => (
        <Card key={testimonial.id} className="hover-elevate transition-all duration-300 border-card-border" data-testid={`card-testimonial-${testimonial.id}`}>
          <CardContent className="p-8 space-y-6">
            {/* Stars */}
            <div className="flex gap-1" data-testid="rating-stars">
              {Array.from({ length: parseInt(testimonial.rating) }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-brass text-brass" strokeWidth={0} />
              ))}
            </div>

            {/* Quote */}
            <div className="relative">
              <p className="text-base leading-relaxed text-foreground/90 italic" data-testid="text-testimonial">
                "{testimonial.testimonial}"
              </p>
            </div>

            {/* Author */}
            <div className="pt-4 border-t">
              <div className="font-medium text-base" data-testid="text-name">{testimonial.customerName}</div>
              <div className="text-sm text-muted-foreground font-light" data-testid="text-location">
                {testimonial.city.charAt(0).toUpperCase() + testimonial.city.slice(1)}, Idaho
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
