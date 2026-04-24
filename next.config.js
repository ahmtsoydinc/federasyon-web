/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Geliştirme
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // Üretim
      {
        protocol: 'https',
        hostname: 'tshf.org.tr',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.tshf.org.tr',
        pathname: '/uploads/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'sharp'],
  },
  async redirects() {
    return [
      {
        source: '/tstbhf-portal',
        destination: '/admin/giris',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
