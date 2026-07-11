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
}

export function EstimateCalculator({ inModal = false, onBookVisit, startStep, headingAs = "h2" }: EstimateCalculatorProps = {}) {
  if (inModal) {
    return <EstimateCalculatorWizard inModal onBookVisit={onBookVisit} startStep={startStep} />;
  }

  const Heading = headingAs;

  return (
    <Section id="calculator" divider>
      <div className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-5 md:mb-10">
          <div className="brc-label mb-2 md:mb-3">Project Estimator</div>
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

        <div className="max-w-5xl mx-auto">
          <EstimateCalculatorWizard onBookVisit={onBookVisit} />
        </div>
      </div>
    </Section>
  );
}
