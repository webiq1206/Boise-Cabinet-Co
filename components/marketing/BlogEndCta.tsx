import { ArrowRight, Phone } from "lucide-react";
import { Section } from "./Section";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { CtaButton } from "@/components/modals/CtaButton";

/**
 * The closing ask on every article, guide and area page.
 *
 * WAS a dark card centred in a 896px column - a box at the end of a page. NOW
 * the same gradient statement band every other page closes on. It is a full-
 * width band, so callers render it bare - not inside a page container. A first
 * cut pulled it out of the container with a negative margin instead; measured,
 * that overflowed the viewport by 24px on the areas page at every width.
 */
export function BlogEndCta() {
  return (
    <Section surface="gradient" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split ed-split-center">
          <div>
            <p className="ed-eyebrow ed-eyebrow-accent">Start your project</p>
      <h2 className="ed-h2 ed-statement">
        Ready to start your project?
      </h2>
      </div>
      <div>
      <p className="ed-body">
        Book a free in-home visit. We&apos;ll walk your space, hear your goals, and give you a
        planning range on the spot with no obligation.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <CtaButton variant="brand" size="lg" data-testid="link-bottom-cta-consult">
          {CTA_ESTIMATE}
          <ArrowRight className="ml-2 h-5 w-5" />
        </CtaButton>
        <a
          href={SITE_CONFIG.phoneHref}
          data-testid="link-bottom-cta-call"
          className="tap-target inline-flex items-center justify-center gap-2 rounded-sm border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-inverse-foreground transition-colors brc-lift"
        >
          <Phone className="h-4 w-4" />
          {SITE_CONFIG.phone}
        </a>
      </div>
    </div>
        </div>
      </div>
    </Section>
  );
}
