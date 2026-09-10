import { ArrowRight, Phone, Wrench } from 'lucide-react';
import { MarketingCard } from './MarketingCard';
import { GuideSidebarToc } from './GuideContentBlocks';
import type { TocHeading } from '@/lib/content-utils';
import { CtaButton } from '@/components/modals/CtaButton';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { SITE_CONFIG } from '@/shared/siteConfig';

interface ArticleSidebarProps {
  tocHeadings: TocHeading[];
  ctaDescription?: string;
}

export function ArticleSidebar({
  tocHeadings,
  ctaDescription = 'Ready for a written scope? Schedule a design consultation with our cabinet team.',
}: ArticleSidebarProps) {
  return (
    <>
      <GuideSidebarToc headings={tocHeadings} />
      <ArticleSidebarCta description={ctaDescription} />
    </>
  );
}

export function ArticleSidebarCta({ description }: { description: string }) {
  return (
    <MarketingCard className="cta-card-dark">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
            <Wrench className="h-5 w-5 text-inverse-foreground/60" />
          </div>
          <h3 className="font-medium text-sm text-inverse-foreground">Free Consultation</h3>
        </div>
        <p className="text-sm text-inverse-muted">{description}</p>
        <CtaButton variant="brand" size="sm" className="w-full h-auto min-h-11 whitespace-normal py-3 text-center">
          {CTA_ESTIMATE}
          <ArrowRight className="ml-2 h-4 w-4" />
        </CtaButton>
        <p className="text-sm text-inverse-muted text-center flex items-center justify-center gap-1">
          <Phone className="h-3 w-3" />
          {SITE_CONFIG.phone}
        </p>
      </div>
    </MarketingCard>
  );
}
