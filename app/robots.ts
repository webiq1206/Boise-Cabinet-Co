import { MetadataRoute } from 'next';

// AI / answer-engine crawlers we explicitly welcome (GEO/AEO). The wildcard
// rule below already permits them, but a cautious crawler can back off when
// its access is only implied, so each one is named and allowed outright.
// Matches the list used on the other P5 brand sites.
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Amazonbot',
  'Bytespider',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boisecabinet.co';

  // Staff-only surfaces plus routes that would produce thin or duplicate
  // crawlable URLs. Applied identically to the wildcard and to every named
  // AI bot, so no crawler gets a broader grant than the others.
  const disallow = [
    '/api/',
    '/admin/',
    '/portal/',
    '/design-studio',
    '/search',
    '/login',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow,
      })),
    ],
    // Both sitemaps declared so crawlers discover page URLs and image assets.
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/image-sitemap.xml`],
  };
}
