import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import Image from 'next/image';
import { Section } from '@/components/marketing/Section';
import { PageHeader } from '@/components/marketing/PageHeader';
import { SITE_IMAGES } from '@/shared/siteImages';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { CITIES, TREASURE_VALLEY_CITIES } from '@/shared/contentData';
import {
  DIFFERENTIATORS,
  HOMEPAGE_DIFFERENTIATOR_INDICES,
  PRINCIPLES,
} from '@/shared/siteContent';
import { CTA_PRIMARY } from '@/shared/ctaCopy';

export const metadata = buildPageMetadata({
  kind: 'about',
  path: '/about',
});

export default function AboutPage() {
  const schemas = [
    generateOrganizationSchema(),
    generateWebPageSchema({
      title: 'About Boise Remodeling Co',
      description:
        'Treasure Valley design-build remodeling company. Licensed, insured, and committed to clear communication.',
      url: '/about',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]),
  ];

  const featuredDifferentiators = HOMEPAGE_DIFFERENTIATOR_INDICES.map((i) => DIFFERENTIATORS[i]);

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
            <div className="mt-6 mb-10 relative aspect-[16/9] overflow-hidden rounded-sm">
              <Image
                src={SITE_IMAGES.leadership}
                alt="Boise Remodeling Co design-build team at a finished kitchen project"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover img-brand-grade"
                priority
              />
            </div>
            <PageHeader
              align="left"
              title={
                <>
                  About Boise Remodeling{" "}
                  <em className="brc-accent text-accent">Co</em>
                </>
              }
              description="We are a locally owned design-build remodeling company serving the Treasure Valley. Homeowners work with one accountable team from first in-home visit through final walkthrough."
            />
            <p className="text-foreground leading-relaxed mb-8 prose-measure" data-speakable="summary">
              Our focus is clarity: written scope before construction, proactive weekly updates,
              permits handled in-house for Ada and Canyon County, and a 2-year workmanship
              guarantee on our labor.
            </p>
            <Button variant="brand" asChild>
              <Link href="/#consult">
                {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
              Design-build, explained
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Design-build means your designer, estimator, and construction lead work together
              under one roof. Layout, selections, permits, and schedule stay aligned so your
              kitchen, bathroom, whole-home, or addition project does not drift between vendors.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Idaho contractor license information is available upon request. We are bonded and
              insured for residential remodeling work across the Treasure Valley.
            </p>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
              How we are different
            </h2>
            <div className="space-y-8">
              {featuredDifferentiators.map((item) => (
                <div key={item.title}>
                  <h3 className="font-sans font-light text-xl text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-foreground/90">{item.contrast}</span> {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
              Six principles we never compromise on
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {PRINCIPLES.map(({ title, desc }) => (
                <MarketingCard key={title} className="h-full">
                  <h3 className="font-sans font-medium text-sm mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
              Service areas
            </h2>
            <p className="text-muted-foreground mb-6">
              We serve homeowners in {TREASURE_VALLEY_CITIES}, and surrounding communities.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/areas/${city.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Remodeling in {city.name}, Idaho
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>
    </>
  );
}
