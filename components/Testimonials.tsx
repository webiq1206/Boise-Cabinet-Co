"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  id: number;
  customerName: string;
  testimonial: string;
  rating: string;
  city: string;
  serviceType?: string;
  createdAt?: string;
}

interface TestimonialsProps {
  serviceType?: string;
  limit?: number;
}

export function Testimonials({ serviceType, limit = 24 }: TestimonialsProps) {
  const [isPaused, setIsPaused] = useState(false);
  
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: serviceType ? ['/api/testimonials', serviceType] : ['/api/testimonials'],
    queryFn: async () => {
      const url = serviceType 
        ? `/api/testimonials?serviceType=${serviceType}&limit=${limit}` 
        : `/api/testimonials?limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex-shrink-0 w-[340px] border-card-border">
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

  const duplicatedTestimonials = [...testimonials, ...testimonials];
  const cardWidth = 340;
  const gap = 24;
  const totalWidth = testimonials.length * (cardWidth + gap);
  const duration = testimonials.length * 5;

  return (
    <div 
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="container-testimonials-carousel"
    >
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${totalWidth}px);
          }
        }
        .scroll-animation {
          animation: scroll ${duration}s linear infinite;
        }
        .scroll-animation.paused {
          animation-play-state: paused;
        }
      `}</style>
      
      <div 
        className={`flex gap-6 scroll-animation ${isPaused ? 'paused' : ''}`}
        style={{ width: `${totalWidth * 2}px` }}
        data-testid="list-testimonials"
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <Card 
            key={`${testimonial.id}-${index}`} 
            className="flex-shrink-0 w-[340px] hover-elevate transition-all duration-300 border-card-border bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background"
            data-testid={`card-testimonial-${testimonial.id}-${index}`}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: parseInt(testimonial.rating) }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" strokeWidth={0} aria-hidden="true" />
                ))}
              </div>

              <p 
                className="text-sm leading-relaxed text-foreground/90 italic line-clamp-4"
                data-testid={`text-testimonial-quote-${testimonial.id}`}
              >
                "{testimonial.testimonial}"
              </p>

              <div className="pt-3 border-t">
                <div className="font-medium text-sm" data-testid={`text-testimonial-name-${testimonial.id}`}>
                  {testimonial.customerName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {testimonial.city.charAt(0).toUpperCase() + testimonial.city.slice(1)}, Idaho
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" aria-hidden="true" />
    </div>
  );
}
