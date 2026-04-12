/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow running on any port via PORT env var

  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      { protocol: 'https', hostname: 'limitlesstcg.nyc3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // PWA headers for future mobile app transition
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

export default nextConfig;
