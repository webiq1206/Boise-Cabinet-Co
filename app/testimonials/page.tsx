import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/marketing/Section';
import { PageHeader } from '@/components/marketing/PageHeader';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { ProjectGallerySection } from '@/components/sections/ProjectGallerySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { buildPageMetadata } from '@/lib/page-metadata';
import { generateImageGallerySchema, generateLocalBusinessSchema } from '@/lib/schema';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { PROJECTS } from '@/shared/galleryData';
import { CtaButton } from '@/components/modals/CtaButton';

export const metadata = buildPageMetadata({
  kind: 'about',
  path: '/testimonials',
  titleOverride: 'Projects & Reviews',
  descriptionOverride:
    'See Treasure Valley custom cabinet projects and read reviews from Boise Cabinet Co homeowners. Kitchen, bath, closet, and built-in cabinetry.',
});

export default function TestimonialsPage() {
  const galleryHasConcept = PROJECTS.some((p) => p.kind === 'concept');
  const gallerySchema = generateImageGallerySchema({
    name: galleryHasConcept
      ? 'Boise Cabinet Co Design Concepts'
      : 'Boise Cabinet Co Project Gallery',
    description: galleryHasConcept
      ? 'Custom cabinet design concepts for Treasure Valley homes, kitchens, baths, built-ins, and whole-home packages. Illustrative renderings, not photographs of specific completed homes.'
      : 'Custom cabinet projects completed for Treasure Valley homes, kitchens, baths, built-ins, and whole-home packages.',
    url: '/testimonials',
    images: PROJECTS.map((project) => ({
      url: project.hero.src,
      caption:
        project.kind === 'concept'
          ? `Design concept: ${project.description}`
          : project.description,
      name: project.title,
    })),
  });

  // LocalBusiness schema carries aggregateRating, but only once real review
  // data is provided (NEXT_PUBLIC_REVIEW_COUNT/RATING). Individual Review
  // markup is intentionally NOT fabricated from marketing testimonials.
  // TODO(client): wire verified Review objects from your GBP/Houzz feed.
  const schemas = [gallerySchema, generateLocalBusinessSchema()];

  return (
    <>
      <JsonLd data={schemas} />
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-4 md:pt-6">
        <div className="container px-4 max-w-3xl">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Projects & Reviews' },
            ]}
          />
          <PageHeader
            align="left"
            className="mt-6"
            title={
              <>
                Projects &amp; homeowner{" "}
                <em className="brc-accent text-accent">reviews</em>
              </>
            }
            description="Explore cabinet design concepts for Treasure Valley homes and hear from homeowners who prioritized clarity, craftsmanship, and communication."
          />
          <div className="mb-8" />
          <div className="flex flex-wrap gap-3">
            <CtaButton variant="brand">
              {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
            </CtaButton>
          </div>
        </div>
      </Section>

      <ProjectGallerySection limit={6} showViewAll={false} />
      <CaseStudiesSection />
      <TestimonialsSection limit={4} showViewAll={false} />

      <Section surface="gradient" spacing="xl" edge>
        <div className="ed-shell">
          <div className="ed-split ed-split-center">
            <h2 className="ed-h2-sm ed-statement-wide">
              Ready to start your project?
            </h2>
              <div>
            <p className="ed-body">
              Schedule a free in-home visit for planning guidance, design direction, and an honest
              project range.
            </p>
            <div className="mt-8"><CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
</div>

              </div>          </div>
        </div>
      </Section>
    </div>
    </>
  );
}
