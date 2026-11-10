import { CardOpen, CardRow, CardSurface } from '@/components/playground/card/CardVariants';
import { devOnly } from '@/components/playground/guard';
import { ExplorationIntro, VariantGap, VariantLabel } from '@/components/playground/Variant';
import { SectionHeading } from '@/components/ui/section-heading';
import { TextLink } from '@/components/ui/text-link';
import { getProduct } from '@/lib/products';
import type { Product } from '@/lib/types';

/*
  Product card — three shapes, each shown twice: as the catalogue grid and as
  the rail on the home page, because the same card has to hold in both.

  The four products are chosen to break it: three weight tiers, four tiers, one
  tier, and no tiers at all (teaware). A long title is in there on purpose.
*/
const SLUGS = [
  'puer/jingmai-qiaomu-shu', // 4 tiers
  'green/longjing-cha', // 3 tiers
  'puer/seven-sons-shu', // 1 tier — a label, not a control
  'gaiwan/jingdezhen-200ml', // no tiers, long title
  'oolong/dancong-milanxiang',
  'white/lao-baicha-shoumei',
];

function Grid({
  products,
  Card,
  /*
    Variant 3 lies down on phones, and a row inside a two-column grid is
    nonsense: at 375 it pushed the page to a 497px scrollWidth, the chips
    stacked one per line and every title wrapped to four. A row list is one
    column until the card stands up at `sm`.
  */
  cols = 'grid-cols-2 lg:grid-cols-3',
}: {
  products: Product[];
  Card: (p: { product: Product }) => React.ReactElement;
  cols?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading as="h3" action={<TextLink href="/catalog">Усі товари</TextLink>}>
        Каталог
      </SectionHeading>
      <div className={`mt-6 grid gap-x-4 gap-y-8 ${cols}`}>
        {products.map((p) => (
          <Card key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

function Rail({
  products,
  Card,
}: {
  products: Product[];
  Card: (p: { product: Product }) => React.ReactElement;
}) {
  return (
    <section className="bg-subtle py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading as="h3" action={<TextLink href="/catalog">Усі товари</TextLink>}>
          Оберіть свій чай
        </SectionHeading>
      </div>
      {/* A rail is the one place a sideways scroll is the design. It starts at
          the container's gutter and runs past both screen edges. */}
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-[max(2rem,calc((100vw-72rem)/2))]">
        {products.map((p) => (
          <div key={p.slug} className="w-[62vw] shrink-0 snap-start sm:w-64 lg:w-72">
            <Card product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CardExploration() {
  devOnly();

  const products = SLUGS.map(getProduct).filter((p): p is Product => Boolean(p));
  // The last one is forced out of stock: a card has to hold that too.
  const withOutOfStock = products.map((p, i) =>
    i === products.length - 1 ? ({ ...p, inStock: false } as Product) : p,
  );

  return (
    <>
      <ExplorationIntro title="Картка товару">
        <p>
          Кожен варіант показано двічі — сіткою каталогу й стрічкою на головній, бо та сама картка
          має тримати обидва місця. Шість товарів підібрані так, щоб її зламати: чотири рівні ваги,
          три, один, жодного (посуд), довга назва й одна позиція без наявності.
        </p>
        <p>
          Спільне для всіх трьох і не обговорюється: чипи ваги — це справжній вибір рівня, ціна над
          ними — ціна обраного рівня, а кнопка додає саме його. Один рівень малюється написом, а не
          контролом.
        </p>
      </ExplorationIntro>

      <VariantLabel
        n={1}
        name="Відкрита"
        idea="Жодної поверхні: фотографія і є карткою, текст лежить просто на сторінці, кнопка додавання — кружечок у куті знімка."
        tradeoff="Найлегша сітка — нічого не бореться з фотографіями, і на телефоні дві картки в ряд дихають. Але дія — безтекстовий значок: його видно, лише якщо вже шукаєш, а саме додавання в кошик на телефоні тут і не відбувається."
      />
      <Grid products={withOutOfStock} Card={CardOpen} />
      <Rail products={withOutOfStock} Card={CardOpen} />
      <VariantGap />

      <VariantLabel
        n={2}
        name="Картка"
        idea="Усе на поверхні картки, а дія — кнопка на всю ширину з написом «У кошик» замість значка."
        tradeoff="Дія нарешті називає себе й має повний розмір пальця — це те, чого бракує мобільній воронці. Але сітка важчає: шість кремових прямокутників поруч забирають увагу в самого чаю."
      />
      <Grid products={withOutOfStock} Card={CardSurface} />
      <Rail products={withOutOfStock} Card={CardSurface} />
      <VariantGap />

      <VariantLabel
        n={3}
        name="Рядок на телефоні"
        idea="На телефоні картка лягає: квадратна мініатюра ліворуч, назва, рівні й ціна праворуч. Чотири вміщаються там, де було дві. Від sm вона встає й стає карткою другого варіанта."
        tradeoff="Каталог на телефоні проглядається вдвічі швидше, а ціна й кнопка стоять поруч. Але фотографія стискається до 112 px — для чаю, який купують очима, це дорога втрата, і в стрічці на головній рядок не працює, тож там лишається картка."
      />
      <Grid products={withOutOfStock} Card={CardRow} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
      <Rail products={withOutOfStock} Card={CardSurface} />
      <VariantGap />
    </>
  );
}
