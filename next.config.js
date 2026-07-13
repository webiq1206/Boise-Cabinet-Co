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
  // Keep the WebSocket + Neon serverless packages out of the webpack bundle.
  // When `output: 'standalone'` bundles and minifies `ws` into the server
  // chunks, its `bufferUtil.mask` export gets mangled, producing
  // "TypeError: t.mask is not a function" at runtime and killing the Neon
  // WebSocket connection ("Connection terminated unexpectedly"). Loading these
  // from real node_modules at runtime preserves the unminified module.
  experimental: {
    serverComponentsExternalPackages: ['ws', '@neondatabase/serverless', 'bufferutil', 'utf-8-validate'],
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
  // Pre-generated static WebP variants are served by a custom loader, bypassing
  // the runtime image optimizer entirely. On Replit autoscale the optimizer
  // cache is per-instance/ephemeral, so on-demand (re)encoding made images slow
  // to appear after every deploy/scale event. Serving static variants makes them
  // instant and edge/browser-cacheable. See lib/images/staticVariantLoader.ts
  // and scripts/images/build-image-variants.mjs.
  images: {
    loader: 'custom',
    loaderFile: './lib/images/staticVariantLoader.ts',
    // device/image sizes still drive which widths next/image requests from the
    // custom loader (which maps each to the nearest pre-generated variant).
    deviceSizes: [320, 640, 768, 1080, 1280, 1920],
    imageSizes: [160, 320],
  },
  compress: true,
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

  async headers() {
    const immutable = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];
    return [
      { source: '/images/:path*', headers: immutable },
      { source: '/generated/:path*', headers: immutable },
      { source: '/downloads/:path*', headers: immutable },
    ];
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
      '/consultation': '/#consult',
      '/get-in-touch': '/#consult',
      '/get-quote': '/#consult',
      '/free-quote': '/#consult',
      '/free-estimate': '/estimate',
      '/request-quote': '/#consult',
      '/request-estimate': '/#consult',
      '/get-estimate': '/estimate',
      '/get-a-quote': '/#consult',
      '/get-a-free-quote': '/#consult',
      '/quote': '/#consult',
      '/portfolio': '/testimonials',
      '/gallery': '/#gallery',
      '/our-work': '/testimonials',
      '/projects': '/testimonials',
      '/reviews': '/testimonials',
      '/our-reviews': '/testimonials',
      '/our-services': '/#services',
      '/all-services': '/',
      '/pricing': '/estimate',
      '/our-pricing': '/estimate',
      '/rates': '/estimate',
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
      '/subcontractor': '/',
      '/subcontractor/': '/',
      '/partner': '/',
      '/partner/': '/',
    };

    for (const [source, destination] of Object.entries(serviceRedirects)) {
      redirects.push(...r(source, destination));
    }

    // Legacy catalog slugs → OSC catalog
    const catalogRedirects = {
      '/door-styles/shaker': '/door-styles/modern-shaker',
      '/collections/full-custom': '/collections/custom',
      '/collections/semi-custom': '/collections/custom',
      '/collections/spec-grade': '/collections/custom',
    };

    for (const [source, destination] of Object.entries(catalogRedirects)) {
      redirects.push(...r(source, destination));
    }

    // Catalog consolidation (2026-07): the "Finishes & Doors" menu and the
    // standalone catalog category subpages were removed in favor of a single
    // embedded catalog experience at /catalog. 301 the old routes (and any
    // deeper paths) so no SEO equity is lost and no bookmark 404s.
    const catalogConsolidation = [
      '/finishes',
      '/door-styles',
      '/finder',
      '/products',
      '/collections',
      '/hardware',
    ];
    for (const base of catalogConsolidation) {
      redirects.push(
        { source: base, destination: '/catalog', permanent: true },
        { source: `${base}/:path*`, destination: '/catalog', permanent: true },
      );
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

    // Email links to pages that do not currently exist (contractor lead/project
    // portal, customer quote-status). Route them to the contact page so no email
    // button 404s. Temporary (not permanent) so dedicated pages can be built
    // later without a cached 308 getting in the way.
    const missingPageEmailLinks = [
      '/quote-status/:quoteId',
      '/subcontractor/leads',
      '/subcontractor/projects',
    ];
    for (const source of missingPageEmailLinks) {
      redirects.push({ source, destination: '/contact', permanent: false });
      redirects.push({ source: source + '/', destination: '/contact', permanent: false });
    }

    return redirects;
  },
}

module.exports = nextConfig
