"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { GALLERY_PROJECTS } from "@/shared/galleryData";
import { CITIES } from "@/shared/contentData";

function cityDisplayName(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function FeaturedProjectSection() {
  const project = GALLERY_PROJECTS[0];
  const [showAfter, setShowAfter] = useState(true);
  const cityName = cityDisplayName(project.city);

  return (
    <section id="gallery" className="relative overflow-hidden bg-background section-divider border-t border-border/60">
      <div className="container px-4 py-16 md:py-24">
        <Reveal className="max-w-3xl mb-10 md:mb-14">
          <div className="brc-label mb-4">Featured project</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-4 text-foreground">
            See what a thoughtful remodel can become
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {project.title} in {cityName}, Idaho. Tap or click the image to compare before and after.
          </p>
        </Reveal>

        <Reveal delay={60}>
          <div className="relative max-w-6xl mx-auto">
            <button
              type="button"
              onClick={() => setShowAfter((v) => !v)}
              className="relative block w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Toggle before and after for ${project.title}`}
            >
              <Image
                src={showAfter ? project.afterImageUrl : project.beforeImageUrl}
                alt={
                  showAfter
                    ? `After: ${project.title} in ${cityName}, Idaho`
                    : `Before: ${project.title} in ${cityName}, Idaho`
                }
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <span className="inline-block px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-medium bg-inverse/85 text-inverse-foreground rounded-sm">
                  {showAfter ? "After" : "Before"}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="text-left">
                  <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
                    {project.title}
                  </p>
                  <p className="text-sm text-inverse-muted max-w-xl">{project.description}</p>
                </div>
                <span className="inline-flex self-start md:self-auto px-3 py-1.5 text-[10px] tracking-wide uppercase bg-inverse-foreground/10 text-inverse-foreground rounded-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to compare
                </span>
              </div>
            </button>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-10 text-center">
          <Button variant="brandOutline" asChild>
            <Link href="/testimonials">View all projects and reviews</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
