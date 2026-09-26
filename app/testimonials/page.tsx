import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CinematicHero } from '@/components/marketing/CinematicHero';
import { Section } from '@/components/marketing/Section';
import { CtaButton } from '@/components/modals/CtaButton';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { ProjectGallerySection } from '@/components/sections/ProjectGallerySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from '@/lib/page-metadata';
import { generateImageGallerySchema,generateLocalBusinessSchema } from '@/lib/schema';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { PROJECTS } from '@/shared/galleryData';
import { MARKETING_IMAGES } from '@/shared/siteImages';
import { ArrowRight } from 'lucide-react';

export const metadata = withBrandPageMetadata((buildPageMetadata({
  kind: 'about',
  path: '/testimonials',
  titleOverride: 'Cabinet Design Ideas & Reviews',
  descriptionOverride:
    'Explore cabinet design concepts for kitchens, bathrooms and built-ins. Concept imagery illustrates design options and is not evidence of completed Boise projects.',
})), "/testimonials");

export default function TestimonialsPage() {
  const galleryHasConcept = PROJECTS.some((p) => p.kind === 'concept');
  const gallerySchema = generateImageGallerySchema({
    name: galleryHasConcept
      ? 'Boise Cabinet Co Design Concepts'
      : 'Boise Cabinet Co Project Gallery',
    description: galleryHasConcept
      ? 'Custom cabinet design examples for Treasure Valley homes, kitchens, baths, built-ins, and whole-home packages.'
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
    <InteriorPage kind="testimonials"><>
      <JsonLd data={schemas} />
    <div className="flex flex-col pb-20 md:pb-0">
      <CinematicHero
        image={MARKETING_IMAGES.processHome}
        alt="Illustrative consultation scene showing cabinet finish selections"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Projects & Reviews' }]}
        eyebrow="Cabinet design inspiration"
        title={<>Design ideas &amp; <em className="brc-accent text-accent">reviews</em></>}
        description="Explore cabinet design concepts for Treasure Valley homes and hear from homeowners who prioritized clarity, craftsmanship, and communication."
      >
        <CtaButton variant="brand">
          {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </CinematicHero>

      <ProjectGallerySection limit={6} showViewAll={false} />
      <p className="mx-auto max-w-3xl px-6 py-5 text-center">Design concepts illustrate possible layouts and finishes. They are not photographs of completed client projects. Ask us for relevant project references when discussing your scope.</p>
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
    </></InteriorPage>
  );
}
