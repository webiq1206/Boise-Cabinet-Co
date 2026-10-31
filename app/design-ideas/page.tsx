import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CinematicHero } from '@/components/marketing/CinematicHero';
import { Section } from '@/components/marketing/Section';
import { CtaButton } from '@/components/modals/CtaButton';
import { CaseStudiesSection } from '@/components/sections/CaseStudiesSection';
import { ProjectGallerySection } from '@/components/sections/ProjectGallerySection';
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
  path: '/design-ideas',
  titleOverride: 'Cabinet Design Ideas for Boise Homes',
  descriptionOverride:
    'Cabinet design ideas for Treasure Valley homes: a modern shaker kitchen, a double vanity, mudroom storage, a wet bar and a covered outdoor kitchen concept.',
})), "/design-ideas");

export default function DesignIdeasPage() {
  const gallerySchema = generateImageGallerySchema({
    name: 'Boise Cabinet Co Design Ideas',
    description:
      'Custom cabinet design examples for Treasure Valley homes: kitchens, baths, built-ins, and whole-home packages.',
    url: '/design-ideas',
    images: PROJECTS.map((project) => ({
      url: project.hero.src,
      caption: project.description,
      name: project.title,
    })),
  });

  const schemas = [gallerySchema, generateLocalBusinessSchema()];

  return (
    <InteriorPage kind="testimonials"><>
      <JsonLd data={schemas} />
    <div className="flex flex-col ">
      <CinematicHero
        image={MARKETING_IMAGES.processHome}
        alt="Cabinet finish selections and design plans for a Treasure Valley kitchen"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Design ideas' }]}
        eyebrow="Cabinet design inspiration"
        title="Cabinet design ideas for Treasure Valley homes"
        description="Explore kitchen, bathroom, and built-in cabinet ideas for Treasure Valley homes. Captions describe the design shown; they are not records of completed client projects."
      >
        <CtaButton variant="brand">
          {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </CinematicHero>

      <ProjectGallerySection limit={6} showViewAll={false} />
      <CaseStudiesSection />

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
            <div className="mt-6">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
            </div>
              </div>
          </div>
        </div>
      </Section>
    </div>
    </></InteriorPage>
  );
}
