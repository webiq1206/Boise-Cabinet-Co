import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ApprovedHome } from '../components/approved/ApprovedHome.tsx';
import { Footer } from '../components/Footer.tsx';
import { matchesRoute, isActiveHref } from '../lib/family/types.ts';
import {
  DOPL_LICENSE_SEARCH,
  FAMILY_BRAND,
  FOOTER_PILLAR_GUIDES,
  FOOTER_ROOM_LINKS,
  P5_FACEBOOK_URL,
  P5_GOOGLE_PROFILE_URL,
} from '../lib/familyBrand.ts';
import { P5_FACEBOOK_URL as SCHEMA_FACEBOOK_URL, P5_PARENT_ORGANIZATION } from '../lib/schema.ts';
import { BUSINESS_VCARD_PATH } from '../lib/vcard.ts';
import { FOOTER_CABINET_LINKS, PRIMARY_NAV } from '../shared/cabinetNav.ts';
import { IDAHO_REGISTERED_CONTRACTOR, PUBLIC_HOURS_LINE } from '../shared/claims.ts';
import { CONTENT_HUBS, guidePath } from '../shared/contentHubs.ts';
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE } from '../shared/ctaCopy.ts';
import { GUIDE_PAGES } from '../shared/guideContent.ts';
import { SITE_CONFIG } from '../shared/siteConfig.ts';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const sentenceCase = (label: string) => label === label.charAt(0).toUpperCase() + label.slice(1).replace(/\b(?!Treasure|Valley\b)[A-Z](?=[a-z])/g, (c) => c.toLowerCase());

// Phase 2 family chrome: the shared components read every Boise Cabinet Co fact from
// lib/familyBrand.ts. These pin that the config says what the site says.
test('the brand config carries this site’s facts, one CTA and one destination', () => {
  assert.equal(FAMILY_BRAND.cta.label, 'Request a quote');
  assert.equal(FAMILY_BRAND.cta.label, CTA_REQUEST_QUOTE);
  assert.equal(FAMILY_BRAND.cta.href, '/estimate');
  assert.equal(FAMILY_BRAND.cta.href, CTA_QUOTE_HREF);
  assert.equal(FAMILY_BRAND.phone.display, '(208) 477-1169');
  assert.equal(FAMILY_BRAND.phone.telHref, 'tel:+12084771169');
  assert.equal(FAMILY_BRAND.phone.smsHref, 'sms:+12084771169');
  assert.equal(FAMILY_BRAND.phone.telHref, SITE_CONFIG.phoneHref);
  assert.equal(FAMILY_BRAND.email, SITE_CONFIG.email);
  assert.equal(FAMILY_BRAND.saveContactHref, BUSINESS_VCARD_PATH);
  assert.equal(FAMILY_BRAND.hours, PUBLIC_HOURS_LINE);
  assert.equal(FAMILY_BRAND.registration.text, IDAHO_REGISTERED_CONTRACTOR);
  assert.equal(FAMILY_BRAND.registration.href, DOPL_LICENSE_SEARCH);
  assert.equal(FAMILY_BRAND.nap.line, 'Serving Boise and the Treasure Valley');
  assert.equal(FAMILY_BRAND.accent, '#659b9a');
  assert.equal(FAMILY_BRAND.accentInk, '#356463');
  // The parent's profiles are the ones in the parent organization's schema node.
  assert.equal(P5_FACEBOOK_URL, SCHEMA_FACEBOOK_URL);
  assert.equal(FAMILY_BRAND.parentFacebook.href, P5_FACEBOOK_URL);
  assert.equal(P5_GOOGLE_PROFILE_URL, 'https://www.google.com/search?kgmid=/g/11ntl1t7dc');
  assert.deepEqual(FAMILY_BRAND.parentGoogle, { href: P5_GOOGLE_PROFILE_URL, label: 'P5 Home Co on Google' });
  assert.ok((P5_PARENT_ORGANIZATION.sameAs as readonly string[]).includes(P5_FACEBOOK_URL));
  // Approved C7 check (scripts/verify-p5-mobile-seo.mjs): the bar is on the first screen below 1180px.
  assert.equal(FAMILY_BRAND.bar.showOverHero, true);
  assert.equal(FAMILY_BRAND.header.desktopFrom, 1180);
  // Every estimator route owns the bottom of the screen.
  for (const path of ['/estimate', '/estimate/scope', '/estimate/p5-preview']) assert.equal(matchesRoute(path, FAMILY_BRAND.bar.hiddenOn), true, path);
  for (const path of ['/', '/cabinets', '/estimates', '/contact']) assert.equal(matchesRoute(path, FAMILY_BRAND.bar.hiddenOn), false, path);
  // A focused field, the embedded estimator, a wizard bar or an on-screen request form wins the space.
  assert.deepEqual(FAMILY_BRAND.bar.yieldToBodyFlags, ['hideMobileNavBar', 'p5EstimatorActive', 'suppressStickyCta']);
  // The canonical header/footer contact actions use all three supported destinations.
  assert.deepEqual(FAMILY_BRAND.header.phoneActions, ['call', 'text', 'chat']);
  assert.equal(FAMILY_BRAND.chat.enabled, true);
  assert.equal(FAMILY_BRAND.chat.openEvent, 'p5:assistant-open');
  for (const path of ['/estimate', '/estimate/scope', '/kitchen-cabinets', '/admin', '/portal/projects', '/design-studio']) {
    assert.equal(matchesRoute(path, FAMILY_BRAND.chat.hiddenOn ?? []), true, path);
  }
  for (const path of ['/', '/about', '/contact', '/cabinets/kitchen']) {
    assert.equal(matchesRoute(path, FAMILY_BRAND.chat.hiddenOn ?? []), false, path);
  }
  // Dark header only over the photo hero.
  assert.equal(matchesRoute('/', FAMILY_BRAND.header.darkOn), true);
  assert.equal(matchesRoute('/cabinets', FAMILY_BRAND.header.darkOn), false);
});

