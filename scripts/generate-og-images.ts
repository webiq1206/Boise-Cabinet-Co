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
import { getBlogHeroImage } from '@/shared/blogImages';

const root = process.cwd();
const ogAssets = path.join(root, 'app', 'blog', '[slug]', '_og');
const outDir = path.join(root, 'public', 'images', 'og');
fs.mkdirSync(outDir, { recursive: true });

const MONT_300 = fs.readFileSync(path.join(ogAssets, 'montserrat-300.woff'));
const MONT_600 = fs.readFileSync(path.join(ogAssets, 'montserrat-600.woff'));
const EMBLEM = `data:image/png;base64,${fs.readFileSync(path.join(ogAssets, 'emblem.png')).toString('base64')}`;
const DEFAULT_BG = path.join(root, 'public', 'images', 'marketing', 'hero-home.webp');

// Minimal hyperscript for satori (React-element shape), dropping empty children.
type El = { type: string; props: Record<string, unknown> };
function h(type: string, props: Record<string, unknown>, ...children: unknown[]): El {
  const c = children.flat().filter((x) => x !== null && x !== undefined && x !== false);
  return { type, props: { ...props, children: c.length === 0 ? undefined : c.length === 1 ? c[0] : c } };
}

async function backgroundDataUri(slug: string): Promise<string | null> {
  const rel = getBlogHeroImage(slug).replace(/^\//, '');
  for (const file of [path.join(root, 'public', rel), DEFAULT_BG]) {
    if (fs.existsSync(file)) {
      const buf = await sharp(file).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 84 }).toBuffer();
      return `data:image/jpeg;base64,${buf.toString('base64')}`;
    }
  }
  return null;
}

async function renderCard(title: string, bg: string | null): Promise<Buffer> {
  const titleSize = title.length > 82 ? 50 : title.length > 56 ? 58 : 68;
  const tree = h(
    'div',
    { style: { width: 1200, height: 630, display: 'flex', position: 'relative', backgroundColor: '#1C1F1E' } },
    bg ? h('img', { src: bg, width: 1200, height: 630, style: { position: 'absolute', top: 0, left: 0 } }) : null,
    h('div', {
      style: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(120deg, rgba(20,22,21,0.90) 0%, rgba(20,22,21,0.50) 55%, rgba(20,22,21,0.32) 100%)',
      },
    }),
    h('div', {
      style: {
        position: 'absolute', left: 0, right: 0, bottom: 0, top: '30%',
        background: 'linear-gradient(to top, rgba(20,22,21,0.94), rgba(20,22,21,0))',
      },
    }),
    // Sage top accent line
    h('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: '#5D6561' } }),
    // Seal, top-left
    h('img', { src: EMBLEM, width: 96, height: 96, style: { position: 'absolute', top: 54, left: 64 } }),
    // Eyebrow + title, bottom-left
    h(
      'div',
      { style: { position: 'absolute', left: 64, right: 64, bottom: 60, display: 'flex', flexDirection: 'column' } },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', marginBottom: 18 } },
        h('div', { style: { width: 44, height: 2, backgroundColor: '#5D6561', marginRight: 16 } }),
        h(
          'div',
          { style: { display: 'flex', fontFamily: 'Montserrat', fontWeight: 600, fontSize: 19, letterSpacing: 3, color: '#E6E3DE' } },
          'BOISE CABINET CO · BOISECABINET.CO',
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: 'Montserrat', fontWeight: 300, fontSize: titleSize, lineHeight: 1.06, letterSpacing: -1, color: '#F7F5F3', maxWidth: 1020 } },
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

async function main() {
  const requested = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const posts = requested.length
    ? BLOG_POSTS.filter((p) => requested.includes(p.slug))
    : BLOG_POSTS;

  for (const post of posts) {
    const bg = await backgroundDataUri(post.slug);
    const jpg = await renderCard(post.title, bg);
    const out = path.join(outDir, `${post.slug}.jpg`);
    fs.writeFileSync(out, jpg);
    console.log(`✓ og: ${post.slug} (${(jpg.length / 1024).toFixed(0)}kb)${bg ? '' : ' [charcoal fallback]'}`);
  }
  console.log(`Done: ${posts.length} OG image(s) → public/images/og/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
