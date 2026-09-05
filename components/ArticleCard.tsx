import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/journal';
import { ArrowIcon } from './Icons';

/*
  ArticleCard — one cell of the `Journal` grid in jintea.pen: a 6px-radius
  cover, an amber kicker, a 19px display title and a "ЧИТАТИ →" affordance.

  The whole card is one link. The "ЧИТАТИ" row is styled as a link but is not
  one — a second anchor to the same href would add a duplicate tab stop and a
  duplicate entry in a screen reader's link list for no benefit.
*/
export function ArticleCard({ article, priority = false }: { article: Article; priority?: boolean }) {
  return (
    <article>
      <Link href={`/journal/${article.slug}`} className="group flex flex-col gap-3.5">
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-lg shadow-hairline">
          <Image
            src={article.cover}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <p className="m-0 font-body text-[11px] uppercase tracking-[1.4px] text-amber">
          {article.category}
        </p>

        <h3 className="m-0 font-display text-h3 normal-case leading-[1.22] tracking-normal text-ink transition-colors group-hover:text-green">
          {article.title}
        </h3>

        <span className="flex items-center gap-[5px] font-body text-[12px] font-bold uppercase tracking-[1px] text-ink-soft">
          Читати
          <ArrowIcon width={13} height={13} aria-hidden />
        </span>
      </Link>
    </article>
  );
}
