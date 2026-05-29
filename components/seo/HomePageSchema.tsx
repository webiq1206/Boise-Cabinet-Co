import { JsonLd } from './JsonLd';
import {
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSpeakableSchema,
} from '@/lib/schema';
import { HOMEPAGE_FAQS } from '@/shared/homepageFaqs';

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
          name: 'Boise Remodeling Co, Design-Build Remodeling in the Treasure Valley',
        }),
      ]}
    />
  );
}
