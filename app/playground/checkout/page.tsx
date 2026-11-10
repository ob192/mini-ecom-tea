import {
  CheckoutOneColumn,
  CheckoutSteps,
  CheckoutSummaryFirst,
} from '@/components/playground/checkout/CheckoutVariants';
import { devOnly } from '@/components/playground/guard';
import { ExplorationIntro, VariantGap, VariantLabel } from '@/components/playground/Variant';
import { Header } from '@/components/Header';

/*
  Checkout field group — the screen where the mobile funnel dies. Each variant
  is shown in the state that matters: after a failed submit, with two fields
  wrong and everything the visitor typed still there.
*/
export default function CheckoutExploration() {
  devOnly();

  return (
    <>
      <ExplorationIntro title="Поля оформлення">
        <p>
          За 90 днів до 2026-09-07 сайт не отримав жодного замовлення з 93 мобільних сесій. Це той
          екран, тож усі три варіанти показано після невдалої відправки: два поля з помилками, усе
          введене на місці.
        </p>
        <p>
          Спільне й не обговорюється: кожне поле — через <code className="font-mono text-sm">Field</code>,
          який сам звʼязує <code className="font-mono text-sm">aria-describedby</code> і{' '}
          <code className="font-mono text-sm">aria-invalid</code>; поля 16 px на телефоні, бо нижче
          iOS Safari збільшує весь екран; спосіб доставки — радіогрупа, а не дві кнопки; кнопка
          відправки лишається активною з помилками й вимикається лише під час надсилання.
        </p>
      </ExplorationIntro>

      <VariantLabel
        n={1}
        name="Один стовпчик"
        idea="Поле під полем, підписи зверху, жодних секцій — найкоротший шлях від верху до кнопки. Повідомлення про невдалу відправку стоїть над полями."
        tradeoff="Найшвидше заповнити тому, хто вже знає, чого хоче, і найменше розмітки між полями. Але на телефоні це одинадцять полів поспіль без жодної зупинки — довгий сірий коридор без відчуття просування."
      />
      <Header back backHref="/cart" />
      <CheckoutOneColumn />
      <VariantGap />

      <VariantLabel
        n={2}
        name="Три кроки"
        idea="Та сама сторінка й та сама одна відправка, але форма поділена на три пронумеровані картки: хто отримує, куди доставити, оплата. Нічого не ховається й нікуди не веде."
        tradeoff="Видно, скільки лишилося, і третій крок виявляється порожнім — «оплата при отриманні, вводити нічого не треба» — що знімає найбільший страх. Але карток стає три, і сторінка довша за перший варіант майже на екран."
      />
      <Header back backHref="/cart" />
      <CheckoutSteps />
      <VariantGap />

      <VariantLabel
        n={3}
        name="Спершу кошик"
        idea="На телефоні кошик — найперше на екрані, згорнутий в один рядок із сумою; під ним одразу телефон великим полем, бо він єдиний обовʼязковий до дзвінка."
        tradeoff="Той, хто прийшов з реклами, бачить що купує й скільки це коштує, перш ніж у нього щось питають, — і бачить, що доставка безкоштовна. Але підказка «решту можна не заповнювати до дзвінка» — обіцянка, якої код поки не дає: валідація вимагає всі поля."
        note="Третій варіант потребує рішення власника: або форма справді приймає саме телефон, і тоді замовлення підтверджується дзвінком, або цю підказку треба прибрати."
      />
      <Header back backHref="/cart" />
      <CheckoutSummaryFirst />
      <VariantGap />
    </>
  );
}
