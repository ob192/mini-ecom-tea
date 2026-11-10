import { notFound } from 'next/navigation';

import { BuyPanel, BuyStack, BuyTierList } from '@/components/playground/buy/BuyVariants';
import { devOnly } from '@/components/playground/guard';
import { ExplorationIntro, VariantGap, VariantLabel } from '@/components/playground/Variant';
import { Header } from '@/components/Header';
import { getProduct } from '@/lib/products';

/*
  The product page's buy block — gallery, tiers, quantity, price, action.

  One product for all three, so the comparison is about shape: a four-tier
  pu-erh with three photographs, which is the hardest case the catalogue has.
*/
export default function BuyExploration() {
  devOnly();

  const product = getProduct('puer/jingmai-qiaomu-shu');
  if (!product) notFound();

  return (
    <>
      <ExplorationIntro title="Блок покупки">
        <p>
          Один і той самий товар у всіх трьох — чотири рівні ваги й три фотографії, найважчий
          випадок у каталозі. Спільне й не обговорюється: ціна — це ціна обраного рівня, а не
          найдешевшого; на телефоні дія їде в <code className="font-mono text-sm">.sticky-bar</code>,
          яка піднімає себе над плашкою про куки; чипи й лічильник — 44 px.
        </p>
      </ExplorationIntro>

      <VariantLabel
        n={1}
        name="Стовпчик"
        idea="Те, що є зараз, прибране: ціна, чипи ваги, під ними лічильник і кнопка одним рядом. Усе в порядку читання, нічого не обрамлене."
        tradeoff="Найлегший і найзвичніший: сторінка читається згори вниз без жодної рамки. Але на десктопі ціна й кнопка їдуть угору разом зі сторінкою — у довгого опису вони зникають з екрана."
      />
      <Header back backHref={`/catalog?cat=${product.category}`} />
      <BuyStack product={product} />
      <VariantGap />

      <VariantLabel
        n={2}
        name="Панель"
        idea="Усе, що покупець вирішує — рівень, кількість, сума, дія — зібрано на одній поверхні картки, опис лишається поза нею. На десктопі панель липне, поки опис гортається."
        tradeoff="Рішення зібране в одному місці й завжди на екрані; сума рахується на очах. Але на телефоні панель — це ще одна рамка над липкою кнопкою, тобто дія згадується двічі."
      />
      <Header back backHref={`/catalog?cat=${product.category}`} />
      <BuyPanel product={product} />
      <VariantGap />

      <VariantLabel
        n={3}
        name="Список рівнів"
        idea="Чипи стають рядками: вага, ціна й ціна за грам, щоб рівні можна було порівняти, а не вгадати. Найвигідніший позначено."
        tradeoff="Єдиний варіант, де видно, що більша пачка дешевша за грам — а це те, чим каталог і заробляє. Але чотири рядки займають місце чотирьох чипів у вісім разів більше, і перший екран на телефоні втрачає фотографію."
      />
      <Header back backHref={`/catalog?cat=${product.category}`} />
      <BuyTierList product={product} />
      <VariantGap />
    </>
  );
}
