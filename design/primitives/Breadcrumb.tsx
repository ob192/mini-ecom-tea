'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevLeftIcon } from '@/components/Icons';

/*
  Breadcrumb — the `Навігація` panel's back affordance.

  The design shows a single "‹ НАЗАД", not a full ancestor trail. With `href`
  it is a real link (crawlable, middle-clickable); without one it falls back to
  router.back(), which is what the product page wants when it was reached from
  a filtered catalogue and should return to that filter.
*/
export function Breadcrumb({ href, label = 'Назад' }: { href?: string; label?: string }) {
  const router = useRouter();

  const inner = (
    <>
      <ChevLeftIcon width={15} height={15} aria-hidden />
      <span className="text-[12px] uppercase tracking-[1.2px]">{label}</span>
    </>
  );

  const cls =
    'inline-flex items-center gap-1.5 rounded-sm font-body text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={cls}>
      {inner}
    </button>
  );
}
