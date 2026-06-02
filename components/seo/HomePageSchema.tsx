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
        generateLocalBusinessSchema('Boise'),
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
