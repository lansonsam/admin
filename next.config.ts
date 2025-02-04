import type { NextConfig } from 'next'

const config: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://127.0.0.1:8000/auth/:path*',
      },
      {
        source: '/static/avatars/:path*',
        destination: 'http://127.0.0.1:8000/static/avatars/:path*',
      },
    ]
  },
}

export default config
