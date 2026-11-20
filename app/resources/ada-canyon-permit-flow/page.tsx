import { InteriorDocument,InteriorPage } from '@/components/approved/InteriorLayout';
import { Section } from '@/components/marketing/Section';
import { CtaButton } from '@/components/modals/CtaButton';
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from '@/lib/page-metadata';
import { generateArticleSchema,generateBreadcrumbSchema,generateWebPageSchema } from '@/lib/schema';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { ArrowLeft,ArrowRight,Download } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PermitFlowGraphic } from './PermitFlowGraphic';

export const metadata: Metadata = withBrandPageMetadata((buildPageMetadata({
  kind: 'blog',
  path: '/resources/ada-canyon-permit-flow',
  // Rewritten around cabinet installs (owner decision 5, 20 November 2026);
  // remodel permits belong to Boise Remodeling Co's page, linked below.
  titleOverride: 'Cabinet Permits: Ada vs Canyon County',
  descriptionOverride:
    'When a cabinet install needs a permit in Ada and Canyon County: cabinets alone usually do not; moving plumbing, wiring or walls does.',
})), "/resources/ada-canyon-permit-flow");

export default function AdaCanyonPermitFlowPage() {
  const webPageSchema = generateWebPageSchema({
    title: 'Cabinet install permits in Ada and Canyon County',
    description:
      'When a cabinet install needs a permit in Ada and Canyon County: cabinets alone usually do not; moving plumbing, wiring or walls does.',
    url: '/resources/ada-canyon-permit-flow',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Cabinet install permits', url: '/resources/ada-canyon-permit-flow' },
  ]);

  const articleSchema = generateArticleSchema({
    title: 'Cabinet install permits in Ada and Canyon County',
    description:
      'When a cabinet install needs a permit in Ada and Canyon County: cabinets alone usually do not; moving plumbing, wiring or walls does.',
    publishedAt: '2025-01-01',
    slug: 'ada-canyon-permit-flow',
    canonicalUrl: '/resources/ada-canyon-permit-flow',
  });

  return (
    <InteriorPage kind="resources"><>
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
      <div className="flex flex-col">
      <Section spacing="none" className="pt-28 md:pt-32">
        <InteriorDocument heading={<h1 className="text-3xl md:text-4xl font-serif tracking-tight text-foreground mb-4">
            Cabinet install permits in Ada and Canyon County
          </h1>} contents={[]}>
          <Link
            href="/resources"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Planning resources
          </Link>

          <p className="text-xs font-medium uppercase tracking-wider text-foreground mb-3">
            Visual guide
          </p>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Most cabinet installs need no permit: cabinets alone are interior work. A permit comes in when
            the install moves plumbing, adds wiring or changes a wall, and then the city or the county
            reviews it.
          </p>

          <div className="prose-measure mb-10 space-y-4 text-base leading-relaxed text-foreground/90">
            <h2 className="text-xl font-serif text-foreground">When a cabinet install needs a permit</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Cabinets alone: usually no permit.</strong> The City of
                Boise&apos;s residential permit brochure says the building code exempts interior work such as
                painting, floor covering, cabinets, counter tops and wall coverings.
              </li>
              <li>
                <strong className="text-foreground">Plumbing, electrical or structural changes: permit review.</strong>{' '}
                Relocating a sink or other plumbing fixture, adding a circuit, opening walls to the studs or
                adding a wall turns a cabinet job into permitted work.
              </li>
              <li>
                <strong className="text-foreground">Who reviews it.</strong> Inside city limits, the city&apos;s
                building department; outside them, Ada County or Canyon County. Confirm which office covers the
                address before you apply. Each <Link href="/locations/boise" className="underline underline-offset-2">city page</Link> names
                its own office.
              </li>
              <li>
                <strong className="text-foreground">HOA review.</strong> Communities such as Eagle and Harris
                Ranch may require architectural review in addition to a permit.
              </li>
            </ul>
            <p>We point out permit triggers during design, so a cabinet plan that moves plumbing or power is not a surprise later.</p>
          </div>

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
              Cabinet design and installation contracts should state who submits plans, pays fees, and schedules
              inspections when trade work is part of the job.
            </p>
            <p>
              Planning a remodel, with walls, plumbing and the rest of the room? Our sister company covers the
              remodel side in its{' '}
              <a href="https://boiseremodeling.co/resources/ada-canyon-permit-flow" className="underline underline-offset-2">
                Ada and Canyon County permit flow for remodels
              </a>
              .
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
        </InteriorDocument>
      </Section>
      </div>
    </></InteriorPage>
  );
}
