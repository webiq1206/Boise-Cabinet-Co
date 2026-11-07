import { JsonLd } from './JsonLd';
import {
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateSpeakableSchema,
} from '@/lib/schema';
import { publicQa } from '@/shared/claims';
import { HOMEPAGE_FAQS } from '@/shared/homepageFaqs';
import { SITE_CONFIG } from '@/shared/siteConfig';

export function HomePageSchema() {
  return (
    <JsonLd
      data={[
        // One business node. Meridian locality, no street address.
        generateLocalBusinessSchema(),
        generateWebSiteSchema(),
        generateFAQSchema(
          publicQa(HOMEPAGE_FAQS).map((f) => ({ question: f.q, answer: f.a })),
        ),
        generateSpeakableSchema({
          path: '/',
          name: `${SITE_CONFIG.name}, Custom Cabinets in the Treasure Valley`,
        }),
      ]}
    />
  );
}
