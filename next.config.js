/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Preserve trailing slashes to match existing URLs
  trailingSlash: false,
  // Enable standalone output for deployment
  output: 'standalone',
}

module.exports = nextConfig
