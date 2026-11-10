import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/journal';
import { ArrowRight } from 'lucide-react';

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
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-border">
          <Image
            src={article.cover}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <p className="m-0 text-xs uppercase text-foreground">
          {article.category}
        </p>

        <h3 className="m-0 text-xl normal-case tracking-normal text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>

        <span className="flex items-center gap-[5px] text-xs font-bold uppercase text-muted-foreground">
          Читати
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </Link>
    </article>
  );
}
