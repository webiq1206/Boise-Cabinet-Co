import {
  splitHtmlByH2,
  shouldUseCollapsibleSections,
} from '@/lib/split-article-sections';
import { HtmlWithCatalogEmbeds } from '@/components/catalog/HtmlWithCatalogEmbeds';

interface SectionedArticleProps {
  html: string;
  /** How many sections stay expanded by default (long articles). */
  defaultOpenCount?: number;
  testId?: string;
}

export function SectionedArticle({
  html,
  defaultOpenCount = 3,
  testId = 'article-content',
}: SectionedArticleProps) {
  const sections = splitHtmlByH2(html);

  if (!shouldUseCollapsibleSections(sections.length)) {
    return (
      <article className="blog-content prose-measure" data-testid={testId}>
        <HtmlWithCatalogEmbeds html={html} />
      </article>
    );
  }

  return (
    <article className="prose-measure space-y-0" data-testid={testId}>
      {sections.map((section, index) => {
        const isOpen = index < defaultOpenCount;
        const label = section.headingText || 'Overview';

        if (!section.headingHtml) {
          return (
            <HtmlWithCatalogEmbeds
              key={`section-${index}`}
              html={section.bodyHtml}
              className="blog-content pb-8 border-b border-border"
            />
          );
        }

        return (
          <details
            key={`section-${index}`}
            className="guide-section-details group border-b border-border"
            open={isOpen}
          >
            <summary className="guide-section-summary cursor-pointer list-none py-5 md:py-6 [&::-webkit-details-marker]:hidden">
              <div
                className="blog-content [&_h2]:mt-0 [&_h2]:mb-0 [&_h2]:text-xl md:[&_h2]:text-2xl flex items-start justify-between gap-4"
                dangerouslySetInnerHTML={{ __html: section.headingHtml }}
              />
              <span className="text-xs text-muted-foreground mt-1 block group-open:hidden">
                Tap to expand
              </span>
            </summary>
            <HtmlWithCatalogEmbeds
              html={section.bodyHtml}
              className="blog-content pb-8 pt-0"
            />
          </details>
        );
      })}
    </article>
  );
}
