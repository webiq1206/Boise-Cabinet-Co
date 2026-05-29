import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  landingBreadcrumbs,
  landingFAQSchema,
  landingServiceSchema,
  landingSpeakable,
} from '@/lib/landing-schema';
import { SERVICE_SLUGS, getServiceBySlug, servicePath } from '@/lib/seo-routes';
import { SERVICE_SEO_CONTENT } from '@/shared/seoContent';
import { generateSpeakableSchema } from '@/lib/schema';
import { getServiceBackground } from '@/shared/serviceBackgrounds';

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};
  return buildPageMetadata({
    kind: 'service',
    serviceName: service.name,
    serviceSlug: service.slug,
    path: servicePath(service.slug),
  });
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  const content = SERVICE_SEO_CONTENT[params.slug];
  if (!service || !content) notFound();

  const path = servicePath(service.slug);
  const faqs = content.faqs;

  const schemas = [
    landingBreadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/#services' },
      { name: service.name, url: path },
    ]),
    landingServiceSchema(service.name, content.overview),
    landingFAQSchema(faqs),
    generateSpeakableSchema({ path, name: content.headline }),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <LandingPageTemplate
        h1={content.headline}
        speakableSummary={content.overview}
        overview={content.overview}
        heroImageUrl={getServiceBackground(service.slug)}
        manifestPath={path}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/#services' },
          { name: service.name },
        ]}
        benefits={content.benefits}
        inclusions={content.inclusions}
        timeline={content.timeline}
        processSteps={content.processSteps}
        faqs={faqs}
        related={{ variant: 'service', serviceSlug: service.slug }}
      />
    </>
  );
}
