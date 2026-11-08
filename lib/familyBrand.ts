/**
 * Boise Cabinet Co configuration for the shared family chrome.
 *
 * BRAND-OWNED: this is the one file where this site differs from its siblings.
 * The components in components/family/ and the styles in styles/family-*.css are
 * synced byte-identical across the P5 Home Co family (lib/family/manifest.json,
 * source boise-remodeling-co); they read everything brand-specific from
 * FAMILY_BRAND below.
 *
 * Kept free of heavy imports on purpose: the header and bottom bar are client
 * components, so whatever this module imports ships to every page. The room,
 * guide and hub links are written out here rather than imported from the catalog
 * and guide modules; tests/family-chrome.test.ts pins them to those sources.
 */
import type { FamilyBrand, FamilyLink } from '@/lib/family/types';
import { IDAHO_REGISTERED_CONTRACTOR, PUBLIC_HOURS_LINE } from '@/shared/claims';
import { CITIES, locationPath } from '@/shared/contentData';
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE } from '@/shared/ctaCopy';
import { SITE_CONFIG } from '@/shared/siteConfig';

/** The approved October 28 outlined lockups (public/brand), 339 x 50 artwork. */
const LOCKUP = { width: 339, height: 50 };

/**
 * P5 Home Co's Facebook page and its one Google Business Profile (owner call A,
 * 1 November). Both cover every brand and sit only in the parent organization's
 * sameAs in lib/schema.ts, never in this brand's own; the footer links them as
 * the parent company's profiles.
 */
export const P5_FACEBOOK_URL = 'https://www.facebook.com/1228704823655951';
export const P5_GOOGLE_PROFILE_URL = 'https://www.google.com/search?kgmid=/g/11ntl1t7dc';

/** Same path as BUSINESS_VCARD_PATH in lib/vcard.ts (that module pulls in the SEO data). */
const VCARD_PATH = '/contact.vcf';

/** DOPL public search, where registration 8381215 is looked up. */
export const DOPL_LICENSE_SEARCH = 'https://edopl.idaho.gov/OnlineServices/?link=PubSearch';

/**
 * Seed reviews stay hidden unless the owner turns them on; the review link
 * replaces "Design ideas" in the footer only while they show.
 */
const SHOW_REVIEW_LINKS = process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === 'true';

/** The six rooms people ask for most (shared/cabinetNav FOOTER_CABINET_LINKS, first six). */
export const FOOTER_ROOM_LINKS: FamilyLink[] = [
  { label: 'Kitchen', href: '/cabinets/kitchen' },
  { label: 'Bathroom', href: '/cabinets/bathroom' },
  { label: 'Laundry', href: '/cabinets/laundry' },
  { label: 'Mudroom', href: '/cabinets/mudroom' },
  { label: 'Home office', href: '/cabinets/home-office' },
  { label: 'Entertainment', href: '/cabinets/entertainment' },
];

/** The first three published pillar guides (shared/contentHubs, priority tier 2 or better). */
export const FOOTER_PILLAR_GUIDES: FamilyLink[] = [
  { label: 'Boise cabinet costs', href: '/guides/boise-cabinet-cost-guide' },
  { label: 'Kitchen cabinets', href: '/guides/boise-kitchen-cabinet-guide' },
  { label: 'Bathroom vanities', href: '/guides/boise-bathroom-vanity-guide' },
];

