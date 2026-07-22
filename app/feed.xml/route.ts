import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { guidePath } from '@/shared/contentHubs';
import { SITE_CONFIG } from '@/shared/siteConfig';

/**
 * /feed.xml - RSS 2.0 feed of guides and articles.
 *
 * Feeds remain one of the most reliable discovery surfaces for crawlers, news
 * aggregators, and AI agents that poll for new content instead of re-crawling
 * a 130-page site. Answer-first: each item's description is the page's direct
 * answer, so a syndicating system gets the substance without fetching the page.
 */
export const dynamic = 'force-static';

const BASE = 'https://boisecabinet.co';

function esc(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plain(html: string | undefined | null): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function GET() {
  const items = [
    ...GUIDE_PAGES.map((g) => ({
      title: g.title,
      url: `${BASE}${guidePath(g.slug)}`,
      desc: plain(g.quickAnswer || g.metaDescription || g.excerpt),
      date: g.publishedAt,
      cat: 'Guide',
    })),
    ...BLOG_POSTS.map((p) => ({
      title: p.title,
      url: `${BASE}/blog/${p.slug}`,
      desc: plain(p.quickAnswer || p.excerpt),
      date: p.updatedAt || p.publishedAt,
      cat: p.category || 'Article',
    })),
  ]
    .filter((i) => i.title && i.url)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 100);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_CONFIG.name)} | Cabinet guides and insights</title>
    <link>${BASE}</link>
    <description>Custom cabinet guides, cost planning, and design advice for Boise and the Treasure Valley.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(items[0]?.date || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.url)}</link>
      <guid isPermaLink="true">${esc(i.url)}</guid>
      <category>${esc(i.cat)}</category>
      <pubDate>${new Date(i.date || Date.now()).toUTCString()}</pubDate>
      <description>${esc(i.desc)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
