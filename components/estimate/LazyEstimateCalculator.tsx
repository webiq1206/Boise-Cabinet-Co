"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/components/marketing";
import { ESTIMATE_VALUE_PROP } from "@/shared/estimateEngine";

const EstimateCalculator = dynamic(
  () => import("@/components/EstimateCalculator").then((m) => m.EstimateCalculator),
  { ssr: false },
);

// Defers loading + hydrating the estimator wizard (a large client island) until
// the homepage section nears the viewport, keeping it out of the initial route
// JS and improving LCP/INP on first paint. Renders a same-height placeholder so
// there is no layout shift (CLS) when the real component mounts.
export function LazyEstimateCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [show]);

  // The homepage already has a dedicated `#consult` consultation form (and many
  // CTAs anchor to it), so "Book your visit" scrolls there - prefilled live from
  // the estimate - rather than the estimator rendering its own contact step.
  function handleBookVisit() {
    const el = document.getElementById("consult");
    if (!el) return;
    // Scroll to the form itself (not the marketing heading) so the prefilled
    // range card and fields are immediately in view on mobile.
    const target = el.querySelector("form") ?? el;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      el
        .querySelector<HTMLInputElement>('[data-testid="input-name"]')
        ?.focus({ preventScroll: true });
    }, 500);
  }

  if (show) {
    return <EstimateCalculator featured onBookVisit={handleBookVisit} />;
  }

  return (
    <Section id="calculator" divider>
      <div ref={ref} className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-5 md:mb-10">
          <div className="brc-label mb-2 md:mb-3">Project Estimator</div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Free &middot; No obligation &middot; Instant range
          </span>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-2 md:mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="hidden sm:block text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow - pick your project, size, and style. Your planning range stays
            in view and updates at each step.
          </p>
          <p className="hidden sm:block text-sm max-w-2xl leading-relaxed text-foreground/80">
            {ESTIMATE_VALUE_PROP}
          </p>
        </div>
        <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-border bg-card/40 shadow-xl" aria-hidden>
          <div className="h-1 bg-accent" />
          <div className="min-h-[420px]" />
        </div>
      </div>
    </Section>
  );
}
