import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { ACCESSORY_FAMILIES } from '../shared/catalog/generated/accessoryFamilies';
import { ACCESSORY_IMAGE_DESCRIPTION, getAccessoryImageDescription, getAccessoryImagePath } from '../shared/catalog/catalogImages';
import { IMAGE_IDENTITY } from '../shared/generated/imageIdentity';

// Accessory pictures (owner-approved AI stills, 19 November 2026): one picture
// per accessory, each described only by what it shows.
const DIR = 'public/images/catalog/accessories';
const bases = readdirSync(DIR).filter((file) => /\.webp$/.test(file) && !/-\d+\.webp$/.test(file)).map((file) => file.replace(/\.webp$/, ''));

test('every accessory picture has a description, and every description has its picture', () => {
  assert.equal(bases.length, 21);
  assert.deepEqual([...bases].sort(), Object.keys(ACCESSORY_IMAGE_DESCRIPTION).sort());
  for (const base of bases) for (const width of [160, 320, 640]) assert.ok(existsSync(`${DIR}/${base}-${width}.webp`), `${base}-${width}.webp is missing`);
});

test('no two accessories share a picture', () => {
  const seen = new Map<string, string>();
  for (const base of bases) {
    const hash = IMAGE_IDENTITY[`/images/catalog/accessories/${base}.webp`];
    assert.ok(hash, `${base} has no picture identity; run npm run images:blur`);
    assert.equal(seen.get(hash), undefined, `${base} is the same picture as ${seen.get(hash)}`);
    seen.set(hash, base);
  }
  for (const family of ACCESSORY_FAMILIES) {
    assert.equal(getAccessoryImagePath(family.slug), `/images/catalog/accessories/${family.slug}.webp`, 'a family shows its own picture');
    assert.ok(bases.includes(family.slug), `${family.slug} has no picture`);
  }
});

test('an accessory alt is local and says only what the picture shows', () => {
  for (const [slug, description] of Object.entries(ACCESSORY_IMAGE_DESCRIPTION)) {
    const alt = getAccessoryImageDescription(slug);
    assert.ok(alt.startsWith('Cabinet accessories in Boise, Idaho: '), alt);
    assert.ok(alt.toLowerCase().includes(description.toLowerCase().slice(1)), alt);
    assert.doesNotMatch(alt, /idea|concept|inspiration|representative|rendering|photograph|completed|recent project|our work|—/i, alt);
  }
  assert.equal(getAccessoryImageDescription('not-a-file', 'Spice Shelf'), 'Cabinet accessories in Boise, Idaho: Spice Shelf cabinet accessory');
});
