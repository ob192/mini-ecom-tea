import * as React from 'react';
import Link from 'next/link';
import { ChevLeftIcon } from '@/components/Icons';

/*
  Breadcrumb — the `Навігація` panel's back affordance.

  The design shows a single "‹ НАЗАД", not a full ancestor trail.

  It is a real link to the page's parent, deliberately, and not
  `router.back()`. Back-as-history was the original implementation and it broke
  in both directions:

    - On a direct landing — a pasted URL, a link opened in a new tab, an ad or
      a search result pointing straight at a product — there is no in-app entry
      to return to, so the control either did nothing or walked the visitor out
      of the site to a blank tab. Verified on /product/puer/jingmai-qiaomu-shu
      in a fresh tab: one click and the shop was gone.
    - When the visitor did arrive from somewhere, that somewhere is usually
      Google. `navigation.canGoBack` cannot tell "the previous entry is ours"
      from "the previous entry is the search results", so honouring history
      would send paid traffic straight back to the auction it was bought from.

  A link has neither failure. The product page passes
  `/catalog?cat=<category>`, so a visitor who came from the filtered catalogue
  still lands back on that filter — the case history-back existed to serve —
  and one who came from outside gets the catalogue instead of an exit. It also
  agrees with the `BreadcrumbList` JSON-LD the same pages emit, is crawlable,
  survives a middle-click, and needs no JavaScript. Give every `back` header a
  `backHref`; `/` is the fallback, not a good answer.
*/
export function Breadcrumb({ href = '/', label = 'Назад' }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-sm font-body text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevLeftIcon width={15} height={15} aria-hidden />
      <span className="text-[12px] uppercase tracking-[1.2px]">{label}</span>
    </Link>
  );
}
