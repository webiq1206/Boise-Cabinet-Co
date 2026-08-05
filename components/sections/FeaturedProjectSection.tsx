import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { GALLERY_PROJECTS, DESIGN_CONCEPT_DISCLOSURE } from "@/shared/galleryData";

export function FeaturedProjectSection() {
  const concept = GALLERY_PROJECTS[0];

  return (
    <section id="gallery" className="relative overflow-hidden bg-background section-divider border-t border-border/60">
      <div className="container px-4 pt-16 md:pt-24 pb-10 md:pb-12">
        {/* Centred to match SectionHeader's align="center" convention. The
            eyebrow is a flex row, so it needs its own centring. */}
        <Reveal className="max-w-3xl mx-auto text-center [&_.brc-label]:justify-center">
          <div className="brc-label mb-4">Design concept</div>
          <h2 className="font-sans font-light text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] leading-[1.08] tracking-tight mb-4 text-foreground">
            See what quality cabinetry can{" "}
            <em className="brc-accent text-accent">become</em>
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {concept.description}
          </p>
        </Reveal>
      </div>

      <Reveal delay={60}>
        <div className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden">
          <Image
            src={concept.imageUrl}
            alt={concept.imageAlt}
            fill
            sizes="100vw"
            priority
            className="object-cover img-brand-grade"
          />
          <span className="absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[10px] tracking-[0.14em] uppercase font-medium">
            Design concept
          </span>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-inverse/70 via-inverse/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
            <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
              {concept.title}
            </p>
            <p className="text-sm text-inverse-muted max-w-xl">{DESIGN_CONCEPT_DISCLOSURE}</p>
          </div>
        </div>
      </Reveal>

      <div className="container px-4 py-10 text-center">
        <Reveal delay={120}>
          <Button variant="brandOutline" asChild>
            <Link href="/testimonials">View concepts and reviews</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
