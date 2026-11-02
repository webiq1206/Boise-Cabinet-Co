import { toSentenceCase } from '@/shared/sentenceCase';
import { InteriorHero,InteriorPage } from '@/components/approved/InteriorLayout';
import { JsonLd } from '@/components/seo/JsonLd';
import { Section } from '@/components/marketing/Section';
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from '@/lib/page-metadata';
import { generateBreadcrumbSchema,generateCollectionPageSchema,generateWebPageSchema } from '@/lib/schema';
import { ALL_RESOURCES_LIST } from '@/shared/guideResources';
import { ArrowRight,Download,FileText,Workflow } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = withBrandPageMetadata((buildPageMetadata({
  kind: 'blog',
  path: '/resources',
  titleOverride: 'Cabinet Planning Resources',
  descriptionOverride:
    'Free PDF worksheets and visual guides for Treasure Valley cabinet planning: budget worksheet, kitchen and bath checklist, Ada vs Canyon permits.',
})), "/resources");

export default function ResourcesIndexPage() {
  const pdfs = ALL_RESOURCES_LIST.filter((r) => r.kind === 'pdf');
  const visuals = ALL_RESOURCES_LIST.filter((r) => r.kind === 'visual');

  const webPageSchema = generateWebPageSchema({
    title: 'Cabinet Planning Resources',
    description:
      'Free PDF worksheets and visual guides for Treasure Valley cabinet planning: budget worksheet, kitchen and bath checklist, Ada vs Canyon permits.',
    url: '/resources',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
  ]);

  const collectionSchema = generateCollectionPageSchema({
    title: 'Cabinet Planning Resources',
    description:
      'Free PDF worksheets and visual guides for Treasure Valley cabinet planning.',
    url: '/resources',
    items: ALL_RESOURCES_LIST.map((r) => ({ name: r.title, url: r.href })),
  });

  return (
    <InteriorPage kind="resources">
      <>
        <JsonLd data={[webPageSchema, breadcrumbSchema, collectionSchema]} />
        {/* Editorial opening: eyebrow, display H1 and one lede, with the page's own
            answer beside it, instead of a document column pinned under the header. */}
        <InteriorHero layout="editorial">
          <p className="ed-eyebrow">Free downloads</p>
          <h1 className="ed-display ed-statement-display mb-8">
            Cabinet planning <em className="brc-accent text-accent">resources</em>
          </h1>
          <p className="interior-hero-support">
            Printable PDFs and visual guides to use alongside our{' '}
            <Link href="/guides" className="underline underline-offset-2">cabinet planning guides</Link>.
            These are planning tools, not quotes or contracts.
          </p>
        </InteriorHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="ed-eyebrow">The short answer</p>
                <h2 id="resources-answer" className="ed-h2-sm ed-statement">What is on this page?</h2>
              </div>
              <div>
                <p className="ed-lede" data-speakable="answer">
                  Three free tools for planning a Treasure Valley cabinet project: a budget worksheet to pressure-test your planning range, a kitchen and bath checklist so nothing is missed between layout, selections and installation, and a visual guide to the Ada and Canyon County permit flow for the projects that need one. All of them download without an email, and none of them is a quote or a contract.
                </p>
                <p className="ed-body mt-6">
                  When you are ready, bring your notes to a{' '}
                  <Link href="/contact" className="underline underline-offset-2">free in-home design consultation</Link>{' '}
                  and we will turn them into a written proposal with drawings and an honest planning range for your cabinets.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="ed-shell">
            <p className="ed-eyebrow">PDF worksheets</p>
            <h2 id="document-section-1" className="ed-h2 ed-statement">Print them, fill them in, bring them to the design visit.</h2>
            <ul className="ed-matrix ed-matrix-hover mt-10 list-none p-0" style={{ '--ed-cols': '3', '--ed-cell-h': '260px' } as React.CSSProperties}>
              {pdfs.map((r, i) => (
                <li key={r.id} className="p-0">
                  <a href={r.href} download className="flex h-full flex-col gap-4 p-[clamp(20px,2vw,30px)]">
                    <span className="flex items-center justify-between">
                      <span className="ed-step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <FileText className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="ed-h3">{toSentenceCase(r.title)}</span>
                    <span className="ed-body flex-1 text-[0.9375rem]">{r.description}</span>
                    <span className="ed-link"><Download className="h-4 w-4" aria-hidden="true" /> Download PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow ed-split-center">
              <div>
                <p className="ed-eyebrow">Visual guides</p>
                <h2 id="document-section-2" className="ed-h2-sm ed-statement">See the permit path before you start.</h2>
              </div>
              <div className="grid gap-4">
                {visuals.map((r) => (
                  <Link key={r.id} href={r.href} className="ed-inset flex flex-col gap-3 ed-card-link">
                    <Workflow className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    <span className="ed-h3">{toSentenceCase(r.title)}</span>
                    <span className="ed-body text-[0.9375rem]">{r.description}</span>
                    <span className="ed-link mt-2">View infographic <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section surface="gradient" spacing="xl" edge>
          <div className="ed-shell">
            <div className="ed-split ed-split-center">
              <h2 className="ed-h2-sm ed-statement-wide">Start with the cost guide, or start with a visit.</h2>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <Link href="/guides/boise-cabinet-cost-guide" className="ed-link">Start with the cost guide <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/contact" className="ed-link">Schedule a consultation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </Section>
      </>
    </InteriorPage>
  );
}
