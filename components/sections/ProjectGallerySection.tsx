import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PROJECTS, DESIGN_CONCEPT_DISCLOSURE } from "@/shared/galleryData";
import type { SiteProject } from "@/shared/projects/types";

function ProjectCard({ project }: { project: SiteProject }) {
  const isConcept = project.kind === "concept";
  return (
    <MarketingCard className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        {project.showBeforeAfter && project.before ? (
          <BeforeAfterSlider
            beforeSrc={project.before.src}
            afterSrc={project.hero.src}
            beforeAlt={project.before.alt}
            afterAlt={project.hero.alt}
            aspectClass="aspect-[4/3]"
          />
        ) : (
          <>
            <Image
              src={project.hero.src}
              alt={project.hero.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover img-brand-grade"
            />
            {isConcept && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[12px] tracking-[0.14em] uppercase font-medium">
                Design concept
              </span>
            )}
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-sans font-medium text-sm mb-1 text-foreground">{project.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
      </div>
    </MarketingCard>
  );
}

interface ProjectGallerySectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export function ProjectGallerySection({ limit = 6, showViewAll = true }: ProjectGallerySectionProps) {
  const projects = PROJECTS.slice(0, limit);
  const hasConcept = projects.some((p) => p.kind === "concept");
  const allVerified = projects.length > 0 && !hasConcept;

  return (
    <Section id="gallery" divider>
      <div className="container px-4">
        <SectionHeader
          eyebrow={allVerified ? "Our work" : "Design inspiration"}
          title={
            allVerified
              ? "Cabinet projects across the Treasure Valley"
              : "Cabinet design concepts for Treasure Valley homes"
          }
          description={
            allVerified
              ? "Custom kitchen cabinets, bathroom vanities, and built-in storage completed for Treasure Valley homeowners."
              : "Kitchen cabinets, bathroom vanities, and built-in storage the way we design and build them. A finished look preview for planning your own project."
          }
          align="center"
          className="mb-10 max-w-3xl"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 60}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
        {hasConcept && (
          <p className="mt-6 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            {DESIGN_CONCEPT_DISCLOSURE}
          </p>
        )}
        {showViewAll && (
          <div className="mt-8 text-center">
            <Button variant="brandOutline" asChild>
              <Link href="/testimonials">See more projects and reviews</Link>
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}
