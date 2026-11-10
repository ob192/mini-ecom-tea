import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

/*
  BackLink — «Назад», a real link to the page's parent.

  It is deliberately not `router.back()`. Back-as-history broke in both
  directions:

    - On a direct landing — a pasted URL, a link opened in a new tab, an ad or a
      search result pointing straight at a product — there is no in-app entry
      behind the page, so the control either did nothing or walked the visitor
      out of the shop into a blank tab. Reproduced on
      /product/puer/jingmai-qiaomu-shu in a fresh tab: one click and the shop
      was gone.
    - When the visitor did arrive from somewhere, that somewhere is usually
      Google. No browser API tells "the previous entry is ours" from "the
      previous entry is the search results", so honouring history would send
      paid traffic back to the auction it was bought from.

  A link has neither failure. The product page passes `/catalog?cat=<category>`,
  so a visitor who came from the filtered catalogue lands back on that filter —
  the case history-back existed to serve — and one who came from outside gets
  the catalogue instead of an exit. It also agrees with the `BreadcrumbList`
  JSON-LD those pages emit, is crawlable, survives a middle-click and needs no
  JavaScript. Give every `back` header a `backHref`; `/` is a floor, not a good
  answer. tests/back-navigation.test.ts pins this.
*/
export function BackLink({ href = '/', label = 'Назад' }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ChevronLeft className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
