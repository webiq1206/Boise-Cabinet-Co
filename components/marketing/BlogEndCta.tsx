import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingCard } from "./MarketingCard";
import { CTA_PRIMARY } from "@/shared/ctaCopy";
import { SITE_CONFIG } from "@/shared/siteConfig";

export function BlogEndCta() {
  return (
    <MarketingCard className="p-10 md:p-16 text-center max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-sans font-light tracking-tight mb-4 text-foreground">
        Ready to start your project?
      </h2>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        Book a free in-home visit. We&apos;ll walk your space, hear your goals, and give you a
        planning range on the spot with no obligation.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="brand" size="lg" asChild>
          <Link href="/#consult" data-testid="link-bottom-cta-consult">
            {CTA_PRIMARY}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button variant="brandOutline" size="lg" asChild>
          <a href={SITE_CONFIG.phoneHref} data-testid="link-bottom-cta-call">
            <Phone className="mr-2 h-4 w-4" />
            {SITE_CONFIG.phone}
          </a>
        </Button>
      </div>
    </MarketingCard>
  );
}
