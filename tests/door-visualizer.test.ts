import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { DOOR_STYLES } from '../shared/catalog/generated/doorStyles';
import { FINISHES } from '../shared/catalog/generated/finishes';
import {
  DEFAULT_VISUALIZER_FINISH,
  DEFAULT_VISUALIZER_STYLE,
  DOOR_VISUALIZER_PATH,
  DRAWN_DOOR_STYLES,
  parseVisualizerSelection,
  resolveVisualizerSelection,
  visualizerFamilyCounts,
  visualizerFinishes,
  visualizerHref,
  visualizerQuoteLine,
  visualizerStyles,
} from '../shared/doorVisualizer';
import { getSiteUrlGroups } from '../lib/siteUrls';

// The door visualizer (owner, 19 November 2026): every catalog finish on every
// catalog door style, drawn on the page from the finish's own catalog sample.
const finishes = visualizerFinishes();
const styles = visualizerStyles();

test('every catalog finish is offered, with its real name, family, sample and chip on disk', () => {
  assert.equal(finishes.length, FINISHES.length);
  assert.equal(finishes.length, 299);
  assert.equal(new Set(finishes.map((f) => f.slug)).size, finishes.length);
  for (const finish of finishes) {
    const source = FINISHES.find((item) => item.slug === finish.slug);
    assert.ok(source, finish.slug);
    assert.equal(finish.name, source.name, 'the name is the catalog name');
    assert.equal(finish.family, source.category);
    // A gloss is drawn from its clean surface (the supplier's painted
    // reflection removed); every other finish from its catalog sample.
    const surface = source.category === 'gloss' ? `/images/catalog/finishes/gloss-surface/${source.imagePath!.split('/').pop()}` : null;
    assert.equal(finish.image, surface && existsSync(`public${surface}`) ? surface : source.imagePath);
    assert.ok(existsSync(`public${finish.image}`), `${finish.image} is not on disk`);
    assert.ok(existsSync(`public${finish.chip}`), `${finish.chip} is not on disk`);
    assert.deepEqual(finish.styles, source.compatibleDoorStyleIds, 'a finish is offered on the door styles the catalog lists');
  }
  assert.deepEqual(visualizerFamilyCounts(finishes), { matte: 55, gloss: 53, woodgrain: 191 });
});

test('every catalog door style is drawn, and only catalog door styles', () => {
  assert.deepEqual(styles.map((s) => s.slug), DOOR_STYLES.map((s) => s.slug), 'a catalog door style has no drawing');
  assert.equal(styles.length, 6);
  const css = readFileSync('app/door-visualizer.css', 'utf8');
  for (const slug of DRAWN_DOOR_STYLES) {
    const source = DOOR_STYLES.find((style) => style.slug === slug);
    assert.ok(source, `${slug} is not a catalog door style`);
    assert.ok(existsSync(`public${source.imagePath}`), `${slug} has no catalog picture to draw from`);
    // Modern Shaker is the shared drawing itself; every other style has its own rules.
    if (slug !== 'modern-shaker') assert.ok(css.includes(`.fp-profile-${slug}`), `no drawing rules for ${slug}`);
  }
  for (const style of styles) {
    const source = DOOR_STYLES.find((item) => item.slug === style.slug);
    assert.deepEqual(style.families, source?.compatibleFinishCategories);
  }
});

test('the selection lives in the address and round-trips', () => {
  for (const finish of [finishes[0], finishes[70], finishes[finishes.length - 1]]) {
    for (const style of finish.styles) {
      const url = new URL(visualizerHref({ finish: finish.slug, style }), 'https://example.test');
      assert.equal(url.pathname, DOOR_VISUALIZER_PATH);
      const back = resolveVisualizerSelection(url.searchParams);
      assert.equal(back.finish, finish.slug);
      assert.equal(back.style, style);
      assert.equal(back.family, finish.family);
    }
  }
  const filtered = parseVisualizerSelection({ finish: 'matte-snow-white', style: 'slab', family: 'woodgrain', q: ' oak ' }, finishes);
  assert.deepEqual(filtered, { finish: 'matte-snow-white', style: 'slab', family: 'woodgrain', q: 'oak' });
});

test('anything the catalog does not hold falls back to a white shaker', () => {
  const none = resolveVisualizerSelection({});
  assert.equal(none.finish, DEFAULT_VISUALIZER_FINISH);
  assert.equal(none.style, DEFAULT_VISUALIZER_STYLE);
  assert.match(finishes.find((f) => f.slug === none.finish)?.name ?? '', /white/i);
  assert.equal(resolveVisualizerSelection({ finish: 'nope', style: 'nope', family: 'nope' }).finish, DEFAULT_VISUALIZER_FINISH);
  // 3 Piece is a woodgrain door: a matte finish cannot be shown on it.
  const matte = resolveVisualizerSelection({ finish: 'matte-pearl-black', style: 'three-piece' });
  assert.equal(matte.style, DEFAULT_VISUALIZER_STYLE);
  const grain = resolveVisualizerSelection({ finish: 'woodgrain-natural-carini-walnut', style: 'three-piece' });
  assert.equal(grain.style, 'three-piece');
  for (const finish of finishes) assert.ok(finish.styles.includes(DEFAULT_VISUALIZER_STYLE), `${finish.slug} has no shaker to fall back to`);
});