export const FAMILY_BRAND: FamilyBrand = {
  id: 'cabinet',
  name: SITE_CONFIG.name,
  domain: SITE_CONFIG.siteUrl.replace(/\/$/, ''),
  lockupLabel: `${SITE_CONFIG.name}, a P5 Home Company`,
  lockup: {
    onDark: { src: '/brand/approved-lockup-light.svg', ...LOCKUP },
    onLight: { src: '/brand/approved-lockup-dark.svg', ...LOCKUP },
  },
  // Teal and its AA ink on paper (app/approved-system.css --approved-accent, --approved-accent-ink).
  accent: '#659b9a',
  accentInk: '#356463',
  header: {
    // The homepage opens on a full-bleed kitchen photograph; interior pages open on paper and bone.
    darkOn: ['/'],
    // The approved C7 check (scripts/verify-p5-mobile-seo.mjs) keeps the bottom bar on screen
    // below 1180px, and the site's navigation has always folded into the menu there.
    desktopFrom: 1180,
    // Shared contact actions use the same call, text and chat icons across the family.
    phoneActions: ['call', 'text', 'chat'],
  },
  nav: [
    { label: 'Shop by room', href: '/cabinets' },
    { label: 'Catalog', href: '/catalog' },
    { label: 'How it works', href: '/about' },
    { label: 'For builders', href: '/builders' },
    { label: 'Contact', href: '/contact' },
  ],
  // One label, one destination (family plan Phase 1): "Request a quote" to /estimate.
  cta: { label: CTA_REQUEST_QUOTE, href: CTA_QUOTE_HREF },
  phone: { display: SITE_CONFIG.phone, telHref: SITE_CONFIG.phoneHref, smsHref: SITE_CONFIG.phoneSmsHref },
  // The existing assistant listens for this event. Match its route suppression exactly.
  chat: {
    enabled: true,
    label: 'Chat',
    openEvent: 'p5:assistant-open',
    hiddenOn: ['/admin*', '/portal*', '/design-studio*', '/estimate*', '/kitchen-cabinets'],
  },
  bar: {
    // Approved C7 decision (scripts/verify-p5-mobile-seo.mjs): the bar is on the first screen, over the hero.
    showOverHero: true,
    callLabel: 'Call',
    // The estimator owns the whole screen on every /estimate route.
    hiddenOn: ['/estimate/*'],
    // hideMobileNavBar: requestHideMobileNavBar (lib/mobileNavBar.ts). p5EstimatorActive: the embedded
    // estimator. suppressStickyCta: a final request section is on screen (components/StickyCtaYield.tsx).
    yieldToBodyFlags: ['hideMobileNavBar', 'p5EstimatorActive', 'suppressStickyCta'],
  },
  analytics: { ctaEvent: 'primary_cta_clicked', barCtaEvent: 'mobile_sticky_cta_clicked' },
  saveContactHref: VCARD_PATH,
  email: SITE_CONFIG.email,
  tagline: 'Designed around your life. Built around your space.',
  parentLine: 'A P5 Home Co company',
  footer: {
    groups: [
      {
        title: 'Services',
        links: [
          { label: 'All rooms', href: '/cabinets' },
          ...FOOTER_ROOM_LINKS,
          { label: 'Cabinet installation', href: '/services/cabinet-installation' },
          { label: 'Full catalog', href: '/catalog' },
          { label: 'Shaker cabinets', href: '/shaker-cabinets' },
          { label: 'For builders', href: '/builders' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          SHOW_REVIEW_LINKS
            ? { label: 'Projects & reviews', href: '/testimonials' }
            : { label: 'Design ideas', href: '/design-ideas' },
          { label: 'Why choose us', href: '/#why-us' },
          { label: 'How we work', href: '/construction' },
          { label: 'Warranty', href: '/warranty' },
          { label: 'Existing customer? Get help', href: '/warranty#get-help' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Cabinet guides', href: '/guides' },
          { label: 'Planning downloads', href: '/resources' },
          { label: 'Blog', href: '/blog' },
          ...FOOTER_PILLAR_GUIDES,
          { label: 'Treasure Valley overview', href: '/guides/treasure-valley-cabinet-guide' },
          { label: 'Search the catalog', href: '/search' },
        ],
      },
    ],
    areas: {
      // There is no /locations index; the Treasure Valley guide is the regional overview.
      label: 'Serving the Treasure Valley',
      href: '/guides/treasure-valley-cabinet-guide',
      links: [...CITIES]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((city) => ({ label: city.name, href: locationPath(city.slug) })),
    },
    legal: [
      { label: 'Site map', href: '/sitemap' },
      { label: 'Privacy policy', href: '/privacy-policy' },
      { label: 'Terms of service', href: '/terms-of-service' },
    ],
    // Required parent-company disclosure: this brand is a DBA of P5 Home Co LLC.
    disclosure: { before: `${SITE_CONFIG.name} is a DBA of `, linkLabel: SITE_CONFIG.legalName, href: 'https://p5homeco.com', after: '' },
    copyrightName: SITE_CONFIG.name,
  },
  // Boise ADU Co is left out until its own site exists; its projects run through Boise Construction Co.
  family: {
    label: 'The P5 Home Co family',
    companies: [
      { name: 'P5 Home Co', href: 'https://p5homeco.com' },
      { name: 'Boise Construction Co', href: 'https://boiseconstruction.co' },
      { name: 'Boise Remodeling Co', href: 'https://boiseremodeling.co' },
      { name: 'Boise Handyman Co', href: 'https://boisehandyman.co' },
      { name: 'Boise Cabinet Co', href: 'https://boisecabinet.co' },
    ],
  },
  nap: { line: 'Serving Boise and the Treasure Valley' },
  hours: PUBLIC_HOURS_LINE,
  registration: {
    text: IDAHO_REGISTERED_CONTRACTOR,
    href: DOPL_LICENSE_SEARCH,
    title: 'Idaho contractor registration 8381215',
    ariaLabel: 'Idaho contractor registration 8381215 (opens in a new tab)',
    rel: 'noopener noreferrer',
  },
  parentFacebook: { href: P5_FACEBOOK_URL, label: 'P5 Home Co on Facebook' },
  parentGoogle: { href: P5_GOOGLE_PROFILE_URL, label: 'P5 Home Co on Google' },
};
