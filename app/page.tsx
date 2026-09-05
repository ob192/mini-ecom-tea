import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { ProductRail } from '@/components/ProductRail';
import { DiscoverBanner } from '@/components/DiscoverBanner';
import { ArticleCard } from '@/components/ArticleCard';
import { JoinFamily } from '@/components/JoinFamily';
import { SectionHeading, TextLink } from '@/design';
import { products, categories } from '@/lib/products';
import { ADVERTISED_CATEGORIES } from '@/lib/merchant-feed';
import { articlesByDate } from '@/lib/journal';

export const dynamic = 'force-static';

/*
  Home — the `Home Page` frame in jintea.pen, section for section:

    Header · Hero · Explore · Discover Banner · Journal · Join Family · Footer

  Note what is NOT here: the filterable catalogue. The design's home page shows
  one curated row and hands off with «УСІ ТОВАРИ →», so the full grid lives at
  /catalog, and the ItemList structured data went with it.

  The rail is deliberately fed more products than fit — the design draws four,
  and the arrows need somewhere to scroll to.
*/

/*
  What the rail shows.

  The heading says «Оберіть свій чай», so it must actually be tea:
  public/products.json is ordered alphabetically by slug, so simply taking the
  first few products filled the row with strainers, a glass pitcher and a
  garlic figurine. ADVERTISED_CATEGORIES is already the canonical definition of
  "the tea we sell as tea" (it is what the Merchant Center feed advertises), so
  the home rail and the feed cannot disagree about what counts.

  Products with no photograph are skipped: the card is mostly its image, and a
  placeholder gradient in the first thing below the hero looks broken.
*/
const CATEGORY_RANK = new Map(categories.map((c, i) => [c.slug, i]));

const featured = products
  .filter((p) => p.inStock && p.image && ADVERTISED_CATEGORIES.has(p.category))
  .sort((a, b) => (CATEGORY_RANK.get(a.category) ?? 99) - (CATEGORY_RANK.get(b.category) ?? 99))
  .slice(0, 8);

export default function HomePage() {
  const articles = articlesByDate().slice(0, 3);

  return (
    <>
      <Header />
      <Hero />

      <ProductRail
        title="Оберіть свій чай"
        products={featured}
        href="/catalog"
        listId="home_featured"
        listName="Головна · Оберіть свій чай"
      />

      <DiscoverBanner />

      <section
        className="mx-auto max-w-content px-5 py-14 lg:px-8 lg:py-16"
        aria-labelledby="journal"
      >
        <SectionHeading id="journal" action={<TextLink href="/journal">Усі статті</TextLink>}>
          Журнал
        </SectionHeading>
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <JoinFamily />
      <Footer />
    </>
  );
}
