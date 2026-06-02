import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/marketing/Section';
import { PageHeader } from '@/components/marketing/PageHeader';
import { ProjectGallerySection } from '@/components/sections/ProjectGallerySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { buildPageMetadata } from '@/lib/page-metadata';
import { generateImageGallerySchema } from '@/lib/schema';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';
import { GALLERY_PROJECTS } from '@/shared/galleryData';
import { ConsultCTA } from '@/components/modals/ConsultCTA';
import { EstimateCTA } from '@/components/modals/EstimateCTA';

export const metadata = buildPageMetadata({
  kind: 'about',
  path: '/testimonials',
  titleOverride: 'Projects & Reviews',
  descriptionOverride:
    'See Treasure Valley custom cabinet projects and read reviews from Boise Cabinet Co homeowners. Kitchen, bath, closet, and built-in cabinetry.',
});

export default function TestimonialsPage() {
  const gallerySchema = generateImageGallerySchema({
    name: 'Boise Cabinet Co Project Gallery',
    description:
      'Before and after custom cabinet projects across the Treasure Valley, kitchens, baths, built-ins, and whole-home packages.',
    url: '/testimonials',
    images: GALLERY_PROJECTS.flatMap((project) => [
      {
        url: project.beforeImageUrl,
        caption: `Before: ${project.title} in ${project.city}, Idaho`,
        name: `${project.title}, before`,
      },
      {
        url: project.afterImageUrl,
        caption: `After: ${project.description}`,
        name: `${project.title}, after`,
      },
    ]),
  });

  return (
    <>
      <JsonLd data={gallerySchema} />
    <div className="flex flex-col pb-20 md:pb-0">
      <Section spacing="sm" className="pt-8 md:pt-12">
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
            description="Explore recent cabinet work across the Treasure Valley and hear from homeowners who prioritized clarity, craftsmanship, and communication."
          />
          <div className="mb-8" />
          <div className="flex flex-wrap gap-3">
            <ConsultCTA variant="brand">
              {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
            </ConsultCTA>
            <EstimateCTA variant="brandOutline">
              {CTA_SECONDARY}
            </EstimateCTA>
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
            <ConsultCTA variant="brand">{CTA_PRIMARY}</ConsultCTA>
          </div>
        </div>
      </Section>
    </div>
    </>
  );
}
