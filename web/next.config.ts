import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // CSS stays a separate (cached) file: inlining it also copied it twice into the page's RSC
  // payload, adding about 120 KB to every HTML response.
  experimental: {inlineCss: false},
  // The share-image route reads its font and logo from disk when it regenerates.
  outputFileTracingIncludes: {'/og/[[...slug]]': ['./src/app/og/assets/**']},
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/6qzta0cg/**'},
      {protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dnf24p24f/**'},
      {protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**'},
    ],
  },
  // Existing redirects, unchanged (permanent: true sends 308, as on the current site).
  async redirects() {
    return [
      {source: '/services/detailing', destination: '/services/detailing-and-polishing', permanent: true},
      {source: '/services/sun-film', destination: '/services/window-tint', permanent: true},
      {source: '/services/wraps', destination: '/services/vehicle-wrapping', permanent: true},
      {source: '/live-chat', destination: '/whatsapp', permanent: true},
      {source: '/contact', destination: '/book-inspection', permanent: true},
    ]
  },
  async headers() {
    const headers = [
      {key: 'X-Content-Type-Options', value: 'nosniff'},
      {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
      {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
      {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
    ]
    return [
      {source: '/:path*', headers},
      // Only the real domain may be indexed. vercel.app URLs and previews never compete with it.
      {
        source: '/:path*',
        missing: [{type: 'host', value: '(www\\.)?autoglowcare\\.in'}],
        headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}],
      },
    ]
  },
}

export default nextConfig
