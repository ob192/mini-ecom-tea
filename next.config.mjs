/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Allow-list the hosts your product images come from. Empty by default
    // (products ship with empty images → branded placeholders are used).
    // Add your CDN/domain here before using remote `image` URLs, e.g.:
    //   { protocol: 'https', hostname: 'images.teache.ua' }
    // Avoid wildcard hostnames in production (image-optimizer DoS surface).
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
};
export default nextConfig;
