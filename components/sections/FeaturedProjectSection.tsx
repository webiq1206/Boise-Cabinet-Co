import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PROJECTS, DESIGN_CONCEPT_DISCLOSURE } from "@/shared/galleryData";

export function FeaturedProjectSection() {
  const project = PROJECTS[0];
  if (!project) return null;
  const isConcept = project.kind === "concept";
  const showSlider = project.showBeforeAfter && project.before;

  return (
    <section id="gallery" className="relative overflow-hidden bg-background section-divider border-t border-border/60">
      <div className="ed-shell pt-[var(--ed-pad)] pb-[clamp(32px,4vw,56px)]">
        <div className="ed-split ed-split-end">
          <Reveal>
            <p className="ed-eyebrow">{isConcept ? "Design concept" : "Featured project"}</p>
            <h2 className="ed-h2 ed-statement">
              See what quality cabinetry can{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                become
              </em>
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="ed-body">
              {isConcept ? project.description : `${project.title}. ${project.description}`}
            </p>
          </Reveal>
        </div>
      </div>

      <Reveal delay={60}>
        {showSlider && project.before ? (
          <BeforeAfterSlider
            beforeSrc={project.before.src}
            afterSrc={project.hero.src}
            beforeAlt={project.before.alt}
            afterAlt={project.hero.alt}
            aspectClass="aspect-[16/10] md:aspect-[16/9]"
            sizes="100vw"
            caption={
              <>
                <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
                  {project.title}
                </p>
                <p className="text-sm text-inverse-muted max-w-xl">{project.description}</p>
              </>
            }
          />
        ) : (
          <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden">
            <Image
              src={project.hero.src}
              alt={project.hero.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover img-brand-grade"
            />
            {isConcept && (
              <span className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[12px] tracking-[0.14em] uppercase font-medium">
                Design concept
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-inverse/50 via-inverse/15 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
              <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
                {project.title}
              </p>
              <p className="text-sm text-inverse-muted max-w-xl">
                {isConcept ? DESIGN_CONCEPT_DISCLOSURE : project.description}
              </p>
            </div>
          </div>
        )}
      </Reveal>

      <div className="ed-shell py-10">
        <Reveal delay={120}>
          <Button variant="brandOutline" asChild>
            <Link href="/testimonials">View projects and reviews</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
