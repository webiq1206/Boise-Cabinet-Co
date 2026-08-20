import { ROOM_CATEGORIES } from '@/shared/catalog/roomCategories';
import { MARKETING_IMAGES } from '@/shared/siteImages';
import { PROJECTS } from '@/shared/galleryData';
import { BLOG_POSTS } from '@/shared/blogContent';
import { getBlogThumbnail } from '@/shared/blogImages';

/**
 * /image-sitemap.xml - Google Image sitemap extension.
 *
 * The main sitemap lists pages only, so our photography was invisible to image
 * search and to multimodal AI systems that index visual context. This maps each
 * image to the page it appears on, with a descriptive title, which is what
 * image search and vision models use to understand it.
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

const abs = (p: string) => (p.startsWith('http') ? p : `${BASE}${p}`);

interface Entry {
  page: string;
  images: Array<{ loc: string; title: string }>;
}

export function GET() {
  const entries: Entry[] = [];

  // Homepage hero + statement photography.
  entries.push({
    page: `${BASE}/`,
    images: [
      { loc: abs(MARKETING_IMAGES.heroHome), title: 'Custom cream shaker kitchen cabinets with a white oak island and aged brass hardware in a Treasure Valley, Idaho home' },
      { loc: abs(MARKETING_IMAGES.hardware), title: 'Satin nickel bar pulls on custom painted cabinet drawers by Boise Cabinet Co' },
      { loc: abs(MARKETING_IMAGES.designStudio), title: 'Cabinet door samples, finish swatches, and a kitchen layout rendering during a design consultation' },
    ],
  });

  // One canonical image per room landing page.
  for (const room of ROOM_CATEGORIES) {
    if (!room.heroImage) continue;
    entries.push({
      page: `${BASE}/cabinets/${room.slug}`,
      images: [{ loc: abs(room.heroImage), title: `Custom ${room.name.toLowerCase()} cabinets built by Boise Cabinet Co in Meridian, Idaho` }],
    });
  }

  // Project imagery (design concepts are labeled as such; verified projects are
  // described as completed work).
  entries.push({
    page: `${BASE}/testimonials`,
    images: PROJECTS.map((project) => ({
      loc: abs(project.hero.src),
      title:
        project.kind === 'concept'
          ? `Cabinet design concept: ${project.title} for Treasure Valley homes`
          : `${project.title}: custom cabinets by Boise Cabinet Co in the Treasure Valley`,
    })),
  });

  // Article imagery, mapped to the article it illustrates.
  for (const post of BLOG_POSTS) {
    const img = getBlogThumbnail(post.slug, post.thumbnail);
    if (!img) continue;
    entries.push({
      page: `${BASE}/blog/${post.slug}`,
      images: [{ loc: abs(img), title: post.title }],
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .filter((e) => e.images.length > 0)
  .map(
    (e) => `  <url>
    <loc>${esc(e.page)}</loc>
${e.images
  .map(
    (i) => `    <image:image>
      <image:loc>${esc(i.loc)}</image:loc>
      <image:title>${esc(i.title)}</image:title>
    </image:image>`,
  )
  .join('\n')}
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
