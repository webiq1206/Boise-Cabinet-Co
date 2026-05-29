import { JsonLd } from './JsonLd';
import {
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSpeakableSchema,
} from '@/lib/schema';
import { HOMEPAGE_FAQS_FOR_SCHEMA } from '@/shared/seoContent';

export function HomePageSchema() {
  return (
    <JsonLd
      data={[
        generateOrganizationSchema(),
        generateLocalBusinessSchema('Boise'),
        generateWebSiteSchema(),
        generateFAQSchema(HOMEPAGE_FAQS_FOR_SCHEMA),
        generateSpeakableSchema({
          path: '/',
          name: 'Boise Remodeling Co — Design-Build Remodeling in the Treasure Valley',
        }),
      ]}
    />
  );
}