test('navigation keeps the site’s destinations, in sentence case', () => {
  assert.deepEqual(
    FAMILY_BRAND.nav.map((link) => link.href),
    PRIMARY_NAV.map((item) => item.href),
  );
  for (const link of FAMILY_BRAND.nav) assert.ok(sentenceCase(link.label), link.label);
  assert.deepEqual(FAMILY_BRAND.nav.map((link) => link.label), ['Shop by room', 'Catalog', 'How it works', 'For builders', 'Contact']);
  assert.equal(isActiveHref('/cabinets/kitchen', '/cabinets'), true);
  assert.equal(isActiveHref('/', '/cabinets'), false);
});

test('footer links written out in the config match their sources', () => {
  assert.deepEqual(
    FOOTER_ROOM_LINKS.map((link) => link.href),
    FOOTER_CABINET_LINKS.slice(0, 6).map((link) => link.href),
  );
  const published = new Set(GUIDE_PAGES.map((guide) => guide.slug));
  const pillars = CONTENT_HUBS.filter((hub) => hub.priorityTier <= 2 && published.has(hub.pillarSlug))
    .slice(0, 3)
    .map((hub) => guidePath(hub.pillarSlug));
  assert.deepEqual(FOOTER_PILLAR_GUIDES.map((link) => link.href), pillars);
  const guides = new Set(GUIDE_PAGES.map((guide) => `/guides/${guide.slug}`));
  for (const group of FAMILY_BRAND.footer.groups) {
    for (const link of group.links) {
      if (link.href.startsWith('/guides/')) assert.ok(guides.has(link.href), link.href);
      assert.ok(sentenceCase(link.label), link.label);
    }
  }
  assert.ok(guides.has(FAMILY_BRAND.footer.areas.href), FAMILY_BRAND.footer.areas.href);
  assert.equal(FAMILY_BRAND.footer.areas.links.length, 8);
});

