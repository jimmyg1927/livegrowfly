/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://growfly-api-production.up.railway.app/api/:path*',
      },
    ]
  },
}
module.exports = nextConfig
