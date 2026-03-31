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
    const serviceMap = {
      'weekly-lawn-maintenance': 'lawn-mowing',
      'lawn-mowing-and-trimming': 'lawn-mowing',
      'fertilization-and-weed-control': 'fertilization',
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

    const activeCities = ['kuna', 'boise', 'meridian', 'eagle', 'star', 'middleton'];
    const retiredCities = ['nampa', 'caldwell', 'garden-city'];

    const topLevelRedirects = [];
    const cityServiceRedirects = [];

    for (const [oldSlug, newService] of Object.entries(serviceMap)) {
      topLevelRedirects.push({
        source: `/${oldSlug}`,
        destination: `/services/${newService}`,
        permanent: true,
      });
      topLevelRedirects.push({
        source: `/${oldSlug}/`,
        destination: `/services/${newService}`,
        permanent: true,
      });
    }

    for (const city of activeCities) {
      for (const [oldSlug, newService] of Object.entries(serviceMap)) {
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}-location-1city-name`,
          destination: `/services/${newService}/${city}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}-location-1city-name/`,
          destination: `/services/${newService}/${city}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}`,
          destination: `/services/${newService}/${city}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}/`,
          destination: `/services/${newService}/${city}`,
          permanent: true,
        });
      }
    }

    for (const city of retiredCities) {
      for (const [oldSlug, newService] of Object.entries(serviceMap)) {
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}-location-1city-name`,
          destination: `/services/${newService}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}-location-1city-name/`,
          destination: `/services/${newService}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}`,
          destination: `/services/${newService}`,
          permanent: true,
        });
        cityServiceRedirects.push({
          source: `/${city}/${oldSlug}/`,
          destination: `/services/${newService}`,
          permanent: true,
        });
      }
    }

    return [
      ...topLevelRedirects,

      { source: '/sprinkler-blowouts-2', destination: '/services/sprinkler-blowout', permanent: true },
      { source: '/sprinkler-blowouts-2/', destination: '/services/sprinkler-blowout', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/about-us/', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/contact-us/', destination: '/contact', permanent: true },

      ...cityServiceRedirects,

      { source: '/nampa', destination: '/areas/kuna', permanent: true },
      { source: '/nampa/', destination: '/areas/kuna', permanent: true },
      { source: '/caldwell', destination: '/areas/kuna', permanent: true },
      { source: '/caldwell/', destination: '/areas/kuna', permanent: true },
      { source: '/garden-city', destination: '/areas/boise', permanent: true },
      { source: '/garden-city/', destination: '/areas/boise', permanent: true },
    ];
  },
}

module.exports = nextConfig
