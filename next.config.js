const path = require('path')

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
  webpack: (config) => {
    config.resolve.alias['@lib'] = path.resolve(__dirname, 'lib')
    config.resolve.alias['@components'] = path.resolve(__dirname, 'src/components')
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')
    return config
  }
}

module.exports = nextConfig
