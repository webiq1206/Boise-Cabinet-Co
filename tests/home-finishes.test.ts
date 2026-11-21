import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { FINISHES } from '../shared/catalog/generated/finishes';
import { searchCatalogWithFacets } from '../shared/catalog';
import { HOME_FINISH_SLUGS, resolveHomeFinishes, resolveHomePicker } from '../shared/homeFinishes';

// The homepage finish picker (owner, 19 November 2026) shows real catalog
// finishes only: real names, real sample images, links that open on them.
const finishes = resolveHomeFinishes();

test('every curated finish is in the catalog, with its sample image on disk', () => {
  assert.equal(finishes.length, HOME_FINISH_SLUGS.length, 'a curated slug is missing from the catalog or has no image');
  assert.ok(finishes.length >= 8 && finishes.length <= 12, 'the picker styles twelve options at most');
  assert.equal(new Set(finishes.map((f) => f.slug)).size, finishes.length);
  for (const finish of finishes) {
    const source = FINISHES.find((item) => item.slug === finish.slug);
    assert.ok(source, finish.slug);
    assert.equal(finish.name, source.name, 'the name is the catalog name');
    assert.equal(finish.family, source.category);
    assert.equal(finish.image, source.imagePath);
    assert.ok(existsSync(`public${finish.image}`), `${finish.image} is not on disk`);
  }
});

test('the set shows the range: whites first, and every family with its real count', () => {
  assert.match(finishes[0].name, /white/i, 'a white finish comes first');
  assert.ok(finishes.filter((f) => /white/i.test(f.name)).length >= 2);
  for (const family of ['matte', 'gloss', 'woodgrain'] as const) {
    const members = finishes.filter((f) => f.family === family);
    assert.ok(members.length >= 1, `${family} is represented`);
    const real = FINISHES.filter((f) => f.category === family).length;
    for (const member of members) assert.equal(member.familyCount, real);
  }
  assert.ok(finishes.some((f) => f.family === 'woodgrain'), 'at least one woodgrain');
  assert.equal(FINISHES.length, 299);
});

test('"See this finish" opens the catalog search on that finish, and the family link on the whole family', () => {
  for (const finish of finishes) {
    const url = new URL(finish.href, 'https://example.test');
    assert.equal(url.pathname, '/search');
    assert.equal(url.searchParams.get('finish'), finish.family);
    const results = searchCatalogWithFacets(url.searchParams.get('q') ?? '', { finishCategory: finish.family });
    assert.ok(results.some((r) => r.type === 'finish' && r.slug === finish.slug), `${finish.name} is not in its own search`);
    assert.equal(results[0].slug, finish.slug, `${finish.name} is not the first result`);

    assert.equal(finish.familyHref, `/search?finish=${finish.family}`);
    const family = searchCatalogWithFacets('', { finishCategory: finish.family }).filter((r) => r.type === 'finish');
    assert.equal(family.length, finish.familyCount);
  }
});

test('the search page reads ?q= and ?finish= on the server and shows a whole family', () => {
  const page = readFileSync('app/search/page.tsx', 'utf8');
  assert.match(page, /searchParams/);
  assert.match(page, /initialQuery=/);
  assert.match(page, /initialFinish=/);
  const client = readFileSync('app/search/SearchClient.tsx', 'utf8');
  assert.match(client, /useState\(initialQuery\)/);
  assert.match(client, /Showing all \$\{shown\.length\} \$\{finishCategory\} finishes\./);
});

test('the picker offers every catalog finish and door style, as native radios in a plain form', () => {
  // Owner, 21 November 2026: all of the options, as the door visualizer has.
  const { finishes: all, styles } = resolveHomePicker();
  assert.equal(all.length, 299);
  assert.equal(styles.length, 6);
  for (const family of ['matte', 'gloss', 'woodgrain'] as const) {
    const members = all.filter((f) => f.family === family);
    const curated = HOME_FINISH_SLUGS.filter((slug) => members.some((f) => f.slug === slug));
    assert.deepEqual(members.slice(0, curated.length).map((f) => f.slug), curated, `${family}: the curated finishes come first`);
  }
  const picker = readFileSync('components/approved/HomeDoorPicker.tsx', 'utf8');
  assert.match(picker, /<form className="fp-form" method="get" action=\{DOOR_VISUALIZER_PATH\}/);
  assert.match(picker, /type="radio"\s+name="finish"/);
  assert.match(picker, /type="radio"\s+name="style"/);
  assert.match(picker, /<noscript>\s*<button type="submit"/);
  assert.match(picker, /loading="lazy"/);
  assert.match(picker, /See this finish/);
  assert.match(picker, /Explore the full catalog/);
  assert.match(picker, /Confirm your finish with a physical sample\./);
  assert.match(picker, /'--fp-tex': `url\("\$\{finish\.imageUrl\}"\)`/);
  assert.doesNotMatch(picker, /photograph of|rendering|concept|illustration/i);
  assert.doesNotMatch(picker, /hexColor|backgroundColor/, 'a finish is shown by its sample, never a flat colour');
  // The browser gets the model only; the lists arrive as props with versioned URLs.
  assert.doesNotMatch(picker, /shared\/doorVisualizer'|catalog\/generated|imageVersion/);
  const wrapper = readFileSync('components/approved/FinishPicker.tsx', 'utf8');
  assert.match(wrapper, /imageUrl: versionedSrc\(finish\.image\), chipUrl: versionedSrc\(finish\.chip\)/);
  assert.match(readFileSync('app/page.tsx', 'utf8'), /homePicker=\{resolveHomePicker\(\)\}/);
  assert.doesNotMatch(readFileSync('components/approved/ApprovedHome.tsx', 'utf8'), /catalog\/generated\/finishes/);
});

test('phones and tablets get one app panel: door, tabs, swatches and styles on one screen', () => {
  // Owner, 21 November 2026: "it should look feel and function like a mobile application".
  const picker = readFileSync('components/approved/HomeDoorPicker.tsx', 'utf8');
  assert.match(picker, /<div className="fp-view">[\s\S]*className="finish-photo fp-stage" onTouchStart=\{onTouchStart\} onTouchEnd=\{onTouchEnd\}/);
  // Arrows exist only once the page is interactive, so no dead button is shown.
  assert.match(picker, /\{mounted \? \(/);
  assert.match(picker, /className="fp-nav fp-nav-prev"/);
  assert.match(picker, /className="fp-nav fp-nav-next"/);
  assert.match(picker, /aria-live="polite"/);
  const css = readFileSync('app/finish-picker.css', 'utf8');
  // Desktop keeps the two columns: the view wrapper is not a box there.
  assert.match(css, /\.cabinet-approved \.fp \.fp-view\{display:contents\}/);
  // The panel is sized to the screen between the header and the bottom bar.
  assert.match(css, /height:clamp\(300px,calc\(100svh - var\(--fp-chrome\) - var\(--fp-controls\)\),640px\)/);
  assert.match(css, /\.cabinet-approved \.fp \.finish-copy\{display:contents\}/);
  assert.match(css, /\.cabinet-approved \.fp \.fp-form\{display:contents\}/);
  // The door visualizer page keeps its own door sizes.
  assert.match(css, /@media\(max-width:1000px\)\{\.dv \.fp-door\{flex:none;height:460px\}\}/);
  assert.match(css, /@media\(max-width:700px\)\{\.dv \.fp-door\{height:340px\}\}/);
});
