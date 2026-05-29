"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { GALLERY_PROJECTS, type GalleryProject } from "@/shared/galleryData";
import { CITIES } from "@/shared/contentData";

function cityDisplayName(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

function BeforeAfterCard({ project }: { project: GalleryProject }) {
  const [showAfter, setShowAfter] = useState(false);
  const cityName = cityDisplayName(project.city);

  return (
    <MarketingCard className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setShowAfter((v) => !v)}
        className="relative block w-full aspect-[4/3] cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase font-medium bg-inverse/80 text-inverse-foreground rounded-sm">
            {showAfter ? "After" : "Before"}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-inverse/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] tracking-wide uppercase text-inverse-muted">Tap to compare</p>
        </div>
      </button>
      <div className="p-5">
        <h3 className="font-sans font-medium text-sm mb-1 text-foreground">{project.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
      </div>
    </MarketingCard>
  );
}

interface ProjectGallerySectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export function ProjectGallerySection({ limit = 6, showViewAll = true }: ProjectGallerySectionProps) {
  const projects = GALLERY_PROJECTS.slice(0, limit);

  return (
    <Section id="gallery" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Our work"
          title="Transformations across the Treasure Valley"
          description="Explore recent kitchen, bathroom, whole-home, and addition projects. Tap any photo to compare before and after."
          className="mb-10 max-w-3xl"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 60}>
              <BeforeAfterCard project={project} />
            </Reveal>
          ))}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Button variant="brandOutline" asChild>
              <Link href="/testimonials">See more projects and reviews</Link>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
