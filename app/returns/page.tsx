import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Phone } from 'lucide-react';
import { TelegramMark } from '@/components/BrandMarks';
import {
  BRAND_NAME,
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
    `Умови обміну та повернення товару ${BRAND_NAME}: 14 днів згідно із Законом України «Про захист прав споживачів», порядок повернення коштів і контакти для звернення.`,
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
  { icon: Phone, label: 'Телефон', value: CONTACT_PHONE, href: CONTACT_PHONE_HREF },
  { icon: TelegramMark, label: 'Telegram', value: TELEGRAM_HANDLE, href: TELEGRAM_URL },
  { icon: Mail, label: 'Пошта', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
];

export default function ReturnsPage() {
  return (
    <>
      <Header title="Обмін та повернення" back />
      <main id="main" className="flex-1 px-4 md:px-8 pt-6 pb-14 lg:max-w-3xl lg:mx-auto">
        <h1 className="font-semibold text-2xl text-foreground leading-tight mb-6">
          Обмін та повернення
        </h1>

        <h2 className="font-semibold text-xl text-foreground mb-2.5">Політика повернення</h2>
        <p className="m-0 text-muted-foreground text-base leading-relaxed">
          Згідно із Законом України «Про захист прав споживачів» покупець має право обміняти товар на
          аналогічний або повернути протягом 14 днів, якщо куплений товар не підійшов за формою,
          габаритами, фасоном, кольором, розміром або з інших причин, і якщо збережено товарний
          вигляд, ярлики і розрахунковий документ, виданий продавцем разом із товаром. Виняток
          становлять товари, які не підлягають поверненню за Законом, їх перелік ви можете переглянути{' '}
          <a
            href={EXCEPTIONS_LAW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary-subtle-foreground"
          >
            за посиланням
          </a>
          .
        </p>

        <p className="m-0 mt-4 text-muted-foreground text-base leading-relaxed">
          Щоб повернути товар, будь ласка, переконайтеся, що:
        </p>
        <ul className="m-0 mt-2.5 pl-0 list-none flex flex-col gap-2">
          {checklist.map((c) => (
            <li key={c} className="flex gap-2.5 items-start">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <p className="m-0 text-muted-foreground text-base leading-relaxed">{c}</p>
            </li>
          ))}
        </ul>

        <p className="m-0 mt-4 text-muted-foreground text-base leading-relaxed">
          Оплата доставки повернення відбувається за рахунок покупця.
        </p>

        <div className="mt-3 rounded-xl bg-card p-4 flex gap-3.5 items-start">
          <span className="size-10 shrink-0 rounded-full bg-background text-muted-foreground flex items-center justify-center">
            <AlertCircle className="size-5" />
          </span>
          <p className="m-0 text-muted-foreground text-base leading-relaxed">
            Доставка браку здійснюється за наш рахунок.
          </p>
        </div>

        <p className="m-0 mt-4 text-muted-foreground text-base leading-relaxed">
          Якщо ви не забрали своє замовлення або відмовилися від нього на пошті, це також вважається
          поверненням. Доставка в обидві сторони оплачується покупцем.
        </p>

        <h2 className="font-semibold text-xl text-foreground mt-7 mb-2.5">
          Порядок повернення коштів
        </h2>
        <p className="m-0 text-muted-foreground text-base leading-relaxed">
          Повернути гроші або обміняти товар ми зможемо протягом 5 робочих днів з моменту отримання
          нами товару на склад.
        </p>

        <h2 className="font-semibold text-xl text-foreground mt-7 mb-2.5">
          Як відправити заяву на повернення?
        </h2>
        <p className="m-0 text-muted-foreground text-base leading-relaxed mb-3.5">
          Зв’язатися з нашим менеджером за номером телефону, в чаті Telegram, або відправити листа на
          електронну адресу. Контакти для зворотного зв’язку вказані нижче:
        </p>

        <div className="flex flex-col gap-2.5">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              className="rounded-xl bg-card p-4 flex items-center gap-3.5 hover:bg-foreground/5 transition-colors"
            >
              <span className="size-10 shrink-0 rounded-full bg-background text-muted-foreground flex items-center justify-center">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-muted-foreground text-xs">{label}</div>
                <div className="font-semibold text-base text-foreground break-all">
                  {value}
                </div>
              </div>
            </a>
          ))}
        </div>

        <Button asChild size="lg" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
