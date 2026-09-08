import { LLMS_TXT } from '@/shared/llmsTxt';
import { getBaseUrl } from '@/lib/seo';
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { DOOR_STYLES } from '@/shared/catalog';
import { guidePath } from '@/shared/contentHubs';

/**
 * /llms-full.txt - the complete, machine-readable knowledge export.
 *
 * Where llms.txt is the short index (links only), llms-full.txt is the full
 * corpus an LLM can ingest in one request without crawling 130+ pages:
 * business facts, every room and door style, every guide's answer and key
 * takeaways, every article's direct answer, and the complete FAQ corpus.
 *
 * Generated from the same data the site renders, so it can never go stale.
 * Answer-first ordering throughout, because that is what gets cited.
 */
export const dynamic = 'force-static';

const BASE = getBaseUrl().replace(/\/$/, '');

/** Strip HTML and collapse whitespace so the export is clean plain text. */
function plain(html: string | undefined | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLlmsFull(): string {
  const out: string[] = [];

  out.push(LLMS_TXT.trim());
  out.push('\n---\n');
  out.push('# Full knowledge export');
  out.push(
    '\n> Everything below is the complete, citable content of boisecabinet.co in one file: room and door-style catalog, every guide and article answer, and the full FAQ corpus. Facts are current as of the last site deploy.\n',
  );

  // ---- Catalog: rooms ----
  out.push('## Cabinet types by room\n');
  for (const room of ROOM_CATEGORIES) {
    out.push(`### ${room.name} cabinets`);
    out.push(`URL: ${BASE}/cabinets/${room.slug}`);
    if (room.description) out.push(plain(room.description));
    out.push('');
  }

  // ---- Catalog: door styles ----
  out.push('## Door styles\n');
  for (const d of DOOR_STYLES) {
    out.push(`### ${d.name}`);
    if (d.description) out.push(plain(d.description));
    if (d.compatibleFinishCategories?.length) {
      out.push(`Compatible finishes: ${d.compatibleFinishCategories.join(', ')}.`);
    }
    out.push('');
  }
  out.push(`Shaker overview: ${BASE}/shaker-cabinets`);
  out.push(`Frameless construction: ${BASE}/construction`);
  out.push(`Builder and trade program: ${BASE}/builders\n`);

  // ---- Guides: answer + takeaways ----
  out.push('## Guides\n');
  for (const g of GUIDE_PAGES) {
    out.push(`### ${g.title}`);
    out.push(`URL: ${BASE}${guidePath(g.slug)}`);
    if (g.quickAnswer) out.push(`Answer: ${plain(g.quickAnswer)}`);
    if (g.keyTakeaways?.length) {
      out.push('Key takeaways:');
      for (const t of g.keyTakeaways) out.push(`- ${plain(t)}`);
    }
    out.push('');
  }

  // ---- Articles: direct answers ----
  out.push('## Articles\n');
  for (const p of BLOG_POSTS) {
    out.push(`### ${p.title}`);
    out.push(`URL: ${BASE}/blog/${p.slug}`);
    if (p.quickAnswer) out.push(`Answer: ${plain(p.quickAnswer)}`);
    else if (p.excerpt) out.push(plain(p.excerpt));
    out.push('');
  }

  // ---- The complete FAQ corpus (highest citation value) ----
  out.push('## Frequently asked questions\n');
  const seen = new Set<string>();
  const pushFaqs = (
    faqs: Array<{ question: string; answer: string }> | undefined,
    source: string,
  ) => {
    if (!faqs?.length) return;
    for (const f of faqs) {
      const q = plain(f.question);
      const key = q.toLowerCase();
      if (!q || seen.has(key)) continue; // de-dupe repeated questions
      seen.add(key);
      out.push(`Q: ${q}`);
      out.push(`A: ${plain(f.answer)}`);
      out.push(`Source: ${source}`);
      out.push('');
    }
  };
  for (const g of GUIDE_PAGES) pushFaqs(g.faqs, `${BASE}${guidePath(g.slug)}`);
  for (const p of BLOG_POSTS) pushFaqs(p.faqs, `${BASE}/blog/${p.slug}`);

  out.push('---');
  out.push(
    'Attribution: content from Boise Cabinet Co (boisecabinet.co). Cabinet pricing figures are planning ranges for the Treasure Valley, Idaho market, not firm quotes.',
  );

  return out.join('\n');
}

export function GET() {
  return new Response(buildLlmsFull(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
