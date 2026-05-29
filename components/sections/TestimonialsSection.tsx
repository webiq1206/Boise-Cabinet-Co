"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/shared/testimonialsData";
import { CITIES, SERVICES } from "@/shared/contentData";

function serviceLabel(slug: string) {
  return SERVICES.find((s) => s.slug === slug)?.name ?? slug;
}

function cityLabel(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

interface TestimonialsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export function TestimonialsSection({ limit = 4, showViewAll = true }: TestimonialsSectionProps) {
  const items = TESTIMONIALS.slice(0, limit);

  return (
    <Section id="testimonials" variant="surface" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Homeowner reviews"
          title="Trusted by Treasure Valley homeowners"
          description="Clear communication, reliable timelines, and craftsmanship homeowners notice every day."
          className="mb-10 max-w-3xl"
        />
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <Reveal key={item.customerName} delay={i * 70}>
              <MarketingCard className="h-full">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: Number(item.rating) || 5 }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-muted-foreground mb-6">
                  &ldquo;{item.testimonial}&rdquo;
                </blockquote>
                <div className="pt-4 border-t border-border">
                  <p className="font-medium text-sm text-foreground">{item.customerName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {serviceLabel(item.serviceType)} · {cityLabel(item.city)}, Idaho
                  </p>
                </div>
              </MarketingCard>
            </Reveal>
          ))}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Button variant="brandOutline" asChild>
              <Link href="/testimonials">Read all reviews</Link>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
