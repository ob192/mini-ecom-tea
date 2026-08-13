import { buildFeed, feedExclusions } from '@/lib/merchant-feed';
import { siteUrl } from '@/lib/format';

// Prerendered with the rest of the catalogue: the feed only changes when
// public/products.json does, and Merchant Center fetches it on a schedule.
export const dynamic = 'force-static';

export function GET() {
  const excluded = feedExclusions();
  if (excluded.length > 0) {
    // Surfaced in the build log — a silently shrinking feed is hard to notice.
    console.warn(
      `[merchant-feed] skipped ${excluded.length} product(s): ` +
        excluded.map((e) => `${e.slug} (${e.reason})`).join(', '),
    );
  }

  return new Response(buildFeed(siteUrl()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
