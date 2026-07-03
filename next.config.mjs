/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
};
export default nextConfig;
