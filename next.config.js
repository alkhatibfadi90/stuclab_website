/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve the redirects that previously lived in vercel.json.
  async redirects() {
    return [
      { source: '/toolkit', destination: '/labkit', permanent: true },
      { source: '/toolkit/:path*', destination: '/labkit/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
