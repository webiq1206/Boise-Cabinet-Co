import { Phone, Mail, MapPin, Check } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/marketing/Section';
import { PageHeader } from '@/components/marketing/PageHeader';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { Hairline } from '@/components/marketing/Hairline';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { BUSINESS_INFO } from '@/lib/seo';
import { SITE_CONFIG } from '@/shared/siteConfig';
import { TREASURE_VALLEY_CITIES } from '@/shared/contentData';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';
import { CONSULT_BULLETS } from '@/shared/siteContent';
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
          <div className="container px-4 max-w-5xl">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
            <PageHeader
              align="left"
              className="mt-6 mb-10"
              eyebrow="Get in touch"
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

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-0 items-start">

              {/* Left column — contact details */}
              <div className="flex flex-col">

                {/* Phone */}
                <div className="py-6 first:pt-0">
                  <p className="brc-label mb-3">Call us</p>
                  <a
                    href={SITE_CONFIG.phoneHref}
                    className="brc-display-num tabular-nums text-xl text-foreground hover:text-foreground/70 transition-colors"
                  >
                    {BUSINESS_INFO.phone}
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mon – Fri 7 am – 6 pm · Sat 8 am – 4 pm
                  </p>
                </div>

                <Hairline spaced={false} className="my-0" />

                {/* Email */}
                <div className="py-6">
                  <p className="brc-label mb-3">Email us</p>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="text-base text-foreground hover:text-foreground/70 transition-colors"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Response within one business day
                  </p>
                </div>

                <Hairline spaced={false} className="my-0" />

                {/* Address */}
                <div className="py-6">
                  <p className="brc-label mb-3">Visit us</p>
                  <address className="not-italic text-base text-foreground leading-relaxed">
                    {BUSINESS_INFO.address.street}
                    <br />
                    {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}{' '}
                    {BUSINESS_INFO.address.zip}
                  </address>
                </div>

                <Hairline spaced={false} className="my-0" />

                {/* Service area */}
                <div className="py-6">
                  <p className="brc-label mb-3">Service area</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Serving {TREASURE_VALLEY_CITIES}
                  </p>
                </div>

              </div>

              {/* Vertical hairline divider — desktop only */}
              <div
                role="presentation"
                className="hidden md:block w-px bg-border/60 self-stretch mx-10 lg:mx-14"
              />

              {/* Right column — What to expect card */}
              <div className="mt-8 md:mt-0">
                <MarketingCard padding="lg" className="h-full flex flex-col">
                  <p className="brc-label mb-4">Your free visit includes</p>
                  <h2 className="font-sans font-light text-2xl tracking-tight text-foreground mb-6">
                    No pressure. No pitch.{" "}
                    <em className="brc-accent text-accent">Just answers.</em>
                  </h2>

                  <ul className="flex flex-col gap-0 mb-6 flex-1">
                    {CONSULT_BULLETS.map((bullet, i) => (
                      <li key={i}>
                        <div className="flex items-start gap-3 py-4">
                          <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-base text-foreground">{bullet}</span>
                        </div>
                        {i < CONSULT_BULLETS.length - 1 && (
                          <Hairline spaced={false} className="my-0" />
                        )}
                      </li>
                    ))}
                  </ul>

                  <Hairline spaced={false} className="my-0 mb-6" />

                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <ConsultCTA variant="brand">{CTA_PRIMARY}</ConsultCTA>
                    <EstimateCTA variant="brandOutline">{CTA_SECONDARY}</EstimateCTA>
                  </div>
                </MarketingCard>
              </div>

            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
