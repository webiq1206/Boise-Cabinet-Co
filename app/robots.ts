import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boisecabinet.co';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/portal/',
          '/design-studio',
          '/search',
          '/login',
        ],
      },
    ],
    // Both sitemaps declared so crawlers discover page URLs and image assets.
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/image-sitemap.xml`],
  };
}
