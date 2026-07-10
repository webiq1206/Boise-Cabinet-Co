import { JsonLd } from './JsonLd';
import {
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSpeakableSchema,
} from '@/lib/schema';
import { HOMEPAGE_FAQS } from '@/shared/homepageFaqs';
import { SITE_CONFIG } from '@/shared/siteConfig';

export function HomePageSchema() {
  return (
    <JsonLd
      data={[
        generateOrganizationSchema(),
        // No city arg: geo resolves to the Meridian locality so geo matches addressLocality.
        generateLocalBusinessSchema(),
        generateWebSiteSchema(),
        generateFAQSchema(
          HOMEPAGE_FAQS.map((f) => ({ question: f.q, answer: f.a })),
        ),
        generateSpeakableSchema({
          path: '/',
          name: `${SITE_CONFIG.name}, Custom Cabinets in the Treasure Valley`,
        }),
      ]}
    />
  );
}
