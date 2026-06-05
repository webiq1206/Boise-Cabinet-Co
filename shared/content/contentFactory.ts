import { buildSectionsHtml, CITIES_LIST, type ContentSection } from './wave1/snippets';
import { buildClusterArticleSections } from './clusterArticleSections';
import {
  clusterLinksSection,
  hubTopicSections,
  pillarEssentialsSection,
} from './guideSectionBlocks';
import { getHubPillarFaqs, getLocationFaqs } from './hubFaqs';
import { buildLocationGuideSections } from './locationCityContent';
import { getHubBySlug, guidePath } from '../contentHubs';
import { SITE_CONFIG } from '../siteConfig';
import type { BlogPostData } from '../blogContent';
import type { GuidePageData, GuideType } from '../guideContent';

const PILLAR_FOOTER =
  `<p class="text-sm text-muted-foreground">Explore <a href="/guides/treasure-valley-cabinet-guide">local guides</a>, <a href="/guides/boise-cabinet-cost-guide">cost planning</a>, <a href="/cabinets">cabinet catalog</a>, and <a href="/design-studio">Design Studio</a>.</p>`;

export function expandPillar(html: string, _slug: string, _hubSlug: string): string {
  return html + PILLAR_FOOTER;
}

export function expandLocation(html: string, _slug: string): string {
  return html;
}

