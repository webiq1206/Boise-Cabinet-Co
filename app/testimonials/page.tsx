import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/marketing/Section';
import { Button } from '@/components/ui/button';
import { ProjectGallerySection } from '@/components/sections/ProjectGallerySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { buildPageMetadata } from '@/lib/page-metadata';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';

export const metadata = buildPageMetadata({
  kind: 'about',
  path: '/testimonials',
  titleOverride: 'Projects & Reviews',
  descriptionOverride:
    'See Treasure Valley remodeling transformations and read reviews from Boise Remodeling Co homeowners. Kitchen, bath, whole-home, and addition projects.',
});

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-8 md:pt-12">
        <div className="container px-4 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Projects & Reviews' },
            ]}
          />
          <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground mt-6 mb-6">
            Projects &amp; homeowner reviews
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Explore recent design-build work across the Treasure Valley and hear from homeowners
            who prioritized clarity, craftsmanship, and communication.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" asChild>
              <Link href="/#consult">
                {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="brandOutline" asChild>
              <Link href="/#calculator">{CTA_SECONDARY}</Link>
            </Button>
          </div>
        </div>
      </Section>

      <ProjectGallerySection limit={6} showViewAll={false} />
      <TestimonialsSection limit={4} showViewAll={false} />

      <Section divider spacing="sm">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="marketing-card p-10 md:p-12 text-center">
            <h2 className="font-sans font-light text-section-title mb-4 text-foreground">
              Ready to start your project?
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Schedule a free in-home visit for planning guidance, design direction, and an honest
              project range.
            </p>
            <Button variant="brand" asChild>
              <Link href="/#consult">{CTA_PRIMARY}</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
