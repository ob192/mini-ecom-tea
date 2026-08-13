import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ReturnIcon, ClockIcon, PackageIcon, AlertIcon } from '@/components/Icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Повернення та обмін',
  description:
    'Умови повернення й обміну товарів jintea.shop: 14 днів на чайне приладдя, заміна або повернення коштів за пошкоджені чи невідповідні замовлення.',
  alternates: { canonical: '/returns' },
};

const cards = [
  {
    icon: ClockIcon,
    title: '14 днів на приладдя',
    text: 'Гайвані, чайники, піали, аксесуари та фігурки можна повернути протягом 14 днів з дня отримання, якщо товар не був у використанні.',
  },
  {
    icon: PackageIcon,
    title: 'Чай — харчовий продукт',
    text: 'Чай належної якості поверненню та обміну не підлягає (Постанова КМУ №172). Це не стосується випадків, описаних нижче.',
  },
  {
    icon: AlertIcon,
    title: 'Брак, пошкодження, не той товар',
    text: 'Якщо товар пошкоджено при пересиланні, має дефект або не відповідає замовленню — замінюємо або повертаємо кошти повністю, включно з доставкою.',
  },
  {
    icon: ReturnIcon,
    title: 'Кошти — до 7 робочих днів',
    text: 'Повертаємо на той самий рахунок або картку протягом 7 робочих днів після отримання й перевірки повернутої посилки.',
  },
];

const steps = [
  'Зателефонуйте або напишіть нам у Telegram чи Instagram протягом 14 днів з дня отримання замовлення.',
  'Опишіть причину повернення. Якщо товар пошкоджений або не відповідає замовленню — надішліть фото.',
  'Ми узгодимо спосіб відправки та надамо дані отримувача для Нової Пошти.',
  'Після отримання посилки перевіряємо товар і повертаємо кошти протягом 7 робочих днів.',
];

const conditions = [
  'Товар не був у використанні, збережено товарний вигляд, споживчі властивості, пломби та фабричне пакування.',
  'Збережено документ, що підтверджує оплату (чек, накладна або номер ТТН).',
  'Вартість зворотної доставки оплачує покупець, якщо повернення відбувається за власним бажанням.',
  'Якщо причина повернення — брак, пошкодження при пересиланні або наша помилка, зворотну доставку оплачуємо ми.',
  'Посилку варто оглянути у відділенні Нової Пошти при отриманні. Якщо є видимі пошкодження упаковки, складіть акт разом з оператором — це спрощує компенсацію.',
];

export default function ReturnsPage() {
  return (
    <>
      <Header title="Повернення та обмін" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-2.5">
          Повернення та обмін
        </h1>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed mb-6">
          Хочемо, щоб чай і посуд вам справді підійшли. Якщо щось не так — напишіть нам, і ми
          вирішимо це разом. Нижче — умови повернення відповідно до Закону України «Про захист прав
          споживачів».
        </p>

        <div className="flex flex-col gap-2.5">
          {cards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card rounded-lg shadow-sh-1 p-4 flex gap-3.5 items-start">
              <span className="w-10 h-10 shrink-0 rounded-full bg-green-tint text-green flex items-center justify-center">
                <Icon width={19} height={19} />
              </span>
              <div>
                <div className="font-display font-semibold text-[15.5px] text-ink mb-0.5">{title}</div>
                <p className="m-0 text-ink-faint text-[13.5px] leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">
          Як оформити повернення
        </h2>
        <ol className="m-0 pl-0 list-none flex flex-col gap-2.5">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3 items-start">
              <span className="w-6 h-6 shrink-0 mt-px rounded-full bg-green text-on-green font-display font-semibold text-[13px] flex items-center justify-center">
                {i + 1}
              </span>
              <p className="m-0 text-ink-soft text-[15px] leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">Умови</h2>
        <ul className="m-0 pl-0 list-none flex flex-col gap-2">
          {conditions.map((c) => (
            <li key={c} className="flex gap-2.5 items-start">
              <span className="text-green mt-[9px] w-1.5 h-1.5 shrink-0 rounded-full bg-green" aria-hidden />
              <p className="m-0 text-ink-soft text-[15px] leading-relaxed">{c}</p>
            </li>
          ))}
        </ul>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">Обмін</h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Замість повернення коштів можна обміняти приладдя на інший товар з каталогу. Різницю у
          вартості доплачуєте або повертаємо — залежно від нового замовлення.
        </p>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">Зв’язок з нами</h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Телефон{' '}
          <a href="tel:+380986575800" className="text-green underline underline-offset-2">
            +38 (098) 657-58-00
          </a>
          , пошта{' '}
          <a href="mailto:hello@jintea.shop" className="text-green underline underline-offset-2">
            hello@jintea.shop
          </a>
          . Усі способи зв’язку — на сторінці <Link href="/contacts" className="text-green underline underline-offset-2">Контакти</Link>.
        </p>

        <Button asChild variant="pill" size="xl" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
