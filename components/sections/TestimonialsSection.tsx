import { Star } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { AggregateRating } from "@/components/marketing/AggregateRating";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/shared/testimonialsData";
import { CITIES, SERVICES } from "@/shared/contentData";

function serviceLabel(slug: string) {
  return SERVICES.find((s) => s.slug === slug)?.name ?? slug;
}

function cityLabel(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, idx) => (
        <Star key={idx} className="h-3.5 w-3.5" style={{ fill: "var(--ed-accent)", color: "var(--ed-accent)" }} aria-hidden="true" />
      ))}
    </div>
  );
}

interface TestimonialsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

/**
 * Homeowner reviews.
 *
 * THE PAGE'S ONE LIGHT BAND. The site is deliberately dark-dominant, and reviews
 * are the content that most rewards the break: a quotation set large in the
 * serif on a bone ground reads like a page from a printed portfolio, and the
 * tonal shift marks the move from "what we make" to "what people say".
 *
 * WAS a centred quote over two review cards. NOW the featured quote at lede
 * scale beside the heading, and the remaining reviews in a hairline matrix.
 */
export function TestimonialsSection({ limit = 4, showViewAll = true }: TestimonialsSectionProps) {
  const items = TESTIMONIALS.slice(0, limit);
  const [featured, ...rest] = items;

  return (
    <Section id="testimonials" surface="bone" spacing="xl">
      <div className="ed-shell">
        <div className="ed-split ed-split-narrow">
          <Reveal>
            <p className="ed-eyebrow">Homeowner reviews</p>
            <h2 className="ed-h2 ed-statement">
              Trusted for{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                craftsmanship
              </em>{" "}
              and communication
            </h2>
            {/* Aggregate rating - quantified proof leads the section. Renders
                only when real review data is configured (SITE_CONFIG.trust). */}
            <AggregateRating className="mt-8" />
          </Reveal>

          {featured && (
            <Reveal delay={60}>
              <figure className="m-0">
                <StarRow count={Number(featured.rating) || 5} />
                <blockquote className="ed-lede mt-5 text-[clamp(1.25rem,1.9vw,1.75rem)] leading-[1.35]">
                  &ldquo;{featured.testimonial}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t pt-4" style={{ borderColor: "var(--ed-line)" }}>
                  <p className="ed-h4 text-[1.0625rem]">{featured.customerName}</p>
                  <p className="ed-small mt-1">
                    {serviceLabel(featured.serviceType)} · {cityLabel(featured.city)}, Idaho
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>

        {rest.length > 0 && (
          <Reveal delay={100}>
            <div
              className="ed-matrix mt-[clamp(48px,6vw,88px)]"
              style={{ ["--ed-cols" as string]: Math.min(rest.length, 3), ["--ed-cell-h" as string]: "240px" }}
            >
              {rest.map((item) => (
                <figure key={item.customerName} className="m-0 flex flex-col">
                  <StarRow count={Number(item.rating) || 5} />
                  <blockquote className="ed-body mt-4 flex-1 text-[0.9375rem]">
                    &ldquo;{item.testimonial}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t pt-4" style={{ borderColor: "var(--ed-line)" }}>
                    <p className="ed-h4 text-[1rem]">{item.customerName}</p>
                    <p className="ed-small mt-1">
                      {serviceLabel(item.serviceType)} · {cityLabel(item.city)}, Idaho
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        )}

        {showViewAll && (
          <div className="mt-12">
            <Button variant="brandOutline" asChild>
              <Link href="/testimonials">Read all reviews</Link>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
