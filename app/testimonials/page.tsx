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
  titleOverride: 'Projects & Reviews',
  descriptionOverride:
    'See Treasure Valley custom cabinet projects and read reviews from Boise Cabinet Co homeowners. Kitchen, bath, closet, and built-in cabinetry.',
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
        alt="consultation with a Boise Cabinet Co designer and homeowners reviewing cabinet finishes"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Projects & Reviews' }]}
        eyebrow="Proof of work"
        title={<>Projects &amp; homeowner <em className="brc-accent text-accent">reviews</em></>}
        description="Explore cabinet design concepts for Treasure Valley homes and hear from homeowners who prioritized clarity, craftsmanship, and communication."
      >
        <CtaButton variant="brand">
          {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </CinematicHero>

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
    </></InteriorPage>
  );
}
