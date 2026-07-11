"use client";

import { Section } from "@/components/marketing";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { ESTIMATE_VALUE_PROP } from "@/shared/estimateEngine";

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
  /** Open the flow directly on a given step (e.g. "contact"). */
  startStep?: "project" | "size" | "layout" | "style" | "result" | "contact";
  /**
   * Heading level for the title. Defaults to `h2` (used as a section on the
   * homepage). The standalone `/estimate` page passes `h1` so the page has
   * exactly one top-level heading for SEO and accessibility.
   */
  headingAs?: "h1" | "h2";
  /**
   * Homepage treatment: frames the wizard as an elevated, sage-accented tool so
   * it reads as a featured instrument instead of blending into the page rhythm.
   * The standalone `/estimate` page (which IS the tool) leaves this off.
   */
  featured?: boolean;
}

export function EstimateCalculator({ inModal = false, onBookVisit, startStep, headingAs = "h2", featured = false }: EstimateCalculatorProps = {}) {
  if (inModal) {
    return <EstimateCalculatorWizard inModal onBookVisit={onBookVisit} startStep={startStep} />;
  }

  const Heading = headingAs;

  return (
    <Section id="calculator" divider>
      <div className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-5 md:mb-10">
          <div className="brc-label mb-2 md:mb-3">Project Estimator</div>
          {featured && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Free &middot; No obligation &middot; Instant range
            </span>
          )}
          <Heading className="font-sans font-light text-section-title md:text-section-title-lg mb-2 md:mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </Heading>
          {/* Descriptive copy is redundant with each step's own description on
              small screens, so we hide it there to keep the flow above the fold. */}
          <p className="hidden sm:block text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow - pick your project, size, and style. Your planning range stays
            in view and updates at each step.
          </p>
          <p className="hidden sm:block text-sm max-w-2xl leading-relaxed text-foreground/80">
            {ESTIMATE_VALUE_PROP}
          </p>
        </div>

        <div
          className={
            featured
              ? "max-w-5xl mx-auto rounded-xl border border-accent/30 bg-card/40 shadow-xl p-4 sm:p-6 md:p-8"
              : "max-w-5xl mx-auto"
          }
        >
          <EstimateCalculatorWizard onBookVisit={onBookVisit} />
        </div>
      </div>
    </Section>
  );
}
