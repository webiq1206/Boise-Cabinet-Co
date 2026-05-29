import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/marketing/Section';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { CITIES, TREASURE_VALLEY_CITIES } from '@/shared/contentData';

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

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
            <h1 className="font-serif font-light text-display md:text-[2.75rem] tracking-tight text-foreground mt-6 mb-6">
              About Boise Remodeling Co
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-speakable="summary">
              We are a locally owned design-build remodeling company serving the Treasure Valley.
              Homeowners work with one accountable team from first in-home visit through final
              walkthrough — not a patchwork of separate designers and contractors.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our focus is clarity: written scope before construction, proactive weekly updates,
              permits handled in-house for Ada and Canyon County, and a 2-year workmanship
              guarantee on our labor.
            </p>
            <Button variant="brand" asChild>
              <Link href="/#consult">
                Schedule a consultation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-serif font-light text-section-title mb-6 text-foreground">
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
            <h2 className="font-serif font-light text-section-title mb-6 text-foreground">
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
                    className="text-sm text-muted-foreground hover:text-accent"
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