/** ~8 focused H2 sections per hub pillar, no repeated template walls. */
function buildPillarSections(
  topic: string,
  pillarUrl: string,
  _serviceUrl: string,
  _cityServiceUrl: string,
  hubSlug: string,
  linkedClusterSlugs: string[] | undefined,
  extra: ContentSection[] = [],
): ContentSection[] {
  const clusterSection = clusterLinksSection(hubSlug, linkedClusterSlugs);
  return [
    {
      h2: `What should homeowners know about ${topic}?`,
      paragraphs: [
        `This overview covers ${topic.toLowerCase()} for ${CITIES_LIST}. Use the topic sections below, then follow linked articles for room-specific depth.`,
        `${SITE_CONFIG.name} designs, builds, and installs custom cabinets with clear written scope from consultation through installation.`,
      ],
    },
    pillarEssentialsSection(topic),
    ...hubTopicSections(hubSlug, topic),
    {
      h2: 'Explore our catalog',
      paragraphs: [
        '<a href="/cabinets">All cabinets</a> · <a href="/collections">Collections</a> · <a href="/door-styles">Door styles</a> · <a href="/finishes">Finishes</a>.',
      ],
    },
    ...extra,
    ...(clusterSection ? [clusterSection] : []),
    {
      h2: 'Next steps',
      paragraphs: [
        '<a href="/design-studio">Design Studio</a> · <a href="/contact">Schedule consultation</a> · <a href="/guides">All guides</a>.',
        `Back to <a href="${pillarUrl}">this guide</a> anytime for the overview.`,
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

/** Stable small hash so each cluster rotates into a different slice of hub FAQs. */
function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Cluster FAQs: lead with FAQs unique to THIS cluster (derived from its title,
 * quick answer, and takeaways), then top up with a rotated slice of hub FAQs so
 * clusters in the same hub no longer share an identical FAQ block. Keeps the
 * 6-15 FAQ count required by verify-content.
 */
function buildClusterFaqs(
  config: ClusterConfig,
  hubTitle: string,
  pillarUrl: string,
): Array<{ question: string; answer: string }> {
  const topic = config.title.toLowerCase();
  const unique: Array<{ question: string; answer: string }> = [
    {
      question: `${config.title}: what should Treasure Valley homeowners know?`,
      answer: config.quickAnswer,
    },
  ];
  const tk = config.takeaways ?? [];
  if (tk[0]) {
    unique.push({
      question: `What matters most when planning ${topic}?`,
      answer: tk[0],
    });
  }
  if (tk.length > 1) {
    unique.push({
      question: `What else should I plan for with ${topic}?`,
      answer: tk.slice(1).join(' '),
    });
  }

  const hubFaqs = getHubPillarFaqs(config.hubSlug);
  let rotated: Array<{ question: string; answer: string }> = [];
  if (hubFaqs.length > 0) {
    const offset = slugHash(config.slug) % hubFaqs.length;
    rotated = [...hubFaqs.slice(offset), ...hubFaqs.slice(0, offset)];
  }

  const fallback = [
    {
      question: 'Do you serve Ada and Canyon County?',
      answer: `Yes, we design, build, and install custom cabinets across ${CITIES_LIST}.`,
    },
    {
      question: 'How do I get a planning range?',
      answer:
        'Use our online estimator for a planning range, then schedule a free in-home consultation for a written scope.',
    },
    {
      question: 'What should I read next?',
      answer: `See our <a href="${pillarUrl}">${hubTitle}</a> and the <a href="/guides/boise-cabinet-cost-guide">cabinet cost guide</a>.`,
    },
  ];

  const combined = [...unique, ...rotated, ...fallback];
  // De-dupe by question, keep first occurrence, cap at 8.
  const seen = new Set<string>();
  const deduped = combined.filter((f) => {
    const key = f.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return deduped.slice(0, Math.max(6, Math.min(8, deduped.length)));
}

export function buildClusterPost(config: ClusterConfig): BlogPostData {
  const hub = getHubBySlug(config.hubSlug)!;
  const pillarUrl = guidePath(hub.pillarSlug);
  const serviceUrl = config.serviceUrl ?? '/cabinets/kitchen';
  const html = buildSectionsHtml(
    buildClusterArticleSections({
      slug: config.slug,
      title: config.title,
      excerpt: config.excerpt,
      quickAnswer: config.quickAnswer,
      hubSlug: config.hubSlug,
      serviceUrl: config.serviceUrl,
      cityServiceUrl: config.cityServiceUrl,
      extraSections: config.extraSections,
    }),
  );

  const faqs = buildClusterFaqs(config, hub.title, pillarUrl);

  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: html,
    author: SITE_CONFIG.name,
    category: hub.categoryLabel,
    hubSlug: config.hubSlug,
    tags: config.tags,
    publishedAt: config.publishedAt ?? '2026-05-15',
    faqs,
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    relatedLinks: [
      { url: pillarUrl, anchor: hub.title },
      { url: serviceUrl },
      { url: '/guides/boise-cabinet-cost-guide' },
      { url: '/cabinets' },
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
  const catalogPath = config.linkedServices?.[0]
    ? `/cabinets/${config.linkedServices[0]}`
    : '/cabinets/kitchen';
  const sections = buildPillarSections(
    config.title,
    pillarUrl,
    catalogPath,
    catalogPath,
    config.hubSlug,
    config.linkedClusterSlugs,
    config.extraSections,
  );
  const hubFaqs = getHubPillarFaqs(config.hubSlug);

  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: expandPillar(buildSectionsHtml(sections), config.slug, config.hubSlug),
    author: SITE_CONFIG.name,
    hubSlug: config.hubSlug,
    guideType: 'hub-pillar',
    tags: config.tags,
    publishedAt: '2026-05-10',
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    faqs: hubFaqs.length > 0 ? hubFaqs : [],
    linkedClusterSlugs: config.linkedClusterSlugs,
    linkedServices: config.linkedServices,
    relatedLinks: [
      { url: '/guides/treasure-valley-cabinet-guide' },
      { url: '/guides/boise-cabinet-cost-guide' },
      { url: `/blog/category/${config.hubSlug}` },
      { url: '/cabinets' },
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
  const sections = buildLocationGuideSections(
    config.slug,
    config.cityName,
    config.citySlug,
    config.county,
    config.housingNote,
    config.guideType,
  );

  return {
    slug: config.slug,
    title: config.title,
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    excerpt: config.excerpt,
    content: expandLocation(buildSectionsHtml(sections), config.slug),
    author: SITE_CONFIG.name,
    hubSlug: 'treasure-valley-locations',
    guideType: config.guideType,
    tags: [config.citySlug, config.cityName.toLowerCase(), 'idaho'],
    publishedAt: '2026-05-12',
    quickAnswer: config.quickAnswer,
    keyTakeaways: config.takeaways,
    faqs: getLocationFaqs(config.cityName, config.citySlug, config.county),
    linkedCities: [config.citySlug],
    relatedLinks: [
      { url: '/guides/treasure-valley-cabinet-guide' },
      { url: '/cabinets' },
    ],
  };
}
