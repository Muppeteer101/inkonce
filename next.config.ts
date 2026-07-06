import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Higgsfield generation output CDN (results are mirrored to Blob, but
      // freshly-completed generations render from the source URL first).
      { protocol: 'https', hostname: '**.higgsfield.ai' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      // Vercel Blob — permanent home of every design.
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
