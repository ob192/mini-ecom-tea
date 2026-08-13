import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AlertIcon, MailIcon, PhoneIcon, TelegramIcon } from '@/components/Icons';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/lib/contacts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Обмін та повернення',
  description:
    'Умови обміну та повернення товару jintea.restreto-labs.com: 14 днів згідно із Законом України «Про захист прав споживачів», порядок повернення коштів і контакти для звернення.',
  alternates: { canonical: '/returns' },
};

/** Перелік товарів, що не підлягають обміну та поверненню (Постанова КМУ №172). */
const EXCEPTIONS_LAW_URL = 'https://zakon2.rada.gov.ua/laws/show/172-94-%D0%BF';

const checklist = [
  'товар і його упаковка не були пошкоджені, всі етикетки та ярлики на місці;',
  'товар не був у користуванні: відсутні сліди використання, подряпини, сколи, потертості та інше;',
  'замовлений вами товар підлягає поверненню та обміну.',
];

const contacts = [
  { icon: PhoneIcon, label: 'Телефон', value: CONTACT_PHONE, href: CONTACT_PHONE_HREF },
  { icon: TelegramIcon, label: 'Telegram', value: TELEGRAM_HANDLE, href: TELEGRAM_URL },
  { icon: MailIcon, label: 'Пошта', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
];

export default function ReturnsPage() {
  return (
    <>
      <Header title="Обмін та повернення" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-6">
          Обмін та повернення
        </h1>

        <h2 className="font-display font-semibold text-[19px] text-ink mb-2.5">Політика повернення</h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Згідно із Законом України «Про захист прав споживачів» покупець має право обміняти товар на
          аналогічний або повернути протягом 14 днів, якщо куплений товар не підійшов за формою,
          габаритами, фасоном, кольором, розміром або з інших причин, і якщо збережено товарний
          вигляд, ярлики і розрахунковий документ, виданий продавцем разом із товаром. Виняток
          становлять товари, які не підлягають поверненню за Законом, їх перелік ви можете переглянути{' '}
          <a
            href={EXCEPTIONS_LAW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green underline underline-offset-2"
          >
            за посиланням
          </a>
          .
        </p>

        <p className="m-0 mt-4 text-ink-soft text-[15px] leading-relaxed">
          Щоб повернути товар, будь ласка, переконайтеся, що:
        </p>
        <ul className="m-0 mt-2.5 pl-0 list-none flex flex-col gap-2">
          {checklist.map((c) => (
            <li key={c} className="flex gap-2.5 items-start">
              <span className="mt-[9px] w-1.5 h-1.5 shrink-0 rounded-full bg-green" aria-hidden />
              <p className="m-0 text-ink-soft text-[15px] leading-relaxed">{c}</p>
            </li>
          ))}
        </ul>

        <p className="m-0 mt-4 text-ink-soft text-[15px] leading-relaxed">
          Оплата доставки повернення відбувається за рахунок покупця.
        </p>

        <div className="mt-3 bg-card rounded-lg shadow-sh-1 p-4 flex gap-3.5 items-start">
          <span className="w-10 h-10 shrink-0 rounded-full bg-green-tint text-green flex items-center justify-center">
            <AlertIcon width={19} height={19} />
          </span>
          <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
            Доставка браку здійснюється за наш рахунок.
          </p>
        </div>

        <p className="m-0 mt-4 text-ink-soft text-[15px] leading-relaxed">
          Якщо ви не забрали своє замовлення або відмовилися від нього на пошті, це також вважається
          поверненням. Доставка в обидві сторони оплачується покупцем.
        </p>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">
          Порядок повернення коштів
        </h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Повернути гроші або обміняти товар ми зможемо протягом 5 робочих днів з моменту отримання
          нами товару на склад.
        </p>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">
          Як відправити заяву на повернення?
        </h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed mb-3.5">
          Зв’язатися з нашим менеджером за номером телефону, в чаті Telegram, або відправити листа на
          електронну адресу. Контакти для зворотного зв’язку вказані нижче:
        </p>

        <div className="flex flex-col gap-2.5">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              className="bg-card rounded-lg shadow-sh-1 p-4 flex items-center gap-3.5 hover:bg-green-tint transition-colors"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-green-tint text-green flex items-center justify-center">
                <Icon width={19} height={19} />
              </span>
              <div className="min-w-0">
                <div className="text-ink-faint text-[12.5px]">{label}</div>
                <div className="font-display font-semibold text-[15.5px] text-ink break-all">
                  {value}
                </div>
              </div>
            </a>
          ))}
        </div>

        <Button asChild variant="pill" size="xl" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
