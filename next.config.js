const path = require('path');

const { register } = require('tsx/cjs/api');
register();

process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  trailingSlash: false,
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/shared': path.resolve(__dirname, 'shared'),
      '@shared': path.resolve(__dirname, 'shared'),
    };
    return config;
  },

  async redirects() {
    const r = (source, destination) => [
      { source, destination, permanent: true },
      { source: source + '/', destination, permanent: true },
    ];

    const redirects = [];

    // Legacy page aliases → canonical BRC routes
    const pageAliases = {
      '/about-us': '/about',
      '/our-story': '/',
      '/meet-the-team': '/',
      '/contact-us': '/contact',
      '/get-in-touch': '/#consult',
      '/get-quote': '/#consult',
      '/free-quote': '/#consult',
      '/free-estimate': '/#calculator',
      '/request-quote': '/#consult',
      '/request-estimate': '/#consult',
      '/get-estimate': '/#calculator',
      '/get-a-quote': '/#consult',
      '/get-a-free-quote': '/#consult',
      '/quote': '/#consult',
      '/estimate': '/#calculator',
      '/portfolio': '/testimonials',
      '/gallery': '/#gallery',
      '/our-work': '/testimonials',
      '/projects': '/testimonials',
      '/reviews': '/testimonials',
      '/our-reviews': '/testimonials',
      '/our-services': '/#services',
      '/all-services': '/',
      '/pricing': '/#calculator',
      '/our-pricing': '/#calculator',
      '/rates': '/#calculator',
      '/faq': '/',
      '/frequently-asked-questions': '/',
      '/commercial': '/',
      '/commercial-services': '/',
      '/seasonal': '/',
      '/seasonal-services': '/',
      '/seasonal-guide': '/',
      '/news': '/blog',
      '/privacy': '/privacy-policy',
      '/terms': '/terms-of-service',
      '/terms-and-conditions': '/terms-of-service',
      '/home': '/',
      '/index': '/',
      '/index.html': '/',
      '/index.php': '/',
      '/sitemap': '/sitemap.xml',
      '/site-map': '/sitemap.xml',
      '/careers': '/',
      '/jobs': '/',
      '/employment': '/',
      '/wp-admin': '/',
      '/wp-login': '/',
      '/wp-login.php': '/',
    };

    for (const [source, destination] of Object.entries(pageAliases)) {
      redirects.push(...r(source, destination));
    }

    const { allContentRedirects } = require(path.resolve(
      __dirname,
      'shared/contentRedirects.ts',
    ));
    for (const { source, destination } of allContentRedirects()) {
      redirects.push(...r(source, destination));
    }

    const serviceRedirects = {
      '/services/kitchen-remodel': '/cabinets/kitchen',
      '/services/bathroom-remodel': '/cabinets/bathroom',
      '/services/whole-home-remodel': '/guides/whole-home-cabinetry-guide',
      '/services/room-addition': '/guides/built-in-cabinet-guide',
      '/services/adu': '/cabinets/closet',
      '/subcontractor': '/partner',
      '/subcontractor/': '/partner',
    };

    for (const [source, destination] of Object.entries(serviceRedirects)) {
      redirects.push(...r(source, destination));
    }

    const treasureValleyGuide = '/guides/treasure-valley-cabinet-guide';
    redirects.push(...r('/areas', treasureValleyGuide));

    const cities = [
      'boise',
      'meridian',
      'eagle',
      'nampa',
      'kuna',
      'star',
      'middleton',
      'caldwell',
    ];

    for (const city of cities) {
      redirects.push(...r(`/areas/${city}`, treasureValleyGuide));
      redirects.push(...r(`/services/kitchen-remodel/${city}`, '/cabinets/kitchen'));
      redirects.push(...r(`/services/bathroom-remodel/${city}`, '/cabinets/bathroom'));
      redirects.push(
        ...r(`/services/whole-home-remodel/${city}`, '/guides/whole-home-cabinetry-guide'),
      );
      redirects.push(
        ...r(`/services/room-addition/${city}`, '/guides/built-in-cabinet-guide'),
      );
      redirects.push(...r(`/services/adu/${city}`, '/cabinets/closet'));
    }

    return redirects;
  },
}

module.exports = nextConfig
