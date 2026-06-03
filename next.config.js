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
    // Run the webpack compile in a separate worker process so its heap is
    // isolated from (and freed before) the static-page-generation phase. This
    // keeps the two biggest memory consumers from stacking on top of each
    // other during `next build`. Must be set explicitly because this project
    // customizes the webpack config below, which otherwise disables the worker.
    webpackBuildWorker: true,
    // Size the static-page-generation worker pool from available RAM instead
    // of CPU count. On builders with many cores but a modest memory envelope,
    // the default spawns one full app-loading render worker per core, which is
    // the largest build-memory spike for this content-heavy site (~150 static
    // pages). Capping by memory prevents OOM kills during static generation.
    memoryBasedWorkersCount: true,
    cpus: 2,
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

    // Catalog cleanup: removed door styles and collections → canonical real products
    const catalogRedirects = {
      '/door-styles/modern-shaker': '/door-styles/shaker',
      '/door-styles/three-piece': '/door-styles',
      '/door-styles/alpha-shaker': '/door-styles',
      '/door-styles/beta-shaker': '/door-styles',
      '/collections/full-custom': '/collections/custom',
      '/collections/semi-custom': '/collections/custom',
      '/collections/spec-grade': '/collections/custom',
    };

    for (const [source, destination] of Object.entries(catalogRedirects)) {
      redirects.push(...r(source, destination));
    }

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
