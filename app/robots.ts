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
          '/login',
          '/dealer',
          '/installer',
          '/search',
          '/design-studio',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
