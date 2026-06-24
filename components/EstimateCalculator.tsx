"use client";

import { Section } from "@/components/marketing";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { ESTIMATE_VALUE_PROP } from "@/shared/estimateEngine";

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
  /** Open the flow directly on a given step (e.g. "contact"). */
  startStep?: "project" | "size" | "layout" | "style" | "result" | "contact";
}

export function EstimateCalculator({ inModal = false, onBookVisit, startStep }: EstimateCalculatorProps = {}) {
  if (inModal) {
    return <EstimateCalculatorWizard inModal onBookVisit={onBookVisit} startStep={startStep} />;
  }

  return (
    <Section id="calculator" divider>
      <div className="container px-4 pb-8">
        <div className="max-w-3xl mx-auto mb-10">
          <div className="brc-label mb-3">Project Estimator</div>
          <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-3 text-foreground">
            Plan your cabinet{" "}
            <em className="brc-accent text-accent">investment</em>
          </h2>
          <p className="text-base max-w-2xl leading-relaxed text-muted-foreground mb-3">
            A short guided flow - pick your project, size, and style. Your planning range stays
            in view and updates at each step.
          </p>
          <p className="text-sm max-w-2xl leading-relaxed text-foreground/80">
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
