const path = require('path');

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
    unoptimized: true,
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

    const serviceMap = {
      'weekly-lawn-maintenance': 'lawn-mowing',
      'lawn-mowing-and-trimming': 'lawn-mowing',
      'fertilization-and-weed-control': 'lawn-care',
      'spring-cleanup': 'spring-cleanup',
      'fall-cleanup': 'fall-cleanup',
      'sprinkler-repair': 'sprinkler-repair',
      'sprinkler-blowouts': 'sprinkler-blowout',
      'lawn-aeration': 'aeration',
      'thatching': 'dethatching',
      'leaf-removal': 'fall-cleanup',
      'christmas-light-installation': 'christmas-light-installation',
      'hedge-trimming': 'hedge-trimming',
      'shrub-trimming': 'hedge-trimming',
      'snow-removal': 'snow-removal',
      'snow-plowing': 'snow-removal',
    };

    const serviceAliases = {
      'lawn-mowing': 'lawn-mowing',
      'mowing': 'lawn-mowing',
      'grass-cutting': 'lawn-mowing',
      'grass-mowing': 'lawn-mowing',
      'lawn-maintenance': 'lawn-mowing',
      'yard-maintenance': 'lawn-mowing',
      'yard-care': 'lawn-mowing',
      'aeration': 'aeration',
      'core-aeration': 'aeration',
      'lawn-aerating': 'aeration',
      'fertilization': 'fertilization',
      'fertilizing': 'fertilization',
      'lawn-fertilization': 'fertilization',
      'lawn-fertilizing': 'fertilization',
      'weed-control': 'weed-control',
      'weed-removal': 'weed-control',
      'weed-treatment': 'weed-control',
      'weed-spraying': 'weed-control',
      'sod-installation': 'sod-installation',
      'sod': 'sod-installation',
      'new-sod': 'sod-installation',
      'sod-laying': 'sod-installation',
      'dethatching': 'dethatching',
      'dethatch': 'dethatching',
      'thatch-removal': 'dethatching',
      'overseeding': 'overseeding',
      'over-seeding': 'overseeding',
      'overseed': 'overseeding',
      'christmas-lights': 'christmas-light-installation',
      'holiday-lights': 'christmas-light-installation',
      'xmas-lights': 'christmas-light-installation',
      'holiday-light-installation': 'christmas-light-installation',
      'snow-clearing': 'snow-removal',
      'ice-removal': 'snow-removal',
      'sprinkler-blowout': 'sprinkler-blowout',
      'sprinkler-winterization': 'sprinkler-blowout',
      'winterization': 'sprinkler-blowout',
      'tree-trimming': 'tree-trimming',
      'tree-pruning': 'tree-trimming',
      'tree-service': 'tree-trimming',
      'tree-care': 'tree-trimming',
      'tree-removal': 'tree-removal',
      'stump-grinding': 'stump-grinding',
      'stump-removal': 'stump-grinding',
      'lawn-edging': 'lawn-edging',
      'edging': 'lawn-edging',
      'mulch': 'mulch-installation',
      'mulching': 'mulch-installation',
      'mulch-delivery': 'mulch-installation',
      'patio': 'patio-installation',
      'patios': 'patio-installation',
      'paver-patio': 'patio-installation',
      'paver-installation': 'patio-installation',
      'retaining-wall': 'retaining-walls',
      'retaining-walls': 'retaining-walls',
      'fire-pit': 'fire-pit-installation',
      'firepit': 'fire-pit-installation',
      'landscape-lighting': 'landscape-lighting',
      'outdoor-lighting': 'landscape-lighting',
      'gutter-cleaning': 'seasonal-cleanup',
      'gutter-clean': 'seasonal-cleanup',
      'gutters': 'seasonal-cleanup',
      'irrigation': 'irrigation-repair',
      'sprinkler': 'irrigation-repair',
      'sprinklers': 'irrigation-repair',
      'sprinkler-system': 'irrigation-repair',
      'lawn-renovation': 'lawn-renovation',
      'lawn-repair': 'lawn-renovation',
      'lawn-restoration': 'lawn-renovation',
    };

    const activeCities = ['kuna', 'boise', 'meridian', 'eagle', 'star', 'middleton'];
    const retiredCityMap = { 'nampa': '/areas/kuna', 'caldwell': '/areas/kuna', 'garden-city': '/areas/boise' };
    const redirects = [];

    for (const [oldSlug, newService] of Object.entries(serviceMap)) {
      redirects.push(...r(`/${oldSlug}`, `/services/${newService}`));
    }

    for (const [alias, target] of Object.entries(serviceAliases)) {
      if (!(alias in serviceMap)) {
        redirects.push(...r(`/${alias}`, `/services/${target}`));
      }
    }

    for (const city of activeCities) {
      for (const [oldSlug, newService] of Object.entries(serviceMap)) {
        redirects.push(...r(`/${city}/${oldSlug}-location-1city-name`, `/services/${newService}/${city}`));
        redirects.push(...r(`/${city}/${oldSlug}`, `/services/${newService}/${city}`));
      }
    }

    for (const [city, fallback] of Object.entries(retiredCityMap)) {
      for (const [oldSlug, newService] of Object.entries(serviceMap)) {
        redirects.push(...r(`/${city}/${oldSlug}-location-1city-name`, `/services/${newService}`));
        redirects.push(...r(`/${city}/${oldSlug}`, `/services/${newService}`));
      }
    }

    const cityVariationSuffixes = ['-idaho', '-id', '-lawn-care', '-landscaping'];
    const cityVariationPrefixes = ['lawn-care-', 'lawn-care-in-', 'lawn-service-', 'landscaping-'];

    for (const city of activeCities) {
      redirects.push(...r(`/${city}`, `/areas/${city}`));
      for (const suffix of cityVariationSuffixes) {
        redirects.push(...r(`/${city}${suffix}`, `/areas/${city}`));
      }
      for (const prefix of cityVariationPrefixes) {
        redirects.push(...r(`/${prefix}${city}`, `/areas/${city}`));
      }
    }

    for (const [city, fallback] of Object.entries(retiredCityMap)) {
      redirects.push(...r(`/${city}`, fallback));
      for (const suffix of cityVariationSuffixes) {
        redirects.push(...r(`/${city}${suffix}`, fallback));
      }
      for (const prefix of cityVariationPrefixes) {
        redirects.push(...r(`/${prefix}${city}`, fallback));
      }
    }

    const pageAliases = {
      '/our-services': '/services',
      '/all-services': '/services',
      '/lawn-care': '/services',
      '/lawn-care-services': '/services',
      '/lawn-services': '/services',
      '/landscaping': '/services',
      '/landscaping-services': '/services',
      '/irrigation-services': '/services',
      '/seasonal': '/services',
      '/seasonal-services': '/services',
      '/testimonials': '/about',
      '/reviews': '/about',
      '/our-reviews': '/about',
      '/gallery': '/about',
      '/our-work': '/about',
      '/portfolio': '/about',
      '/projects': '/about',
      '/news': '/blog',
      '/frequently-asked-questions': '/faq',
      '/our-pricing': '/pricing',
      '/rates': '/pricing',
      '/free-quote': '/get-quote',
      '/free-estimate': '/get-quote',
      '/request-quote': '/get-quote',
      '/request-estimate': '/get-quote',
      '/get-estimate': '/get-quote',
      '/get-a-quote': '/get-quote',
      '/get-a-free-quote': '/get-quote',
      '/quote': '/get-quote',
      '/estimate': '/get-quote',
      '/our-team': '/about',
      '/our-story': '/about',
      '/meet-the-team': '/about',
      '/about-us': '/about',
      '/contact-us': '/contact',
      '/get-in-touch': '/contact',
      '/privacy': '/privacy-policy',
      '/terms': '/terms-of-service',
      '/terms-and-conditions': '/terms-of-service',
      '/commercial-services': '/commercial',
      '/commercial-lawn-care': '/commercial',
      '/residential': '/services',
      '/residential-services': '/services',
      '/residential-lawn-care': '/services',
      '/home': '/',
      '/index': '/',
      '/index.html': '/',
      '/index.php': '/',
      '/sitemap': '/sitemap.xml',
      '/site-map': '/sitemap.xml',
      '/careers': '/about',
      '/jobs': '/about',
      '/employment': '/about',
      '/wp-admin': '/',
      '/wp-login': '/',
      '/wp-login.php': '/',
      '/sprinkler-blowouts-2': '/services/sprinkler-blowout',
    };

    for (const [source, destination] of Object.entries(pageAliases)) {
      redirects.push(...r(source, destination));
    }

    return redirects;
  },
}

module.exports = nextConfig
