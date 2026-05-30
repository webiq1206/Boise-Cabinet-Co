import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  landingAreaBusinessSchema,
  landingBreadcrumbs,
  landingFAQSchema,
} from '@/lib/landing-schema';
import { CITY_SEO_DATA } from '@/lib/seo';
import { areaPath, CITY_SLUGS, getCityBySlug } from '@/lib/seo-routes';
import { getCountyLabel } from '@/shared/contentData';
import { AREA_PAGE_FAQS, getAreaIntro } from '@/shared/seoContent';
import { generateSpeakableSchema } from '@/lib/schema';
import { SITE_IMAGES } from '@/shared/siteImages';

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}) {
  const cityData = getCityBySlug(params.city);
  if (!cityData) return {};
  return buildPageMetadata({
    kind: 'area',
    cityName: cityData.name,
    citySlug: cityData.slug,
    path: areaPath(cityData.slug),
  });
}

export default function AreaPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  const seo = CITY_SEO_DATA[city.name];
  const county = getCountyLabel(city.county);
  const path = areaPath(city.slug);
  const overview = getAreaIntro(city);
  const localNote = seo
    ? `We serve ${city.name} homeowners across ${seo.neighborhoods.slice(0, 3).join(', ')}, and all of ${county}. Permits are coordinated through ${county} for projects requiring approval.`
    : `We serve ${city.name} and all of ${county} with design-build remodeling.`;

  const h1 = `Remodeling Contractor in ${city.name}, Idaho`;
  const faqs = [
    ...AREA_PAGE_FAQS,
    {
      question: `Do you serve ${city.name}, Idaho?`,
      answer: `Yes. ${city.name} is part of our Treasure Valley service area. We handle kitchen, bathroom, whole-home, and addition projects locally.`,
    },
  ];

  const schemas = [
    landingBreadcrumbs([
      { name: 'Home', url: '/' },
      { name: 'Service Areas', url: '/areas' },
      { name: city.name, url: path },
    ]),
    landingAreaBusinessSchema(city.name),
    landingFAQSchema(faqs),
    generateSpeakableSchema({ path, name: h1 }),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <LandingPageTemplate
        h1={h1}
        speakableSummary={overview}
        overview={overview}
        heroImageUrl={SITE_IMAGES.hero}
        manifestPath={path}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Service Areas', href: '/areas' },
          { name: city.name },
        ]}
        benefits={[
          `Local experience in ${city.name} and ${county}`,
          'Design-build team, one accountable contact',
          'Written scope before construction',
          'Written workmanship guarantee',
        ]}
        localNote={localNote}
        faqs={faqs}
        related={{ variant: 'area', citySlug: city.slug }}
      />
    </>
  );
}