test('the footer renders the family row, NAP, hours, both parent profiles and one registration link, with no headings', () => {
  const html = renderToStaticMarkup(React.createElement(Footer));
  assert.equal(/<h[1-6]\b/.test(html), false);
  for (const name of ['P5 Home Co', 'Boise Construction Co', 'Boise Remodeling Co', 'Boise Handyman Co']) {
    assert.match(html, new RegExp(`<a href="https://[^"]+" rel="noopener">${name}</a>`), name);
  }
  assert.match(html, /<span class="fam-footer-current" aria-current="true">Boise Cabinet Co<\/span>/);
  assert.equal(/rel="noopener noreferrer">(P5 Home Co|Boise)/.test(html), false);
  assert.equal(html.includes('Boise ADU Co'), false);
  assert.equal(/Public representative|Wapoot|staffed storefront/.test(html), false);
  assert.ok(html.includes('Mon–Fri 9 AM–6 PM, Sat 9 AM–4 PM (Mountain).'));
  assert.match(html, /mailto:hello@boisecabinet\.co/);
  assert.match(html, /href="sms:\+12084771169"/);
  assert.match(html, /href="\/contact\.vcf"/);
  assert.match(html, /is a DBA of <a href="https:\/\/p5homeco\.com" rel="noopener">P5 Home Co LLC<\/a>/);
  assert.equal((html.match(/>P5 Home Co LLC, Idaho Registered Contractor #8381215<\/a>/g) ?? []).length, 1);
  assert.ok(html.includes(`href="${P5_FACEBOOK_URL}"`));
  assert.ok(html.includes(`href="${P5_GOOGLE_PROFILE_URL}"`));
  assert.ok(html.includes(`<a href="${P5_GOOGLE_PROFILE_URL}" rel="noopener" target="_blank" data-testid="link-footer-google">P5 Home Co on Google</a>`));
  assert.equal((html.match(/data-testid="link-footer-google"/g) ?? []).length, 1);
  assert.equal((html.match(/data-testid="link-footer-facebook"/g) ?? []).length, 1);
  assert.match(html, /<a data-testid="link-footer-quote" href="\/estimate">Request a quote<\/a>/);
  for (const href of ['/cabinets', '/catalog', '/shaker-cabinets', '/builders', '/warranty', '/construction', '/guides', '/resources', '/blog', '/search', '/sitemap', '/privacy-policy', '/terms-of-service']) {
    assert.ok(html.includes(`href="${href}"`), href);
  }
  for (const city of ['boise', 'caldwell', 'eagle', 'kuna', 'meridian', 'middleton', 'nampa', 'star']) {
    assert.ok(html.includes(`href="/locations/${city}"`), city);
  }
});

test('the homepage video preserves no-script poster, first-response content and sourced proof', () => {
  const html = renderToStaticMarkup(React.createElement(ApprovedHome));
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /<h1 class="fam-hero-title" id="family-hero-title">Custom cabinets in Boise, <span class="fam-hero-accent">Idaho<\/span><\/h1>/);
  assert.match(html, /Custom cabinets · Treasure Valley, Idaho/);
  const cta = html.match(/<a [^>]*data-hero-cta="primary"[^>]*>([^<]+)<\/a>/);
  assert.ok(cta, 'hero primary CTA');
  assert.match(cta[0], /href="\/estimate"/);
  assert.match(cta[0], /fam-btn--hero fam-btn--lg/);
  assert.equal(cta[1], 'Request a quote');
  assert.match(html, /<a href="tel:\+12084771169" class="fam-hero-link">Call or text \(208\) 477-1169<\/a>/);
  assert.match(html, /<img [^>]*fetchPriority="high"[^>]*class="fam-hero-img"/);
  assert.match(html, /src="\/media\/cabinet\/boise-cabinet-co-poster\.jpg"/);
  assert.doesNotMatch(html, /<video\b|<source\b/, 'no-script fallback cannot acquire browser-forced video controls');
  const videoSource = readFileSync('components/approved/CabinetHeroVideo.tsx', 'utf8');
  assert.match(videoSource, /autoPlay muted loop playsInline/);
  assert.doesNotMatch(videoSource, /\scontrols(?:=|\s|>)/);
  assert.match(videoSource, /background-1080p\.mp4/);
  assert.match(videoSource, /background-720p\.mp4/);
  const hero = html.split('</section>')[0];
  assert.doesNotMatch(hero, /<button\b|Pause background video|Play background video|Stop video/);
  assert.doesNotMatch(videoSource, /prefers-reduced-motion|saveData|navigator\.connection/);
  const support = html.match(/<p class="fam-hero-support">([^<]+)<\/p>/)?.[1] ?? '';
  assert.ok(support.split(/\s+/).length <= 14, support);
  assert.match(html, /<p class="fam-hero-micro">Written price before work\.<\/p>/);
  // The finish-count and door-count tiles are removed. Consultation and registration stay.
  assert.doesNotMatch(html, /299 finish options/);
  assert.doesNotMatch(html, /6 door styles/);
  assert.match(html, /Free in-home design consultation/);
  assert.match(html, /href="https:\/\/edopl\.idaho\.gov\/OnlineServices\/\?link=PubSearch"[^>]*>P5 Home Co LLC, Idaho Registered Contractor #8381215<\/a>/);
});

test('the shared chrome matches its manifest and stays brand-agnostic', () => {
  const out = execFileSync(process.execPath, ['scripts/verify-family-chrome.mjs'], { encoding: 'utf8' });
  assert.match(out, /shared files match boise-remodeling-co/);
  const manifest = JSON.parse(readFileSync('lib/family/manifest.json', 'utf8'));
  assert.equal(manifest.source, 'boise-remodeling-co');
  for (const file of ['components/family/SiteHeader.tsx', 'components/family/MobileMenu.tsx', 'components/family/MobileActionBar.tsx', 'components/family/SiteFooter.tsx', 'components/family/HeroPhoto.tsx', 'components/family/ProofStrip.tsx', 'components/family/SkipLink.tsx', 'components/family/Button.tsx', 'styles/family-tokens.css', 'styles/family-chrome.css']) {
    assert.ok(file in manifest.files, file);
  }
  assert.equal('lib/familyBrand.ts' in manifest.files, false);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts['verify:family-chrome'], 'node scripts/verify-family-chrome.mjs');
  assert.match(pkg.scripts.prebuild, /npm run verify:family-chrome/);
});
