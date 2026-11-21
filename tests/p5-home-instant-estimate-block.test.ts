/**
 * The homepage price slider is retired (owner, 21 November 2026: one source
 * of prices). KitchenPlanningRange ran this site's own engine and showed
 * figures that differed from the P5 instant estimator, so the homepage now
 * shows a short instant estimate block in its place: no figure, one link per
 * project the estimator prices for this brand, and the path to a person
 * beside it. KitchenPlanningRange.tsx stays in the repository, unmounted.
 *
 * These tests render the real homepage body and check the block, and check
 * that no page on the site still links to the slider's anchor or to the
 * /#calculator anchor that has no target here.
 */
import assert from 'node:assert/strict';
import Module from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE } from '../shared/ctaCopy.ts';
import { ESTIMATOR_PROJECT_IDS, ESTIMATOR_PROJECT_LABELS, instantEstimateHref } from '../shared/instantEstimate.ts';
import { SITE_CONFIG } from '../shared/siteConfig.ts';

// CSS modules have no meaning in node: each class name reads as its own key.
(Module as unknown as { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions['.css'] = (module) => {
  module.exports = new Proxy({}, { get: (_, key) => (key === '__esModule' ? undefined : String(key)) });
};
(globalThis as typeof globalThis & { React: typeof React }).React = React;

let html = '';
let block = '';

test.before(async () => {
  const { ApprovedHome } = await import('../components/approved/ApprovedHome.tsx');
  html = renderToStaticMarkup(React.createElement(ApprovedHome));
  const start = html.indexOf('id="estimate-by-project"');
  block = html.slice(start, html.indexOf('</section>', start));
});

test('the homepage renders no price slider', () => {
  const home = readFileSync('components/approved/ApprovedHome.tsx', 'utf8');
  assert.doesNotMatch(home, /<KitchenPlanningRange\b|import\('\.\/KitchenPlanningRange'\)/);
  assert.doesNotMatch(html, /data-testid="kitchen-planning-range"|data-testid="kitchen-planning-figure"|role="slider"/);
  // The component itself is kept, unmounted, as the owner asked.
  assert.match(readFileSync('components/approved/KitchenPlanningRange.tsx', 'utf8'), /export function KitchenPlanningRange/);
});

test('the block links the instant estimate for every project, with the path to a person', () => {
  assert.ok(block.length > 0, 'the block is on the homepage');
  assert.ok(html.indexOf('id="estimate-by-project"') > html.indexOf('id="instant-estimate"'), 'where the slider was: near the end');
  assert.deepEqual([...ESTIMATOR_PROJECT_IDS], ['kitchen-cabinets', 'bathroom-vanity', 'cabinet-refresh', 'built-ins']);
  for (const id of ESTIMATOR_PROJECT_IDS) {
    assert.equal(instantEstimateHref(id), `/instant-estimate?project=${id}`);
    assert.ok(block.includes(`href="${instantEstimateHref(id)}"`), id);
    assert.ok(block.includes(`>${ESTIMATOR_PROJECT_LABELS[id]}<`), ESTIMATOR_PROJECT_LABELS[id]);
  }
  assert.ok(block.includes(`href="${CTA_QUOTE_HREF}"`) && block.includes(`>${CTA_REQUEST_QUOTE}<`), 'Request a quote beside it');
  assert.ok(block.includes(`href="${SITE_CONFIG.phoneHref}"`), 'and the phone');
  assert.match(block, /fam-btn fam-btn--secondary fam-btn--lg fam-btn--on-dark/, 'family button styles');
  assert.ok(block.includes('id="ranges"'), 'old outside links still land on the block');
});

test('the block shows no figure and follows the wording rules', () => {
  const text = block.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(text, /\$\s?\d|\d{1,3},\d{3}/, 'no price');
  assert.doesNotMatch(text, /instant\s+(?:quote|bid)|final price|firm price|guaranteed/i);
  assert.doesNotMatch(text, /\b\d+\s+(?:minutes?|seconds?)\b/i);
  assert.equal(text.includes(String.fromCharCode(0x2014)), false, 'no em dash');
  assert.doesNotMatch(text, /near me/i);
});

test('no page on the site links to the retired slider anchor or to /#calculator', () => {
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const file = path.join(dir, name);
      if (statSync(file).isDirectory()) walk(file);
      else if (/\.(tsx?|mjs|txt|json)$/.test(name) && /(?:["'(]\/?|\}\/|\.co\/)#(?:ranges|calculator)\b/.test(readFileSync(file, 'utf8'))) offenders.push(file);
    }
  };
  for (const dir of ['app', 'shared', 'lib', 'public']) walk(dir);
  // The approved homepage and the components it renders.
  for (const file of ['components/approved/ApprovedHome.tsx', 'components/approved/HomeInstantEstimateProjects.tsx']) {
    if (/(?:["'(]\/?)#(?:ranges|calculator)\b/.test(readFileSync(file, 'utf8'))) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});
