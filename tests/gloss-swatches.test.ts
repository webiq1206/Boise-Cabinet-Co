/**
 * Gloss on every finish swatch (owner, 21 November 2026: "the gloss images
 * look terrible with the 2 tone and abstract shapes... can you make them all
 * actually look like gloss", then "whatever provides the absolute most
 * accuracy and consistency").
 *
 * The supplier paints a reflection onto every gloss sample. The homepage
 * picker and the door visualizer draw a gloss door from its clean surface;
 * every other swatch on the site shows the clean swatch
 * (/images/catalog/finishes/gloss-swatch/) through finishSwatchSrc() and gets
 * the drawn gloss through glossSheenClass(). These tests fail if a visitor
 * facing gloss swatch shows the painted sample.
 */
import assert from 'node:assert/strict';
import Module from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { FINISHES } from '../shared/catalog/generated/finishes';
import { DOOR_STYLES } from '../shared/catalog/generated/doorStyles';
import { GLOSS_SURFACE_FILES } from '../shared/catalog/generated/glossSurfaces';
import {
  GLOSS_SHEEN_CLASS,
  finishSwatchSrc,
  glossSheenClass,
  glossSurface,
  glossSwatch,
} from '../shared/catalog/glossSurface';
import { getFinishImages } from '../shared/catalog/entityImagePaths';
import { pickSearchResultImage } from '../shared/catalog/entityImages';
import { searchCatalogWithFacets } from '../shared/catalog/queries';
import { getFinishColorOptions } from '../shared/estimateEngine';
import { visualizerFinishes } from '../shared/doorVisualizer';
import { IMAGE_VARIANTS } from '../shared/generated/imageVariants';
import { pickVariant } from '../lib/images/staticVariantLoader';

