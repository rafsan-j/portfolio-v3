/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: false },
  async redirects() {
    return [
      { source: '/inkwell', destination: '/writing', permanent: true },
      { source: '/inkwell/:slug', destination: '/writing/:slug', permanent: true },
      { source: '/archive', destination: '/work', permanent: true },
      { source: '/lab', destination: '/studio', permanent: true },
      { source: '/map', destination: '/about#map', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/studio-scene.html',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
