/** Split HTML article body into H2-headed sections for collapsible UI. */

export interface ArticleSection {
  headingHtml: string;
  headingText: string;
  bodyHtml: string;
}

export function splitHtmlByH2(html: string): ArticleSection[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/(?=<h2[\s>])/i).filter(Boolean);
  const sections: ArticleSection[] = [];

  for (const part of parts) {
    const h2Match = part.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!h2Match) {
      if (sections.length === 0) {
        sections.push({
          headingHtml: '',
          headingText: 'Overview',
          bodyHtml: part,
        });
      } else {
        sections[sections.length - 1]!.bodyHtml += part;
      }
      continue;
    }
    const headingHtml = h2Match[0];
    const headingText = h2Match[1].replace(/<[^>]+>/g, '').trim();
    const bodyHtml = part.slice(h2Match[0].length).trim();
    sections.push({ headingHtml, headingText, bodyHtml });
  }

  return sections;
}

export function shouldUseCollapsibleSections(sectionCount: number): boolean {
  return sectionCount > 6;
}
