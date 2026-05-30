import { buildSectionsHtml, CITIES_LIST, type ContentSection } from './wave1/snippets';
import { buildContextualExpansions } from './contextualExpansions';
import { getHubBySlug, guidePath } from '../contentHubs';
import type { BlogPostData } from '../blogContent';
import type { GuidePageData, GuideType } from '../guideContent';

const CITY_LINKS = `<a href="/areas/boise">Boise</a>, <a href="/areas/meridian">Meridian</a>, <a href="/areas/eagle">Eagle</a>, <a href="/areas/kuna">Kuna</a>, <a href="/areas/star">Star</a>, <a href="/areas/middleton">Middleton</a>, <a href="/areas/nampa">Nampa</a>, and <a href="/areas/caldwell">Caldwell</a>`;

export function expandHtml(
  html: string,
  slug: string,
  hubSlug: string,
  blockCount: number,
  footer?: string,
): string {
  return html + (footer ?? '') + buildContextualExpansions(slug, hubSlug, blockCount);
}

export function expandPillar(html: string, slug: string, hubSlug: string, blockCount = 182): string {
  return expandHtml(
    html,
    slug,
    hubSlug,
    blockCount,
    `<p>Explore <a href="/guides/treasure-valley-remodeling-guide">local guides</a>, <a href="/guides/boise-remodeling-cost-guide">cost planning</a>, and <a href="/areas">service areas</a>.</p>`,
  );
}

export function expandCluster(html: string, slug: string, hubSlug: string, blockCount = 110): string {
  return expandHtml(html, slug, hubSlug, blockCount);
}

export function expandLocation(html: string, slug: string, blockCount = 118): string {
  return expandHtml(html, slug, 'treasure-valley-locations', blockCount);
}

export function clusterFaqs(topic: string): Array<{ question: string; answer: string }> {
  const t = topic.toLowerCase();
  return [
    { question: `What should I know about ${t} in the Treasure Valley?`, answer: 'Local permits, housing stock, and finish level matter more than national averages. This article covers Boise-area specifics.' },
    { question: 'Do you serve my city?', answer: `Yes—we remodel in ${CITIES_LIST}.` },
    { question: 'How do I get started?', answer: 'Schedule an in-home consultation or use our project estimator for a planning range.' },
    { question: 'Are permits included?', answer: 'Our design-build scope includes permit coordination for Ada and Canyon County when required.' },
    { question: 'How long do projects take?', answer: 'Timelines depend on design, selections, and permit review—often weeks to months.' },
    { question: 'What is design-build?', answer: 'One team handles design, estimating, permits, and construction under a single contract.' },
    { question: 'How do I budget?', answer: 'See our Boise Remodeling Cost Guide and hub pillar articles for planning ranges.' },
    { question: 'Why choose a local contractor?', answer: 'Local teams understand Ada vs Canyon permitting, trade availability, and Treasure Valley housing types.' },
  ];
}

export function pillarFaqs(hubTitle: string): Array<{ question: string; answer: string }> {
  const base = clusterFaqs(hubTitle);
  const extra = [
    { question: `What is the best order to plan a ${hubTitle.toLowerCase()} project?`, answer: 'Define scope, get a written preliminary plan, lock structural/MEP, then selections before construction.' },
    { question: 'How does Boise climate affect remodeling?', answer: 'Dry summers and cold winters influence scheduling, concrete work, and humidity control during finishes.' },
    { question: 'Ada County vs Canyon County—does it matter?', answer: 'Yes—submission portals, review cadence, and fees differ between Ada and Canyon County projects.' },
    { question: 'Can I live at home during construction?', answer: 'Depends on scope; baths and kitchens can sometimes be phased; whole-home work may need temporary housing.' },
    { question: 'What warranty should I expect?', answer: 'Ask for written warranty terms covering labor and clarify manufacturer warranties on products.' },
    { question: 'Do you publish starting-at prices?', answer: 'We publish planning education, not bait pricing—firm numbers require seeing your home and scope.' },
    { question: 'How do I compare contractors fairly?', answer: 'Match scope, allowances, permits, and schedule—not just bottom-line bids.' },
  ];
  return [...base, ...extra].slice(0, 18);
}

function hubSections(
  topic: string,
  pillarUrl: string,
  serviceUrl: string,
  cityServiceUrl: string,
  extra: ContentSection[] = [],
): ContentSection[] {
  return [
    {
      h2: `What should Treasure Valley homeowners know about ${topic}?`,
      paragraphs: [
        `Homeowners in ${CITIES_LIST} research ${topic.toLowerCase()} before committing to design-build construction. This guide is part of our topical library—start with the <a href="${pillarUrl}">pillar guide</a> for the full picture.`,
        'Boise Remodeling Co coordinates design, permits, and construction under one contract so scope stays aligned from consultation through walkthrough.',
      ],
    },
    {
      h2: 'Planning ranges and timelines',
      paragraphs: [
        'Budget and schedule depend on layout changes, finishes, and Ada or Canyon County permit paths—not a single sticker price.',
        `See <a href="/guides/boise-remodeling-cost-guide">remodeling costs</a> for cross-project planning bands.`,
      ],
      table: {
        className: 'timeline-table',
        headers: ['Phase', 'Typical duration'],
        rows: [
          ['Design & selections', '4–10 weeks'],
          ['Permits (if required)', '2–8 weeks'],
          ['Construction', '4–16+ weeks'],
        ],
      },
    },
    {
      h2: 'Local services and areas',
      paragraphs: [
        `Explore <a href="${serviceUrl}">remodeling services</a> and <a href="${cityServiceUrl}">city-specific pages</a>. We serve ${CITY_LINKS}.`,
      ],
    },
    ...extra,
    {
      h2: 'Next steps',
      paragraphs: [
        'Use our <a href="/#calculator">estimator</a> for a planning range, then <a href="/contact">schedule a consultation</a> for written scope.',
      ],
    },
  ];
}

