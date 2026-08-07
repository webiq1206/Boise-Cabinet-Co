"use client";

import { CtaButton } from "@/components/modals/CtaButton";
import { Section } from "@/components/marketing/Section";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

interface CatalogClosingCTAProps {
  title?: string;
  description?: string;
}

export function CatalogClosingCTA({
  title = "Ready to plan your project?",
  description = "Use our online estimator to get a rough budget range for your project in about two minutes.",
}: CatalogClosingCTAProps) {
  return (
    <Section divider spacing="sm">
      <div className="container px-4 max-w-2xl mx-auto">
        <MarketingCard className="cta-card-dark p-8 md:p-10 text-center">
          <h2 className="font-sans font-light text-section-title mb-3 text-inverse-foreground">
            {title}
          </h2>
          <p className="text-sm text-inverse-muted mb-6 max-w-md mx-auto">{description}</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
          </div>
        </MarketingCard>
      </div>
    </Section>
  );
}
