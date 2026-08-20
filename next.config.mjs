/**
 * The shop answers on more than one hostname. `jintea.shop` and
 * `www.jintea.shop` were serving the *same deployment* as the primary host —
 * byte-identical HTML, both returning 200, neither redirecting. GA4 duly
 * reported them as two sites (36 vs 27 views over 28 days) because the hostname
 * is part of the page_location, and Google had two crawlable copies of every
 * URL held together by nothing but the canonical tag.
 *
 * These redirects collapse them onto one host, permanently (308), preserving
 * the path so deep links and any already-indexed URLs survive. The destination
 * follows NEXT_PUBLIC_SITE_URL rather than being written out again, so changing
 * the primary domain is still a one-variable change — and a host that has
 * become the primary is filtered out below, which is what stops a flip from
 * producing a redirect loop.
 */
const PRIMARY_HOST = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jintea.restreto-labs.com',
).host;

/** Hostnames that must not serve the shop in parallel. */
const ALIAS_HOSTS = ['jintea.shop', 'www.jintea.shop', 'jintea.restreto-labs.com'].filter(
  (host) => host !== PRIMARY_HOST,
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return ALIAS_HOSTS.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `https://${PRIMARY_HOST}/:path*`,
      permanent: true,
    }));
  },
};
export default nextConfig;
