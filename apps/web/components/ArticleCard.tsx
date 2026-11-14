import Image from 'next/image';
import Link from 'next/link';
import type { Article } from '@/lib/journal';

/*
  ArticleCard — one cell of the `Journal` grid in jintea.pen: a 6px-radius
  cover, a kicker, a title and an underlined «Читати».

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
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <p className="m-0 text-xs uppercase text-foreground">
          {article.category}
        </p>

        <h3 className="m-0 text-xl normal-case tracking-normal text-foreground transition-colors group-hover:text-primary-subtle-foreground">
          {article.title}
        </h3>

        <span className="text-sm font-medium text-muted-foreground underline decoration-border-strong underline-offset-4 transition-colors group-hover:decoration-primary-subtle-foreground">
          Читати
        </span>
      </Link>
    </article>
  );
}
