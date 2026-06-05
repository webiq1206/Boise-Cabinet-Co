"use client";

import { Section } from "@/components/marketing";
import { EstimateCalculatorWizard } from "@/components/estimate/EstimateCalculatorWizard";
import { CATALOG_CONTENT } from "@/shared/catalog";

interface EstimateCalculatorProps {
  inModal?: boolean;
  onBookVisit?: () => void;
}

export function EstimateCalculator({ inModal = false, onBookVisit }: EstimateCalculatorProps = {}) {
  if (inModal) {
    return <EstimateCalculatorWizard inModal onBookVisit={onBookVisit} />;
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
            A short guided flow - pick your project, size, and style. Your planning range updates
            at each step.
          </p>
          <p className="text-xs text-muted-foreground/90 max-w-2xl">
            {CATALOG_CONTENT.estimateDisclaimer}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <EstimateCalculatorWizard onBookVisit={onBookVisit} />
        </div>
      </div>
    </Section>
  );
}
