import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { buildPageMetadata } from '@/lib/page-metadata';
import { Section } from '@/components/marketing/Section';
import { PermitFlowGraphic } from './PermitFlowGraphic';
import { CtaButton } from '@/components/modals/CtaButton';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { generateWebPageSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/schema';

export const metadata: Metadata = buildPageMetadata({
  kind: 'blog',
  path: '/resources/ada-canyon-permit-flow',
  titleOverride: 'Ada vs Canyon County Permit Flow',
  descriptionOverride:
    'Visual guide to cabinet and trade permits in Ada and Canyon County, jurisdiction, review steps, and inspections for Treasure Valley homeowners.',
});

export default function AdaCanyonPermitFlowPage() {
  const webPageSchema = generateWebPageSchema({
    title: 'Ada vs Canyon County Permit Flow',
    description:
      'Visual guide to cabinet and trade permits in Ada and Canyon County, jurisdiction, review steps, and inspections for Treasure Valley homeowners.',
    url: '/resources/ada-canyon-permit-flow',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Ada vs Canyon County Permit Flow', url: '/resources/ada-canyon-permit-flow' },
  ]);

  const articleSchema = generateArticleSchema({
    title: 'Ada vs Canyon County Permit Flow',
    description:
      'A step-by-step view of how cabinet and trade permits move through review and inspections in the Treasure Valley. Timelines vary by project scope.',
    publishedAt: '2025-01-01',
    slug: 'ada-canyon-permit-flow',
    canonicalUrl: '/resources/ada-canyon-permit-flow',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="flex flex-col pb-20">
      <Section spacing="lg" className="pt-28 md:pt-32">
        <div className="container px-4 max-w-4xl mx-auto">
          <Link
            href="/resources"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Planning resources
          </Link>

          <p className="text-xs font-medium uppercase tracking-wider text-accent mb-3">
            Visual guide
          </p>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-foreground mb-4">
            Ada vs Canyon County permit flow
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            A step-by-step view of how cabinet and trade permits move through review and inspections in
            the Treasure Valley. Timelines vary by project scope.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="/downloads/ada-canyon-permit-guide.pdf"
              download
              className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download PDF reference
            </a>
            <Link
              href="/guides/cabinet-project-process-guide"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted/50"
            >
              Read full article
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <PermitFlowGraphic />

          <div className="mt-12 prose-measure text-sm text-muted-foreground space-y-4">
            <p>
              <strong className="text-foreground">Note:</strong> HOAs in Eagle, Harris Ranch,
              Hidden Springs, and similar communities may require architectural review in addition
              to county permits.
            </p>
            <p>
              cabinet design and installation contracts should state who submits plans, pays fees, and schedules
              inspections. Cosmetic work without layout changes may not need the full path below.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <CtaButton variant="brand">
              {CTA_ESTIMATE}
              <ArrowRight className="ml-2 h-4 w-4" />
            </CtaButton>
            <Link
              href="/guides/cabinet-project-process-guide"
              className="tap-target inline-flex items-center text-sm text-accent hover:underline"
            >
              cabinet project process guide
            </Link>
          </div>
        </div>
      </Section>
      </div>
    </>
  );
}
