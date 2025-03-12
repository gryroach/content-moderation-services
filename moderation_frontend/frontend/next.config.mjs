let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      // Proxy API requests to avoid CORS issues in development
      {
        source: '/api-ugc/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL ? 
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*` : 
          'http://localhost:8000/api-ugc/v1/:path*', // Default fallback
      },
      {
        source: '/api-moderator/v1/:path*',
        destination: process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL ? 
          `${process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL}/:path*` : 
          'http://localhost:8001/api-moderator/v1/:path*', // Default fallback
      },
    ]
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig

