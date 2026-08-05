/**
 * Generates branded social-share (Open Graph) images for blog posts:
 * the post's photo under a dark brand overlay, with the seal, an eyebrow, and
 * the title in the brand font. Output: public/images/og/{slug}.png (1200x630).
 *
 * Rendered with satori (text baked to vector paths) + sharp, so it runs anywhere
 * with no native OG runtime. Usage:
 *   npx tsx scripts/generate-og-images.ts                    # all posts
 *   npx tsx scripts/generate-og-images.ts <slug> [<slug>...] # specific posts
 */
import fs from 'fs';
import path from 'path';
import satori from 'satori';
import sharp from 'sharp';
import { BLOG_POSTS } from '@/shared/blogContent';
import { GUIDE_PAGES } from '@/shared/guideContent';
import { CONTENT_HUBS } from '@/shared/contentHubs';
import { getBlogHeroImage, getHubHeroImage } from '@/shared/blogImages';

const root = process.cwd();
const ogAssets = path.join(root, 'app', 'blog', '[slug]', '_og');
const outDir = path.join(root, 'public', 'images', 'og');
fs.mkdirSync(outDir, { recursive: true });

const MONT_300 = fs.readFileSync(path.join(ogAssets, 'montserrat-300.woff'));
const MONT_600 = fs.readFileSync(path.join(ogAssets, 'montserrat-600.woff'));
const DEFAULT_BG = path.join(root, 'public', 'images', 'marketing', 'hero-home.webp');

// Minimal hyperscript for satori (React-element shape), dropping empty children.
type El = { type: string; props: Record<string, unknown> };
function h(type: string, props: Record<string, unknown>, ...children: unknown[]): El {
  const c = children.flat().filter((x) => x !== null && x !== undefined && x !== false);
  return { type, props: { ...props, children: c.length === 0 ? undefined : c.length === 1 ? c[0] : c } };
}

async function backgroundDataUri(heroPath: string): Promise<string | null> {
  const rel = heroPath.replace(/^\//, '');
  for (const file of [path.join(root, 'public', rel), DEFAULT_BG]) {
    if (fs.existsSync(file)) {
      const buf = await sharp(file).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 84 }).toBuffer();
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  }
  return null;
}

async function renderCard(title: string, bg: string | null): Promise<Buffer> {
  // Title scales down as it gets longer. Sizing is for the narrow CENTER-safe
  // column (~600px) so a 1:1 (square) crop never truncates the text.
  const titleSize = title.length > 84 ? 42 : title.length > 62 ? 48 : title.length > 44 ? 54 : 60;
  const tree = h(
    'div',
    { style: { width: 1200, height: 630, display: 'flex', position: 'relative', backgroundColor: '#1C1F1E' } },
    bg ? h('img', { src: bg, width: 1200, height: 630, style: { position: 'absolute', top: 0, left: 0 } }) : null,
    // Uniform dark overlay so centered white text stays legible over any photo.
    h('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,20,19,0.62)' } }),
    // Teal top accent line
    h('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: '#7AAAAA' } }),
    // CENTERED content kept inside the middle ~600px (300px side padding). A
    // square (1:1) crop keeps the center 630px, so nothing here is ever cut off;
    // it also reads well at the full 1.91:1 size for Facebook / LinkedIn / X.
    h(
      'div',
      {
        style: {
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 300px',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', marginBottom: 22 } },
        h('div', { style: { width: 34, height: 2, backgroundColor: '#7AAAAA', marginRight: 14 } }),
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 17, letterSpacing: 2, color: '#E6E3DE' } },
          'BOISE CABINET CO · BOISECABINET.CO',
        ),
        h('div', { style: { width: 34, height: 2, backgroundColor: '#7AAAAA', marginLeft: 14 } }),
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: 'Montserrat', fontWeight: 300, fontSize: titleSize, lineHeight: 1.14, letterSpacing: -0.5, color: '#F7F5F3', textAlign: 'center', maxWidth: 600 } },
        title,
      ),
    ),
  );

  const svg = await satori(tree as unknown as React.ReactNode, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Montserrat', data: MONT_300, weight: 300, style: 'normal' },
      { name: 'Montserrat', data: MONT_600, weight: 600, style: 'normal' },
    ],
  });
  // JPEG for OG: universal crawler support (iMessage/FB/X/LinkedIn) and ~4x
  // smaller than PNG for photographic cards.
  return sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

interface OgItem {
  slug: string;
  title: string;
  heroPath: string;
}

async function main() {
  const force = process.argv.includes('--force');
  const requested = process.argv.slice(2).filter((a) => !a.startsWith('-'));

  // Collect all items: blog posts + guide pages + hub category pages
  const allItems: OgItem[] = [
    ...BLOG_POSTS.map((p) => ({
      slug: p.slug,
      title: p.title,
      heroPath: getBlogHeroImage(p.slug, p.heroImage),
    })),
    ...GUIDE_PAGES.map((g) => ({
      slug: g.slug,
      title: g.seoTitle || g.title,
      heroPath: getBlogHeroImage(g.slug, g.heroImage),
    })),
    ...CONTENT_HUBS.map((h) => ({
      slug: h.hubSlug,
      title: `${h.title} Articles`,
      heroPath: getHubHeroImage(h.hubSlug),
    })),
  ];

  const items = requested.length
    ? allItems.filter((item) => requested.includes(item.slug))
    : allItems;

  let made = 0;
  let upToDate = 0;
  for (const item of items) {
    const out = path.join(outDir, `${item.slug}.jpg`);
    // In the default (build) pass, only create cards that are missing so builds
    // stay fast and committed images don't churn. Use --force (or name a slug) to
    // regenerate, e.g. after a title change or once a post's AI photo exists.
    if (!force && !requested.length && fs.existsSync(out)) {
      upToDate++;
      continue;
    }
    const bg = await backgroundDataUri(item.heroPath);
    const jpg = await renderCard(item.title, bg);
    fs.writeFileSync(out, jpg);
    made++;
    console.log(`✓ og: ${item.slug} (${(jpg.length / 1024).toFixed(0)}kb)${bg ? '' : ' [charcoal fallback]'}`);
  }
  console.log(`OG images: ${made} generated, ${upToDate} up-to-date → public/images/og/ (${allItems.length} total: ${BLOG_POSTS.length} posts + ${GUIDE_PAGES.length} guides + ${CONTENT_HUBS.length} hubs)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
