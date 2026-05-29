"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { GALLERY_PROJECTS } from "@/shared/galleryData";
import { CITIES } from "@/shared/contentData";

function cityDisplayName(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function FeaturedProjectSection() {
  const project = GALLERY_PROJECTS[0];
  const [showAfter, setShowAfter] = useState(false);
  const cityName = cityDisplayName(project.city);

  return (
    <section id="gallery" className="relative overflow-hidden bg-background section-divider border-t border-border/60">
      <div className="container px-4 pt-16 md:pt-24 pb-10 md:pb-12">
        <Reveal className="max-w-3xl">
          <div className="brc-label mb-4">Featured project</div>
          <h2 className="font-serif font-light text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] leading-[1.08] tracking-tight mb-4 text-foreground">
            See what a thoughtful remodel can{" "}
            <em className="brc-accent text-accent">become</em>
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {project.title} in {cityName}, Idaho.
          </p>
        </Reveal>
      </div>

      <Reveal delay={60}>
        <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden">
          <Image
            src={showAfter ? project.afterImageUrl : project.beforeImageUrl}
            alt={
              showAfter
                ? `After: ${project.title} in ${cityName}, Idaho`
                : `Before: ${project.title} in ${cityName}, Idaho`
            }
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-2">
            <button
              type="button"
              onClick={() => setShowAfter(false)}
              className={cn(
                "px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-medium rounded-sm transition-colors",
                !showAfter
                  ? "bg-inverse text-inverse-foreground"
                  : "bg-inverse/50 text-inverse-foreground/80 hover:bg-inverse/70"
              )}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => setShowAfter(true)}
              className={cn(
                "px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase font-medium rounded-sm transition-colors",
                showAfter
                  ? "bg-inverse text-inverse-foreground"
                  : "bg-inverse/50 text-inverse-foreground/80 hover:bg-inverse/70"
              )}
            >
              After
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
            <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
              {project.title}
            </p>
            <p className="text-sm text-inverse-muted max-w-xl">{project.description}</p>
          </div>
        </div>
      </Reveal>

      <div className="container px-4 py-10 text-center">
        <Reveal delay={120}>
          <Button variant="brandOutline" asChild>
            <Link href="/testimonials">View all projects and reviews</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
