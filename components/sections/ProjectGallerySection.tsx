import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import {
  GALLERY_PROJECTS,
  DESIGN_CONCEPT_DISCLOSURE,
  type DesignConcept,
} from "@/shared/galleryData";

function ConceptCard({ concept }: { concept: DesignConcept }) {
  return (
    <MarketingCard className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={concept.imageUrl}
          alt={concept.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover img-brand-grade"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[10px] tracking-[0.14em] uppercase font-medium">
          Design concept
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-sans font-medium text-sm mb-1 text-foreground">{concept.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{concept.description}</p>
      </div>
    </MarketingCard>
  );
}

interface ProjectGallerySectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export function ProjectGallerySection({ limit = 6, showViewAll = true }: ProjectGallerySectionProps) {
  const concepts = GALLERY_PROJECTS.slice(0, limit);

  return (
    <Section id="gallery" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow="Design inspiration"
          title="Cabinet design concepts for Treasure Valley homes"
          description="Kitchen cabinets, bathroom vanities, and built-in storage the way we design and build them. A finished look preview for planning your own project."
          align="center"
          className="mb-10 max-w-3xl"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {concepts.map((concept, i) => (
            <Reveal key={concept.title} delay={i * 60}>
              <ConceptCard concept={concept} />
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          {DESIGN_CONCEPT_DISCLOSURE}
        </p>
        {showViewAll && (
          <div className="mt-8 text-center">
            <Button variant="brandOutline" asChild>
              <Link href="/testimonials">See more concepts and reviews</Link>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
