/**
 * The instant estimate (owner decision, 13 November 2026).
 *
 * The P5 family has one estimator. It runs on the parent company's site and
 * this site only frames it at /instant-estimate. These tests pin that the page
 * frames it for this brand, that the site's central call to action leads
 * there, that no estimator or pricing logic was copied into the frame, and
 * that only rooms the estimator can price send a visitor to it.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InstantEstimatePage from '../app/instant-estimate/page.tsx';
import { FAMILY_BRAND } from '../lib/familyBrand.ts';
import { matchesRoute } from '../lib/family/types.ts';
import { isEstimatorPath } from '../lib/p5/estimatorRoutes.ts';
import { getAllSiteUrls } from '../lib/siteUrls.ts';
import { findProhibitedClaims, findProhibitedResponseLanguage } from '../scripts/lib/prohibitedResponseLanguage.ts';
import { ROOM_CATEGORIES } from '../shared/catalog/roomCategories.ts';
import { CTA_INSTANT_ESTIMATE, CTA_INSTANT_ESTIMATE_SHORT, CTA_QUOTE_HREF, INSTANT_ESTIMATE_HREF } from '../shared/ctaCopy.ts';
import {
  ESTIMATOR_BRAND_ID,
  ESTIMATOR_PROJECT_IDS,
  ROOM_ESTIMATOR_PROJECT,
  estimatorProjectForRoom,
  instantEstimateHref,
} from '../shared/instantEstimate.ts';
import { LLMS_TXT } from '../shared/llmsTxt.ts';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const read = (file: string) => readFileSync(file, 'utf8');
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

async function renderPage(searchParams: Record<string, string | string[] | undefined> = {}) {
  return renderToStaticMarkup(await InstantEstimatePage({ searchParams: Promise.resolve(searchParams) }));
}

test('the page frames the family estimator for this brand, under one short heading', async () => {
  assert.equal(ESTIMATOR_BRAND_ID, 'cabinet');
  assert.equal(FAMILY_BRAND.id, ESTIMATOR_BRAND_ID);
  const source = read('app/instant-estimate/page.tsx');
  assert.match(source, /import EstimatorFrame from "@\/components\/estimator\/EstimatorFrame"/);
  assert.match(source, /import EstimatorAnalytics from "@\/components\/estimator\/EstimatorAnalytics"/);
  assert.match(source, /<EstimatorAnalytics \/>/);
  assert.match(source, /<EstimatorFrame\s+brand=\{ESTIMATOR_BRAND_ID\}\s+project=\{project\}/);
  assert.match(source, /headerOffset=\{HEADER_OFFSET\}/);
  // The taller of the family header's two heights (styles/family-tokens.css).
  assert.match(source, /const HEADER_OFFSET = 76;/);
  assert.match(read('styles/family-tokens.css'), /--header-height: 76px;/);
  assert.match(source, /canonical: buildCanonical\(INSTANT_ESTIMATE_HREF\)/);

  const html = await renderPage();
  assert.match(html, /<div data-estimator-frame="cabinet"/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<h1>Get your instant cabinet estimate<\/h1>/);
  // The heading block is the H1 and one supporting paragraph, and the frame follows it directly.
  const intro = html.match(/<section class="instant-estimate-intro[^"]*">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.equal((intro.match(/<p\b/g) ?? []).length, 1);
  assert.ok(text(intro).trim().split(/\s+/).length <= 35, text(intro));
  assert.match(html, /<\/section><section class="instant-estimate-frame"/);
  // How it works, in three numbered steps.
  assert.equal((html.match(/<li class="ed-step">/g) ?? []).length, 3);
  // A path to a person: the phone and the quote request form.
  assert.match(html, /Prefer to talk to us\?/);
  assert.match(html, /href="tel:\+12084771169"/);
  assert.match(html, new RegExp(`<a [^>]*href="${CTA_QUOTE_HREF}"[^>]*>Request a quote</a>`));
});

test('the page copy is an estimate, never a quote, and promises no reply time', async () => {
  const html = await renderPage();
  const copy = text(html.replace(/<a [^>]*href="\/estimate"[^>]*>[\s\S]*?<\/a>/g, ' '));
  assert.doesNotMatch(copy, /\bquotes?\b|\bbids?\b|final price|firm price|guaranteed price/i);
  assert.doesNotMatch(copy, /no contact (?:info|information|details)/i);
  assert.doesNotMatch(copy, /\b\d+\s+(?:minutes?|seconds?)\b/i);
  assert.doesNotMatch(copy, /near me/i);
  assert.equal(html.includes('—'), false);
  assert.match(copy, /preliminary price range/);
  assert.match(copy, /firm written proposal follows a site visit, measurements and your selections/);
  assert.deepEqual(findProhibitedClaims(html), []);
  assert.deepEqual(findProhibitedResponseLanguage(html), []);
});

test('the central call to action leads to the instant estimate', () => {
  assert.equal(INSTANT_ESTIMATE_HREF, '/instant-estimate');
  assert.equal(FAMILY_BRAND.cta.href, '/instant-estimate');
  assert.equal(FAMILY_BRAND.cta.label, 'Instant estimate');
  assert.equal(FAMILY_BRAND.cta.label, CTA_INSTANT_ESTIMATE_SHORT);
  assert.equal(CTA_INSTANT_ESTIMATE, 'Get an instant estimate');
  // The page keeps the normal header, footer and chat: it is not one of the /estimate app routes.
  assert.equal(isEstimatorPath('/instant-estimate'), false);
  assert.equal(matchesRoute('/instant-estimate', FAMILY_BRAND.chat.hiddenOn ?? []), false);
  // The existing quote request page is still there, and still the app route it was.
  assert.equal(isEstimatorPath('/estimate'), true);
  assert.equal(CTA_QUOTE_HREF, '/estimate');
  assert.match(read('app/estimate/page.tsx'), /KitchenCabinetsQuoteForm/);
  assert.match(read('app/estimate/page.tsx'), /EstimateCalculatorWizard/);
  // The homepage hero and its band lead there too.
  const home = read('components/approved/ApprovedHome.tsx');
  assert.match(home, /<FamilyButton href=\{INSTANT_ESTIMATE_HREF\} variant="hero" size="lg" data-hero-cta="primary" data-cta="primary">\{CTA_INSTANT_ESTIMATE\}<\/FamilyButton>/);
  assert.match(home, /<section id="instant-estimate" className="builder-band estimate-band wrap"/);
  // The homepage planning slider stays mounted.
  assert.match(home, /<KitchenPlanningRange \/>/);
});

test('the page is in the sitemap and in llms.txt', () => {
  const paths = getAllSiteUrls().map((entry) => entry.path);
  assert.ok(paths.includes('/instant-estimate'));
  assert.ok(paths.includes('/estimate'));
  assert.ok(LLMS_TXT.includes('](https://boisecabinet.co/instant-estimate)'));
});

test('the frame is the shared file: it points at the family estimator and holds no pricing', () => {
  const frame = read('components/estimator/EstimatorFrame.tsx');
  assert.ok(frame.includes('https://p5homeco.com'));
  assert.ok(frame.includes('/estimator/embed?'));
  // It imports React and nothing else: no estimate engine, no cost data, no site module.
  const imports = [...frame.matchAll(/^\s*import\s[^;]*?from\s+["']([^"']+)["']/gm)].map((match) => match[1]);
  assert.deepEqual(imports, ['react']);
  assert.doesNotMatch(frame, /\brequire\(|\bimport\(/);
  // Its comments name what the estimator does elsewhere; the code itself prices nothing.
  const code = frame.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  assert.doesNotMatch(code, /estimateEngine|calculateEstimate|priceScope|costBook|PROJECT_PRICING|shared\/|lib\/p5|quickbooks|margin|markup/i);
  assert.doesNotMatch(code, /\$\s?\d/);
  assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|sendBeacon/);
  // Nothing under components/estimator reaches into this site's own pricing either.
  const analytics = read('components/estimator/EstimatorAnalytics.tsx');
  assert.doesNotMatch(analytics, /estimateEngine|calculateEstimate|shared\/costs|lib\/p5/);
});

test('only the completed event is a lead, and it is sent once per page view', () => {
  const analytics = read('components/estimator/EstimatorAnalytics.tsx');
  assert.match(analytics, /window\.addEventListener\("p5-estimator-event", onEstimatorEvent\)/);
  assert.match(analytics, /track\(detail\.name, \{ estimator_brand: brand, estimator_project: project \}\)/);
  assert.match(analytics, /const COMPLETED_EVENT = "estimator_completed";/);
  assert.match(analytics, /export const INSTANT_ESTIMATOR_LEAD_SOURCE = "instant_estimator";/);
  // The guard sits between the plain event and the conversion: every lead call comes after it.
  const guard = analytics.indexOf('if (detail.name !== COMPLETED_EVENT || leadSent.current) return;');
  assert.ok(guard > 0);
  // Owner, 13 November 2026: a finished estimate is also a Meta Lead, once, behind the same guard.
  for (const call of ['track("generate_lead"', 'trackGoogleAdsLeadOnce(leadId', 'trackMetaEvent("Lead"']) {
    assert.equal(analytics.split(call).length - 1, 1, call);
    assert.ok(analytics.indexOf(call) > guard, call);
  }
  assert.match(analytics, /leadSent\.current = true;/);
  assert.match(analytics, /const leadSent = useRef\(false\);/);
});

test('only rooms the estimator can price send a visitor to it', () => {
  assert.deepEqual([...ESTIMATOR_PROJECT_IDS], ['kitchen-cabinets', 'bathroom-vanity', 'cabinet-refresh', 'built-ins']);
  assert.deepEqual(ROOM_ESTIMATOR_PROJECT, {
    kitchen: 'kitchen-cabinets',
    bathroom: 'bathroom-vanity',
    'built-ins': 'built-ins',
    entertainment: 'built-ins',
    'home-office': 'built-ins',
    mudroom: 'built-ins',
  });
  const rooms = ROOM_CATEGORIES.map((room) => room.slug);
  for (const slug of Object.keys(ROOM_ESTIMATOR_PROJECT)) assert.ok(rooms.includes(slug), slug);
  for (const project of Object.values(ROOM_ESTIMATOR_PROJECT)) assert.ok((ESTIMATOR_PROJECT_IDS as readonly string[]).includes(project), project);
  // These rooms keep "Request a quote" as their primary.
  for (const slug of ['laundry', 'pantry', 'closet', 'garage', 'outdoor', 'wet-bar', 'bedroom']) {
    assert.ok(rooms.includes(slug), slug);
    assert.equal(estimatorProjectForRoom(slug), null, slug);
  }
  for (const slug of ['toString', 'constructor', '__proto__', '']) assert.equal(estimatorProjectForRoom(slug), null, slug);
  assert.equal(instantEstimateHref(), '/instant-estimate');
  assert.equal(instantEstimateHref(null), '/instant-estimate');
  assert.equal(instantEstimateHref('kitchen-cabinets'), '/instant-estimate?project=kitchen-cabinets');
  assert.equal(instantEstimateHref('Kitchen Cabinets'), '/instant-estimate');
  assert.equal(instantEstimateHref('a&b=c'), '/instant-estimate');

  const room = read('app/cabinets/[room]/page.tsx');
  assert.match(room, /const estimatorProject = estimatorProjectForRoom\(room\.slug\);/);
  assert.equal(room.split('destination="instant-estimate" estimatorProject={estimatorProject}').length - 1, 2);
  // The quote button with no destination is still there for every other room, and as the secondary.
  assert.match(room, /<CtaButton variant="brand" className="min-h-12 px-6">\s*\{CTA_ESTIMATE\}/);
  assert.match(room, /<CtaButton variant="brandOutline" intent="visit">\{CTA_ESTIMATE\}<\/CtaButton>/);
  // The shared button still defaults to the quote request form, so untouched pages keep their destination.
  const button = read('components/modals/CtaButton.tsx');
  assert.match(button, /destination = "quote"/);
  assert.match(button, /href=\{toEstimator \? instantEstimateHref\(estimatorProject\) : CTA_QUOTE_HREF\}/);
  for (const page of ['app/services/cabinet-installation/page.tsx', 'app/builders/page.tsx']) {
    assert.doesNotMatch(read(page), /instant-estimate|INSTANT_ESTIMATE|instantEstimateHref/, page);
  }
});

test('a project in the address is passed to the frame only when it is a plain id', async () => {
  const source = read('app/instant-estimate/page.tsx');
  assert.match(source, /typeof requested === "string" && ESTIMATOR_PROJECT_PATTERN\.test\(requested\) \? requested : null/);
  assert.match(read('shared/instantEstimate.ts'), /export const ESTIMATOR_PROJECT_PATTERN = \/\^\[a-z0-9-\]\{1,40\}\$\/;/);
  // Whatever the address says, the page renders, with the same single canonical page.
  for (const project of ['kitchen-cabinets', '<script>', ['a', 'b'], undefined]) {
    const html = await renderPage({ project });
    assert.match(html, /<div data-estimator-frame="cabinet"/);
    assert.equal(html.includes('<script>alert'), false);
  }
});
