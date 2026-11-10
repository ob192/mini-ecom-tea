import { Header } from '@/components/Header';
import { devOnly } from '@/components/playground/guard';
import {
  HeroLightShelf,
  HeroLightShelfSecondBand,
  HeroOverFootage,
  HeroSplit,
} from '@/components/playground/hero/HeroVariants';
import { ExplorationIntro, VariantGap, VariantLabel } from '@/components/playground/Variant';

/*
  Hero — three ways to lead the home page with the starter set.

  Each variant renders with the real site header above it, as it would ship.
*/
export default function HeroExploration() {
  devOnly();

  return (
    <>
      <ExplorationIntro title="Перший екран">
        <p>
          Усі три ведуть набором «Старт МІНІ» — 7 сортів по 10 г, 570 ₴ — і всі три тримають
          контракт відео: постер окремою картинкою, він же перший кадр, він же LCP; хто не отримує
          ролик, бачить завершений екран, а не дірку.
        </p>
        <p>
          Банер із <code className="font-mono text-sm">media/reference</code> — орієнтир для тону
          пропозиції, не макет: заголовок, вкарбований у пікселі, свариться з заголовком сторінки,
          не перекладається, не читається з екрана й не може бути LCP у розумному розмірі.
        </p>
      </ExplorationIntro>

      <VariantLabel
        n={1}
        name="Поверх кадру"
        idea="Ролик займає весь перший екран, пропозиція лежить на ньому живим текстом — низом ліворуч на телефоні, правою колонкою від lg, саме там, де нові кадри найтемніші."
        tradeoff="Найменше змін і найсильніше відчуття місця: чай у русі займає весь екран. Але пропозиція лишається прозою — сім сортів, вага й ціна читаються як речення, а не як перелік, і все це залежить від того, що в кадрі."
      />
      <Header />
      <HeroOverFootage />
      <VariantGap />

      <VariantLabel
        n={2}
        name="Розділена смуга"
        idea="Пропозиція перестає бути прозою й стає блоком: що в коробці, ціна, дія — на темному тлі, ролик заповнює другу половину. На телефоні ролик — смуга зверху, під нею одразу ціна й кнопка."
        tradeoff="Найінформативніший перший екран: сім сортів видно списком, ціна стоїть поруч із кнопкою. Але ролик втрачає половину ширини, а на телефоні — більшу частину висоти, тож рух працює слабше."
      />
      <Header />
      <HeroSplit />
      <VariantGap />

      <VariantLabel
        n={3}
        name="Світла полиця"
        idea="Перший екран — кремова сторінка, а не темна смуга: текст ліворуч, ролик у рамці праворуч, три чипи-докази лежать на її краю. Темна смуга не зникає, вона переїжджає нижче (показана одразу під варіантом)."
        tradeoff="Сайт відкривається спокійно й по-магазинному, ролик стає тим, на що дивляться, а не тим, крізь що читають. Але перший екран втрачає кінематографічність, а чипи на телефоні не мають краю, на який лягти, і стають звичайним рядком під рамкою."
      />
      <Header />
      <HeroLightShelf />
      <HeroLightShelfSecondBand />
      <VariantGap />
    </>
  );
}
