import { devOnly } from '@/components/playground/guard';
import {
  OfferBox,
  OfferInset,
  OfferSevenCups,
} from '@/components/playground/offer/OfferVariants';
import { ExplorationIntro, VariantGap, VariantLabel } from '@/components/playground/Variant';
import { Alert } from '@/components/ui/alert';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';
import { BRAND_NAME } from '@/lib/contacts';

/*
  The starter-set offer as a block that can sit anywhere — further down the home
  page, in the catalogue, in an empty cart. Separate from the hero exploration,
  which is about the first screen.
*/
export default function OfferExploration() {
  devOnly();

  return (
    <>
      <ExplorationIntro title="Блок про стартовий набір">
        <p>
          Не перший екран, а секція, яку можна поставити будь-де: нижче на головній, у каталозі, у
          порожньому кошику. Текст — реальний запис каталогу{' '}
          <code className="font-mono text-sm">set/start-mini-7</code> із нотатками смаку з
          постачальницького аркуша.
        </p>
      </ExplorationIntro>

      <div data-exploration-label className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <Alert variant="warning" title="Два питання до банера — потрібне ваше рішення">
          <ul className="mt-1 flex list-none flex-col gap-2">
            <li>
              Банер обіцяє безкоштовну доставку за підписку в Instagram. Набір коштує 570 ₴, а
              безкоштовна доставка починається з {FREE_DELIVERY_THRESHOLD} ₴ — тобто вона вже
              безкоштовна, і обіцянка нічого не дає. Або поріг для цієї пропозиції інший, або
              подарунок має бути іншим.
            </li>
            <li>
              Банер пише бренд як «JinTea». У коді <code className="font-mono text-sm">BRAND_NAME</code>{' '}
              — «{BRAND_NAME}», і саме це написання йде в Merchant Center, в Organization JSON-LD і в
              заголовок кожної сторінки. Одне з двох треба виправити.
            </li>
          </ul>
        </Alert>
      </div>

      <VariantLabel
        n={1}
        name="Коробка"
        idea="Спокійна смуга: фотографія набору з одного боку, сім сортів списком з другого, під ними ціна й дія."
        tradeoff="Читається як секція сторінки, а не як реклама, і сім назв видно одразу. Але це повна смуга — на головній вона забирає цілий екран, а назви без нотаток смаку мало що кажуть новачкові."
      />
      <OfferBox />
      <VariantGap />

      <VariantLabel
        n={2}
        name="Сім чашок"
        idea="Ведуть сорти, а не коробка: кожен — плитка з нотаткою смаку, фотографія стискається до однієї плитки в ряду, дія стоїть угорі біля ціни."
        tradeoff="Єдиний варіант, що відповідає на питання «а який він на смак» — сім нотаток і є пропозиція. Але вісім плиток поспіль читаються довше, і на телефоні це довгий стовпчик."
      />
      <OfferSevenCups />
      <VariantGap />

      <VariantLabel
        n={3}
        name="Вузька врізка"
        idea="Не смуга, а одна картка, яку можна вкинути у звичайний потік сторінки — між рядами каталогу, у порожній кошик, під товар."
        tradeoff="Найдешевша в місці: не ламає ритм сторінки й працює там, де смуга не поміститься. Але сім сортів у неї не влазять — вона може лише пообіцяти набір, а не показати його."
      />
      <OfferInset />
      <VariantGap />
    </>
  );
}
