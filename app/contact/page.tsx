import { Phone, Mail, MapPin } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/marketing/Section';
import { PageHeader } from '@/components/marketing/PageHeader';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { BUSINESS_INFO } from '@/lib/seo';
import { SITE_CONFIG } from '@/shared/siteConfig';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';
import { ConsultCTA } from '@/components/modals/ConsultCTA';
import { EstimateCTA } from '@/components/modals/EstimateCTA';

export const metadata = buildPageMetadata({
  kind: 'contact',
  path: '/contact',
});

export default function ContactPage() {
  const schemas = [
    generateLocalBusinessSchema(),
    generateWebPageSchema({
      title: 'Contact Boise Remodeling Co',
      description: 'Schedule a free in-home consultation or call our Treasure Valley design-build team.',
      url: '/contact',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Contact', url: '/contact' },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
            <PageHeader
              align="left"
              className="mt-6 mb-10"
              title={
                <>
                  Contact Boise Remodeling{" "}
                  <em className="brc-accent text-accent">Co</em>
                </>
              }
              description="Schedule a free 60 to 90 minute in-home visit, call our team, or use the project estimator to explore a planning range for your remodel."
            />
            <div data-speakable="summary" className="sr-only">
              Contact Boise Remodeling Co for a free consultation.
            </div>

            <div className="space-y-6 mb-10">
              <a
                href={SITE_CONFIG.phoneHref}
                className="flex items-center gap-3 text-foreground hover:text-foreground/70 transition-colors"
              >
                <Phone className="h-5 w-5 text-foreground/50" />
                <span className="brc-display-num tabular-nums text-lg">{BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="flex items-center gap-3 text-foreground hover:text-foreground/70 transition-colors"
              >
                <Mail className="h-5 w-5 text-foreground/50" />
                {BUSINESS_INFO.email}
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-foreground/50 flex-shrink-0 mt-0.5" />
                <span>
                  {BUSINESS_INFO.address.street}
                  <br />
                  {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}{' '}
                  {BUSINESS_INFO.address.zip}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ConsultCTA variant="brand">{CTA_PRIMARY}</ConsultCTA>
              <EstimateCTA variant="brandOutline">{CTA_SECONDARY}</EstimateCTA>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
