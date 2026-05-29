"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveHorizontal } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { GALLERY_PROJECTS } from "@/shared/galleryData";
import { CITIES } from "@/shared/contentData";

function cityDisplayName(slug: string) {
  return CITIES.find((c) => c.slug === slug)?.name ?? slug;
}

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: React.ReactNode;
}

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  caption,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [pos, setPos] = useState(50);
  const instructionsId = useId();

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, next)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden select-none touch-none cursor-ew-resize"
      onPointerDown={(e) => {
        draggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
      onLostPointerCapture={() => {
        draggingRef.current = false;
      }}
      data-testid="slider-before-after"
    >
      <p id={instructionsId} className="sr-only">
        {beforeAlt} on the left, {afterAlt} on the right. Drag the handle, or use
        the arrow keys, Home, and End to reveal the transformation.
      </p>

      {/* After image (base layer) */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes="100vw"
        className="object-cover pointer-events-none"
        priority
      />

      {/* Before image (clipped overlay, revealed on the left) — decorative to avoid duplicate announcements */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Corner labels */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3 py-1.5 rounded-sm bg-inverse/80 text-inverse-foreground text-[10px] tracking-[0.12em] uppercase font-medium pointer-events-none">
        Before
      </div>
      <div className="absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1.5 rounded-sm bg-inverse/80 text-inverse-foreground text-[10px] tracking-[0.12em] uppercase font-medium pointer-events-none">
        After
      </div>

      {/* Divider line + drag handle */}
      <div
        className="absolute inset-y-0 z-10 w-px bg-inverse-foreground/90 pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-0.5px)" }}
      >
        <button
          type="button"
          role="slider"
          aria-label="Compare before and after"
          aria-orientation="horizontal"
          aria-describedby={instructionsId}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              setPos((p) => Math.max(0, p - 4));
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              setPos((p) => Math.min(100, p + 4));
            } else if (e.key === "Home") {
              e.preventDefault();
              setPos(0);
            } else if (e.key === "End") {
              e.preventDefault();
              setPos(100);
            }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-inverse-foreground text-inverse shadow-md pointer-events-auto cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-testid="handle-before-after"
        >
          <MoveHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-inverse/70 via-inverse/20 to-transparent pointer-events-none" />
      )}
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 pointer-events-none">
          {caption}
        </div>
      )}
    </div>
  );
}

export function FeaturedProjectSection() {
  const project = GALLERY_PROJECTS[0];
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
            {project.title} in {cityName}, Idaho. Drag to reveal the transformation.
          </p>
        </Reveal>
      </div>

      <Reveal delay={60}>
        <BeforeAfterSlider
          beforeSrc={project.beforeImageUrl}
          afterSrc={project.afterImageUrl}
          beforeAlt={`Before: ${project.title} in ${cityName}, Idaho`}
          afterAlt={`After: ${project.title} in ${cityName}, Idaho`}
          caption={
            <>
              <p className="font-sans font-medium text-sm text-inverse-foreground mb-1">
                {project.title}
              </p>
              <p className="text-sm text-inverse-muted max-w-xl">{project.description}</p>
            </>
          }
        />
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
