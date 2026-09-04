"use client";

import { CtaButton } from "@/components/modals/CtaButton";
import { Section } from "@/components/marketing/Section";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

interface CatalogClosingCTAProps {
  title?: string;
  description?: string;
}

/**
 * The closing ask on every catalog page.
 *
 * WAS a dark card centred in a 672px column - a box at the end of a page of
 * boxes. NOW a statement on the family's gradient ground, the same closing
 * arrangement the homepage and the landing pages use, so the end of every
 * page feels like the same company asking the same thing.
 */
export function CatalogClosingCTA({
  title = "Ready to plan your project?",
  description = "Use our online estimator to get a rough budget range for your project in about two minutes.",
}: CatalogClosingCTAProps) {
  return (
    <Section surface="gradient" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split ed-split-center">
          <h2 className="ed-h2 ed-statement">{title}</h2>
          <div>
            <p className="ed-body">{description}</p>
            <div className="mt-8">
              <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