export interface ClusterConfig {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  hubSlug: string;
  tags: string[];
  quickAnswer: string;
  takeaways: string[];
  serviceUrl?: string;
  cityServiceUrl?: string;
  extraSections?: ContentSection[];
  publishedAt?: string;
}

export function buildClusterPost(config: ClusterConfig): BlogPostData {
  const hub = getHubBySlug(config.hubSlug)!;
  const pillarUrl = guidePath(hub.pillarSlug);
  const serviceUrl = config.serviceUrl ?? '/services/kitchen-remodel';
  const cityUrl = config.cityServiceUrl ?? '/services/kitchen-remodel/boise';
  const html = expandCluster(
    buildSectionsHtml(
      hubSections(config.title, pillarUrl, serviceUrl, cityUrl, config.extraSections),
    ),
    config.slug,
    config.hubSlug,
  );
  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: html,
    author: 'Boise Remodeling Co',
    category: hub.categoryLabel,
    hubSlug: config.hubSlug,
    tags: config.tags,
    publishedAt: config.publishedAt ?? '2026-05-15',
    faqs: clusterFaqs(config.title),
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    relatedLinks: [
      { url: pillarUrl, anchor: hub.title },
      { url: serviceUrl },
      { url: cityUrl },
      { url: '/guides/boise-remodeling-cost-guide' },
    ],
    wordCountTarget: 'cluster',
  };
}

export interface PillarConfig {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  hubSlug: string;
  tags: string[];
  quickAnswer: string;
  takeaways: string[];
  linkedClusterSlugs: string[];
  linkedServices?: string[];
  extraSections?: ContentSection[];
}

export function buildPillarGuide(config: PillarConfig): GuidePageData {
  const hub = getHubBySlug(config.hubSlug)!;
  const pillarUrl = guidePath(config.slug);
  const sections = hubSections(
    config.title,
    pillarUrl,
    config.linkedServices?.[0] ? `/services/${config.linkedServices[0]}` : '/services/kitchen-remodel',
    '/services/kitchen-remodel/boise',
    config.extraSections,
  );
  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: expandPillar(buildSectionsHtml(sections), config.slug, config.hubSlug, 182),
    author: 'Boise Remodeling Co',
    hubSlug: config.hubSlug,
    guideType: 'hub-pillar',
    tags: config.tags,
    publishedAt: '2026-05-10',
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    faqs: pillarFaqs(hub.title),
    linkedClusterSlugs: config.linkedClusterSlugs,
    linkedServices: config.linkedServices,
    relatedLinks: [
      { url: '/guides/treasure-valley-remodeling-guide' },
      { url: '/guides/boise-remodeling-cost-guide' },
      { url: `/blog/category/${config.hubSlug}` },
      { url: '/areas' },
    ],
  };
}

export interface LocationGuideConfig {
  slug: string;
  title: string;
  cityName: string;
  citySlug: string;
  county: 'ada' | 'canyon';
  housingNote: string;
  guideType: GuideType;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  quickAnswer: string;
  takeaways: string[];
}

export function buildLocationGuide(config: LocationGuideConfig): GuidePageData {
  const sections: ContentSection[] = [
    {
      h2: `Remodeling in ${config.cityName}, Idaho`,
      paragraphs: [
        config.housingNote,
        `This ${config.guideType === 'neighborhood' ? 'neighborhood' : 'city'} guide is part of our <a href="/guides/treasure-valley-remodeling-guide">Treasure Valley remodeling hub</a>.`,
      ],
    },
    {
      h2: 'Permits and jurisdiction',
      paragraphs: [
        config.county === 'ada'
          ? `${config.cityName} projects typically route through Ada County plan review for layout and structural work.`
          : `${config.cityName} is in Canyon County—expect different submission portals and review cadence than Ada County.`,
        '<a href="/blog/ada-vs-canyon-county-permit-timelines">Compare permit timelines</a> · <a href="/blog/boise-permit-guide">Boise permit guide</a>.',
      ],
    },
    {
      h2: 'Services in your area',
      paragraphs: [
        `<a href="/services/kitchen-remodel/${config.citySlug}">Kitchen remodels</a>, <a href="/services/bathroom-remodel/${config.citySlug}">bathrooms</a>, <a href="/services/whole-home-remodel/${config.citySlug}">whole-home</a>, <a href="/services/room-addition/${config.citySlug}">additions</a>, <a href="/areas/${config.citySlug}">${config.cityName} area page</a>.`,
      ],
    },
    {
      h2: 'Costs and planning',
      paragraphs: [
        'Use the <a href="/guides/boise-remodeling-cost-guide">Boise Remodeling Cost Guide</a> for planning ranges before design.',
      ],
    },
  ];
  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: expandLocation(buildSectionsHtml(sections), config.slug),
    author: 'Boise Remodeling Co',
    hubSlug: 'treasure-valley-locations',
    guideType: config.guideType,
    tags: [config.citySlug, config.cityName.toLowerCase(), 'idaho'],
    publishedAt: '2026-05-12',
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    faqs: clusterFaqs(config.cityName),
    linkedCities: [config.citySlug],
    relatedLinks: [
      { url: '/guides/treasure-valley-remodeling-guide' },
      { url: `/areas/${config.citySlug}` },
    ],
  };
}
