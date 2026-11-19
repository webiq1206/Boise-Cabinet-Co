import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { BLOG_POSTS } from "../shared/blogContent.ts";
import { getBlogThumbnail } from "../shared/blogImages.ts";
import { GUIDE_PAGES } from "../shared/guideContent.ts";

// Owner, 19 November 2026: neighbouring cards on the guides and blog indexes
// never show the same picture. Pictures are compared by what they look like
// (a 64-bit difference hash), not by file name, because one photograph is
// stored under several names.
const SAME_PICTURE = 6;
const NEIGHBOURS = 3; // a desktop row holds three cards

async function fingerprint(src: string): Promise<string> {
  const pixels = await sharp(`public${src}`).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let bits = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) bits += pixels[y * 9 + x] > pixels[y * 9 + x + 1] ? "1" : "0";
  }
  return bits;
}

function distance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) d += 1;
  return d;
}

async function repeatedNeighbours(cards: { slug: string; image: string }[]): Promise<string[]> {
  const prints = await Promise.all(cards.map((card) => fingerprint(card.image)));
  const found: string[] = [];
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < Math.min(cards.length, i + NEIGHBOURS); j += 1) {
      if (distance(prints[i], prints[j]) <= SAME_PICTURE) {
        found.push(`${cards[i].slug} and ${cards[j].slug} (${cards[i].image}, ${cards[j].image})`);
      }
    }
  }
  return found;
}

test("neighbouring pillar guide cards on /guides show different pictures", async () => {
  const pillars = GUIDE_PAGES.filter((guide) => guide.guideType === "hub-pillar" || guide.guideType === "master");
  assert.ok(pillars.length > 3);
  const cards = pillars.map((guide) => ({ slug: guide.slug, image: getBlogThumbnail(guide.slug, guide.heroImage) }));
  assert.deepEqual(await repeatedNeighbours(cards), []);
});

test("neighbouring article cards on /blog show different pictures", async () => {
  assert.ok(BLOG_POSTS.length > 3);
  const cards = BLOG_POSTS.map((post) => ({ slug: post.slug, image: getBlogThumbnail(post.slug, post.thumbnail) }));
  assert.deepEqual(await repeatedNeighbours(cards), []);
});

test("the generated picture identity matches the files on disk", async () => {
  const { IMAGE_IDENTITY } = await import("../shared/generated/imageIdentity.ts");
  for (const post of BLOG_POSTS.slice(0, 12)) {
    const image = getBlogThumbnail(post.slug, post.thumbnail);
    const bits = await fingerprint(image);
    let hex = "";
    for (let i = 0; i < 64; i += 8) hex += parseInt(bits.slice(i, i + 8), 2).toString(16).padStart(2, "0");
    assert.equal(IMAGE_IDENTITY[image], hex, `${image}: run npm run images:blur`);
  }
});

test("related cards under an article or guide never repeat a photograph", async () => {
  const { getManifestLinks } = await import("../lib/internal-links.ts");
  const { pageImage } = await import("../components/marketing/KeepExploring.tsx");
  const { distinctPictures, samePicture } = await import("../shared/imageIdentity.ts");
  const paths = [
    ...BLOG_POSTS.map((post) => `/blog/${post.slug}`),
    ...GUIDE_PAGES.map((guide) => `/guides/${guide.slug}`),
  ];
  let checked = 0;
  for (const path of paths) {
    const own = pageImage(path)?.src;
    const cards = distinctPictures(getManifestLinks(path), (link) => pageImage(link.url)?.src, own ? [own] : []).slice(0, 6);
    const pictures = cards.map((link) => pageImage(link.url)?.src).filter((src): src is string => Boolean(src));
    for (let i = 0; i < pictures.length; i += 1) {
      if (own) assert.equal(samePicture(own, pictures[i]), false, `${path} repeats its own photograph in a card`);
      for (let j = i + 1; j < pictures.length; j += 1) {
        assert.equal(samePicture(pictures[i], pictures[j]), false, `${path} shows ${pictures[i]} twice`);
      }
    }
    checked += pictures.length;
  }
  assert.ok(checked > 100);
});