(Module as unknown as { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions['.css'] = (module) => {
  module.exports = {};
};
(globalThis as typeof globalThis & { React: typeof React }).React = React;

const gloss = FINISHES.filter((finish) => finish.category === 'gloss');
const others = FINISHES.filter((finish) => finish.category !== 'gloss');
/** A painted catalog gloss sample, at any size. */
const PAINTED = /\/images\/catalog\/finishes\/gloss-[a-z0-9-]+\.webp/;

test('every gloss finish has a clean swatch on disk, with resized copies the loader serves', async () => {
  assert.equal(gloss.length, 53);
  for (const finish of gloss) {
    const swatch = finishSwatchSrc(finish.imagePath);
    assert.equal(swatch, glossSwatch(finish.imagePath), finish.slug);
    assert.match(swatch, /^\/images\/catalog\/finishes\/gloss-swatch\/gloss-[a-z0-9-]+\.webp$/, `${finish.slug} shows the painted sample`);
    assert.ok(existsSync(`public${glossSurface(finish.imagePath)}`), `${finish.slug} has no surface`);
    const base = await sharp(`public${swatch}`).metadata();
    assert.equal(base.width, 640, swatch);
    assert.equal(base.height, 640, swatch);
    assert.deepEqual(IMAGE_VARIANTS[swatch], [160, 320, 640], `${swatch} is not in the variant manifest`);
    // A variant is a resize of its base: same picture, smaller.
    const reference = await sharp(`public${swatch}`).resize(8, 8).removeAlpha().raw().toBuffer();
    for (const width of [160, 320, 640]) {
      const file = `public${swatch.replace(/\.webp$/, `-${width}.webp`)}`;
      const meta = await sharp(file).metadata();
      assert.equal(meta.width, width, file);
      const small = await sharp(file).resize(8, 8).removeAlpha().raw().toBuffer();
      let diff = 0;
      for (let i = 0; i < small.length; i += 1) diff += Math.abs(small[i] - reference[i]);
      assert.ok(diff / small.length < 6, `${file} is not a resize of its base`);
    }
    // The loader picks a clean copy at every size, never a painted one.
    for (const width of [64, 160, 320, 640, 1080]) {
      assert.doesNotMatch(pickVariant({ src: swatch, width }), PAINTED);
    }
  }
  for (const file of GLOSS_SURFACE_FILES) {
    assert.ok(existsSync(`public/images/catalog/finishes/gloss-swatch/${file}`), `${file} has no swatch`);
  }
});

test('every other finish keeps its catalog sample and gets no sheen', () => {
  for (const finish of others) {
    assert.equal(finishSwatchSrc(finish.imagePath), finish.imagePath, finish.slug);
    assert.equal(glossSheenClass(finishSwatchSrc(finish.imagePath)), undefined, finish.slug);
  }
  for (const finish of gloss) {
    assert.equal(glossSheenClass(finishSwatchSrc(finish.imagePath)), GLOSS_SHEEN_CLASS, finish.slug);
  }
});

test('every path that hands a finish picture to a page gives a gloss its clean swatch', () => {
  for (const finish of FINISHES) {
    const images = getFinishImages(finish.slug, finish.imagePath);
    assert.equal(images.swatch, finishSwatchSrc(finish.imagePath), finish.slug);
    // The printed catalog keeps the supplier's sample: a PDF cannot draw the gloss.
    assert.equal(images.sample, finish.imagePath, finish.slug);
    assert.equal(pickSearchResultImage({ type: 'finish', slug: finish.slug }), images.swatch, finish.slug);
  }
  const results = searchCatalogWithFacets('', { finishCategory: 'gloss' }).filter((result) => result.type === 'finish');
  assert.equal(results.length, gloss.length);
  for (const result of results) assert.match(result.imagePath ?? '', /\/gloss-swatch\//, result.slug);
  for (const style of DOOR_STYLES) {
    for (const option of getFinishColorOptions(style.id)) {
      assert.doesNotMatch(option.image ?? '', PAINTED, `${style.slug} ${option.value}`);
    }
  }
  // The drawn door keeps the surface in the sample's geometry.
  for (const finish of visualizerFinishes().filter((item) => item.family === 'gloss')) {
    assert.match(finish.image, /\/gloss-surface\//, finish.slug);
  }
});

async function render(element: React.ReactElement): Promise<string> {
  return renderToStaticMarkup(element).replace(/%2F/gi, "/");
}

test('the swatch components show the clean swatch with the drawn gloss, and leave other finishes alone', async () => {
  const { FinishSwatch } = await import('../components/catalog/FinishSwatch');
  const { CatalogVisualCard } = await import('../components/catalog/visual/CatalogVisualCard');
  const { VisualOptionTile } = await import('../components/catalog/visual/VisualOptionTile');
  const { VisualSearchResult } = await import('../components/catalog/visual/VisualSearchResult');
  const { FinishDualPreview } = await import('../components/catalog/visual/FinishDualPreview');
  const sample = (finish: (typeof FINISHES)[number]) => {
    const swatch = getFinishImages(finish.slug, finish.imagePath).swatch!;
    return [
      React.createElement(FinishSwatch, { finish }),
      React.createElement(CatalogVisualCard, { name: finish.name, imageSrc: swatch, imageAlt: finish.name, aspectRatio: '1/1' }),
      React.createElement(VisualOptionTile, { label: finish.name, imageSrc: swatch, variant: 'swatch', onSelect: () => {} }),
      React.createElement(VisualSearchResult, { href: '/catalog', type: 'finish', name: finish.name, description: '', imagePath: swatch }),
      React.createElement(FinishDualPreview, { finish }),
    ];
  };
  for (const finish of [gloss[0], gloss.find((f) => f.slug === 'gloss-ash')!]) {
    for (const element of sample(finish)) {
      const html = await render(element);
      assert.match(html, /\/gloss-swatch\//, `${finish.slug}: ${html.slice(0, 200)}`);
      assert.doesNotMatch(html, PAINTED, `${finish.slug} renders the painted sample`);
      assert.match(html, /class="[^"]*\bgloss-sheen\b/, `${finish.slug} has no drawn gloss`);
    }
  }
  const matte = others.find((finish) => finish.category === 'matte')!;
  for (const element of sample(matte)) {
    const html = await render(element);
    assert.doesNotMatch(html, /gloss-sheen/, matte.slug);
  }
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === 'node_modules' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

test('no page or component hands a finish sample straight to an image', () => {
  for (const file of [...sourceFiles('app'), ...sourceFiles('components')]) {
    const source = readFileSync(file, 'utf8');
    const direct = source.match(/src=\{\s*[\w.?!]*finish[\w.?!]*\.imagePath\b[^}]*\}/gi) ?? [];
    assert.deepEqual(direct, [], `${file} shows a finish's catalog sample: use finishSwatchSrc()`);
  }
});

test('one drawn gloss for every swatch, the picker chips and the visualizer chips', () => {
  const css = readFileSync('app/gloss-sheen.css', 'utf8');
  assert.match(css, /--gloss-sheen:\s*linear-gradient/);
  assert.match(css, /\.gloss-sheen::after\s*\{[^}]*background:\s*var\(--gloss-sheen\)/);
  assert.match(readFileSync('app/layout.tsx', 'utf8'), /import '\.\/gloss-sheen\.css'/);
  assert.match(readFileSync('app/finish-picker.css', 'utf8'), /\.fp-opt-gloss \.fp-chip::after\{[^}]*background:var\(--gloss-sheen\)/);
  assert.match(readFileSync('app/door-visualizer.css', 'utf8'), /\.dv-chip-gloss \.dv-chip-face::after \{[^}]*background: var\(--gloss-sheen\)/);
});