test('the quote line names only the door style and the finish', () => {
  const line = visualizerQuoteLine(finishes.find((f) => f.slug === 'gloss-anthracite')!, styles.find((s) => s.slug === 'alpha-shaker')!);
  assert.equal(line, 'Door style: Alpha Shaker. Finish: Anthracite (gloss).');
});

test('the page is in the sitemap, the catalog, the footer and the homepage picker', () => {
  const paths = getSiteUrlGroups().flatMap((group) => group.entries.map((entry) => entry.path));
  assert.ok(paths.includes(DOOR_VISUALIZER_PATH));
  assert.match(readFileSync('app/catalog/page.tsx', 'utf8'), /href="\/catalog\/door-visualizer"/);
  assert.match(readFileSync('lib/familyBrand.ts', 'utf8'), /href: '\/catalog\/door-visualizer'/);
  const picker = readFileSync('components/approved/HomeDoorPicker.tsx', 'utf8');
  assert.match(picker, /href=\{visualizerHref\(\{ finish: finish\.slug, style \}\)\}>Full door visualizer/);
  const audit: { route: string; file: string }[] = JSON.parse(readFileSync('docs/interior-route-audit.json', 'utf8'));
  assert.ok(audit.some((entry) => entry.route === DOOR_VISUALIZER_PATH && entry.file === 'app/catalog/door-visualizer/page.tsx'));
});

test('the page renders the door a URL names on the server and works as a plain form', () => {
  const page = readFileSync('app/catalog/door-visualizer/page.tsx', 'utf8');
  assert.match(page, /parseVisualizerSelection\(params, FINISHES\)/);
  assert.match(page, /alternates: \{ canonical: buildCanonical\(DOOR_VISUALIZER_PATH\) \}/);
  assert.match(page, /imageUrl: versionedSrc\(finish\.image\)/);
  assert.match(page, /chipUrl: versionedSrc\(finish\.chip\)/);
  const client = readFileSync('components/catalog/DoorVisualizer.tsx', 'utf8');
  assert.match(client, /<form className="dv-controls" method="get" action=\{DOOR_VISUALIZER_PATH\}/);
  assert.match(client, /type="radio"\s+name="style"/);
  assert.match(client, /type="radio"\s+name="finish"/);
  assert.match(client, /<noscript>\s*<button type="submit"/);
  assert.match(client, /aria-live="polite"/);
  assert.match(client, /loading="lazy"/);
  assert.match(client, /'--fp-tex'|"--fp-tex"/);
  // The browser gets the model only: the catalog lists arrive as props from the server.
  assert.doesNotMatch(client, /shared\/doorVisualizer"|catalog\/generated|imageVersion/);
  assert.doesNotMatch(readFileSync('shared/doorVisualizerModel.ts', 'utf8'), /^import /m);
  // A drawn door: no flat colour stands in for a finish, and nothing calls it a photograph.
  assert.doesNotMatch(client, /hexColor|backgroundColor/);
  assert.doesNotMatch(`${client}\n${page}`, /photograph of|rendering|concept|illustration|inspiration|representative/i);
  // The request goes through the existing form's own field; nothing new is sent anywhere.
  assert.match(client, /href="\/estimate#estimate-request"/);
  assert.doesNotMatch(client, /fetch\(|\/api\//);
});

test('the homepage picker and the visualizer share one door drawing', () => {
  const door = readFileSync('components/catalog/DoorFront.tsx', 'utf8');
  assert.match(door, /className=\{`fp-door/);
  assert.match(readFileSync('components/approved/HomeDoorPicker.tsx', 'utf8'), /<DoorFront profile=\{style\}/);
  assert.match(readFileSync('components/catalog/DoorVisualizer.tsx', 'utf8'), /<DoorFront profile=\{style\}/);
  const css = readFileSync('app/finish-picker.css', 'utf8');
  assert.match(css, /:is\(\.cabinet-approved \.fp,\.dv\) \.fp-door\{/);
  const layout = readFileSync('app/layout.tsx', 'utf8');
  assert.ok(layout.indexOf("./finish-picker.css") < layout.indexOf("./door-visualizer.css"));
});

test('every gloss finish has a clean surface: no painted reflection on the drawn door', () => {
  // Owner, 21 November 2026: "make them all actually look like gloss".
  const gloss = finishes.filter((finish) => finish.family === 'gloss');
  assert.equal(gloss.length, 53);
  for (const finish of gloss) {
    assert.match(finish.image, /^\/images\/catalog\/finishes\/gloss-surface\//, `${finish.slug} is drawn from the painted sample`);
    assert.ok(existsSync(`public${finish.image}`) && existsSync(`public${finish.chip}`), finish.slug);
  }
  const css = readFileSync('app/finish-picker.css', 'utf8');
  assert.match(css, /:is\(\.cabinet-approved \.fp,\.dv\) \.fp-gloss \.fp-sheen\{background:/);
  assert.match(readFileSync('components/catalog/DoorVisualizer.tsx', 'utf8'), /dv-chip-gloss/);
  assert.ok(existsSync('scripts/images/build-gloss-surfaces.py'));
});
