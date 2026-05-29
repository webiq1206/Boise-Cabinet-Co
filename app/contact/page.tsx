import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/marketing/Section';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { BUSINESS_INFO } from '@/lib/seo';

const PHONE_HREF = 'tel:2085550100';

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
            <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground mt-6 mb-6">
              Contact Boise Remodeling Co
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10" data-speakable="summary">
              Schedule a free 60 to 90 minute in-home visit, call our team, or use the project
              estimator to explore a planning range for your remodel.
            </p>

            <div className="space-y-6 mb-10">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
              >
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-lg">{BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="flex items-center gap-3 text-foreground hover:text-accent transition-colors"
              >
                <Mail className="h-5 w-5 text-accent" />
                {BUSINESS_INFO.email}
              </a>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  {BUSINESS_INFO.address.street}
                  <br />
                  {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}{' '}
                  {BUSINESS_INFO.address.zip}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href="/#consult">Schedule consultation</Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/#calculator">Project estimator</Link>
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
