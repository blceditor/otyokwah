/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // REQ-BUILD-002: Enable parallel build workers for faster builds
  // REQ-BUILD-003: Optimize package imports for better tree-shaking
  experimental: {
    // Parallel compilation options (10-25% faster builds)
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,

    // Tree-shake large libraries with barrel files
    optimizePackageImports: [
      'lucide-react',
      '@headlessui/react',
    ],
  },

  images: {
    // REQ-103: Configure image optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 1024, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year - images rarely change
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bearlakecamp.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.vercel.app https://ik.imagekit.io https://i.ytimg.com https://www.bearlakecamp.com https://avatars.githubusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.vercel.app https://www.bearlakecamp.com https://api.github.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
              "media-src 'self'",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; ') + ';',
          },
        ],
      },
    ];
  },
  async redirects() {
    const defaultBranch = process.env.KEYSTATIC_DEFAULT_BRANCH;
    return [
      ...(defaultBranch ? [
        {
          source: '/keystatic',
          destination: `/keystatic/branch/${defaultBranch}`,
          permanent: false,
        },
        {
          source: '/keystatic/singleton/:path*',
          destination: `/keystatic/branch/${defaultBranch}/singleton/:path*`,
          permanent: false,
        },
        {
          source: '/keystatic/collection/:path*',
          destination: `/keystatic/branch/${defaultBranch}/collection/:path*`,
          permanent: false,
        },
      ] : []),
      {
        source: '/summer-camp/jr-high',
        destination: '/summer-camp-sessions#jr-high-camp',
        permanent: true,
      },
      {
        source: '/summer-camp/high-school',
        destination: '/summer-camp-sessions#sr-high-camp',
        permanent: true,
      },
      // Legacy page redirects
      {
        source: '/summer-camp-junior-high',
        destination: '/summer-camp-sessions#jr-high-camp',
        permanent: true,
      },
      {
        source: '/summer-camp-senior-high',
        destination: '/summer-camp-sessions#sr-high-camp',
        permanent: true,
      },
      // REQ-NAV-008: Phase 4 nested URL redirects (website-notes2.md issues)
      {
        source: '/work-at-camp/summer-staff',
        destination: '/summer-staff',
        permanent: true,
      },
      {
        source: '/work-at-camp/year-round',
        destination: '/work-at-camp-year-round',
        permanent: true,
      },
      {
        source: '/summer-camp/what-to-bring',
        destination: '/summer-camp-what-to-bring',
        permanent: true,
      },
      {
        source: '/summer-camp/faq',
        destination: '/summer-camp-faq',
        permanent: true,
      },
      {
        source: '/retreats/rentals',
        destination: '/retreats-rentals',
        permanent: true,
      },
      {
        source: '/facilities/outdoor',
        destination: '/rentals-outdoor-spaces',
        permanent: true,
      },
      {
        source: '/about/staff',
        destination: '/staff',
        permanent: true,
      },
      {
        source: '/about-staff',
        destination: '/about-our-team',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
