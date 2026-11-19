import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { heroImageAttrs } from '../components/approved/InteriorLayout';
import { versionedSrc, versionedSrcSet } from '../lib/images/imageVersion';
import staticVariantLoader, { pickVariant } from '../lib/images/staticVariantLoader';
import { IMAGE_VERSIONS } from '../shared/generated/imageVersions';
// @ts-expect-error plain module script
import { currentImageHashes } from '../scripts/images/build-image-versions.mjs';

// /images and /generated are served immutable for a year, keyed by URL. A
// photograph replaced under the same file name must therefore change its URL.
const hashes: Record<string, string> = currentImageHashes();
const recorded: Record<string, string> = JSON.parse(readFileSync('shared/generated/imageHashes.json', 'utf8'));

test('the record of image contents is current (run npm run images:versions after adding or replacing an image)', () => {
  assert.deepEqual(recorded, hashes);
});

test('every replaced image carries the hash of the file as it is now', () => {
  for (const [file, version] of Object.entries(IMAGE_VERSIONS)) {
    assert.ok(hashes[file], `${file} is versioned but no longer exists`);
    assert.equal(version, hashes[file].slice(0, 8), file);
  }
});

test('photographs replaced in November 2026 are versioned, with their size variants', () => {
  for (const file of [
    '/images/areas/boise.webp',
    '/images/areas/boise-640.webp',
    '/images/areas/boise-1080.webp',
    '/images/catalog/rooms/kitchen-walnut-mountain.webp',
    '/images/catalog/collections/custom.webp',
  ]) {
    assert.ok(IMAGE_VERSIONS[file], file);
  }
});

// A file git has seen change since 1 November 2026 is a replaced file. Skipped where history is shallow.
test('every image git history shows as replaced is versioned', (t) => {
  let changed: string[];
  try {
    if (execSync('git rev-parse --is-shallow-repository', { encoding: 'utf8' }).trim() === 'true') return t.skip('shallow clone');
    changed = execSync('git log --since=2026-11-01 --diff-filter=M --name-only --pretty=format: -- public/images public/generated public/family', {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
      .split('\n')
      .filter(Boolean)
      .map((f) => f.replace(/^public/, ''));
  } catch {
    return t.skip('no git history');
  }
  const missing = [...new Set(changed)].filter((f) => f in hashes && !(f in IMAGE_VERSIONS));
  assert.deepEqual(missing, []);
});

test('a replaced local image gets its version and everything else is left alone', () => {
  const [file, version] = Object.entries(IMAGE_VERSIONS)[0];
  assert.equal(versionedSrc(file), `${file}?v=${version}`);
  const untouched = Object.keys(hashes).find((f) => !(f in IMAGE_VERSIONS))!;
  assert.equal(versionedSrc(untouched), untouched);
  assert.equal(versionedSrc(`${file}?v=1`), `${file}?v=1`);
  assert.equal(versionedSrc('https://example.com/a.webp'), 'https://example.com/a.webp');
  assert.equal(versionedSrc('//example.com/a.webp'), '//example.com/a.webp');
  assert.equal(versionedSrcSet(`${file} 640w, ${untouched} 1080w`), `${file}?v=${version} 640w, ${untouched} 1080w`);
});

test('the next/image loader versions the variant it picks, not the base it was given', () => {
  const base = '/images/blog/best-kitchen-cabinet-colors.webp';
  for (const width of [320, 640, 1080, 1920, 3840]) {
    const plain = pickVariant({ src: base, width });
    assert.ok(IMAGE_VERSIONS[plain], plain);
    assert.equal(staticVariantLoader({ src: base, width }), `${plain}?v=${IMAGE_VERSIONS[plain]}`);
  }
  assert.equal(pickVariant({ src: base, width: 640 }), '/images/blog/best-kitchen-cabinet-colors-640.webp');
  assert.equal(staticVariantLoader({ src: 'https://example.com/a.webp', width: 640 }), 'https://example.com/a.webp');
});

test('every size variant of a replaced photograph is versioned', () => {
  const bases = new Set(Object.keys(IMAGE_VERSIONS).map((f) => f.replace(/\.[a-z0-9]+$/i, '')));
  const missing = Object.keys(hashes).filter((f) => {
    const m = /^(.*)-\d+\.webp$/.exec(f);
    return m && bases.has(m[1]) && !(f in IMAGE_VERSIONS);
  });
  assert.deepEqual(missing, []);
});

test('hero attributes carry the version on src and on every srcset entry', () => {
  const attrs = heroImageAttrs('/images/areas/boise.webp');
  assert.match(attrs.src, /\/images\/areas\/boise-1080\.webp\?v=[0-9a-f]{8}$/);
  for (const part of attrs.srcSet!.split(', ')) assert.match(part, /\?v=[0-9a-f]{8} \d+w$/);
});

// A plain <img> skips the loader, so a literal path there must go through versionedSrc().
test('no plain <img> names an /images, /generated or /family file without versionedSrc()', () => {
  const bare: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full !== path.join('components', 'family')) walk(full);
      } else if (/\.tsx$/.test(entry.name)) {
        const source = readFileSync(full, 'utf8');
        for (const m of source.matchAll(/<img\b[^>]*?\bsrc=(?:"|\{['"`])\/(?:images|generated|family)\/[^>]*/g)) bare.push(`${full}: ${m[0].slice(0, 90)}`);
      }
    }
  };
  walk('app');
  walk('components');
  assert.deepEqual(bare, []);
});

test('the loader stays the one place next/image URLs are made', () => {
  const config = readFileSync('next.config.js', 'utf8');
  assert.match(config, /loaderFile: '\.\/lib\/images\/staticVariantLoader\.ts'/);
  const unoptimized: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full !== path.join('components', 'family')) walk(full);
      } else if (/\.tsx$/.test(entry.name) && /\bunoptimized\b/.test(readFileSync(full, 'utf8'))) unoptimized.push(full);
    }
  };
  walk('app');
  walk('components');
  assert.deepEqual(unoptimized, [], 'an unoptimized image skips the loader and its version');
});
