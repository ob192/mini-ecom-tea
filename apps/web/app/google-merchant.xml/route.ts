import { buildFeed, buildFeedItems, feedDefects, feedExclusions } from '@/lib/merchant-feed';
import { siteUrl } from '@/lib/format';

// Prerendered with the rest of the catalogue: the feed only changes when
// public/products.json does, and Merchant Center fetches it on a schedule.
export const dynamic = 'force-static';

export function GET() {
  const site = siteUrl();
  const items = buildFeedItems(site);
  const skipped = feedExclusions().length;
  const defects = feedDefects();

  // Surfaced in the build log — a silently shrinking feed is hard to notice.
  // Only defects are named: the deliberate category exclusions are the
  // majority and would drown them out.
  console.warn(`[merchant-feed] ${items.length} offer(s), ${skipped} product(s) skipped`);
  if (defects.length > 0) {
    console.warn(
      `[merchant-feed] advertised but unlistable: ` +
        defects.map((e) => `${e.slug} (${e.reason})`).join(', '),
    );
  }

  return new Response(buildFeed(site), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
