import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PROJECTS } from "@/shared/galleryData";
import type { SiteProject } from "@/shared/projects/types";

function ProjectCard({ project }: { project: SiteProject }) {
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
          </>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif font-medium text-sm mb-1 text-foreground">{project.title}</h3>
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
  const allVerified = projects.length > 0 && projects.every((project) => project.kind !== "concept");

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
        <div className="ed-cards-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 60}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
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
