"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Section } from "@/components/marketing";

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

  if (show) {
    return <EstimateCalculator />;
  }

  return (
    <Section id="calculator" divider>
      <div ref={ref} className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow - pick your project, size, and style. Your planning range updates
            at each step.
          </p>
        </div>
        <div className="max-w-3xl mx-auto min-h-[420px]" aria-hidden />
      </div>
    </Section>
  );
}
