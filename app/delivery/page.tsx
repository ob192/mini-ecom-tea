import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Check, Clock, Package, Truck } from 'lucide-react';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Оплата і доставка',
  description:
    'Доставка чаю по всій Україні Новою Поштою — 100 грн, безкоштовно від 500 грн. Оплата накладеним платежем при отриманні. Доставка до 3 днів.',
  alternates: { canonical: '/delivery' },
};

// 100 / 500 mirror DELIVERY_FEE and FREE_DELIVERY_THRESHOLD in
// context/CartContext.tsx, app/api/order/route.ts and lib/merchant-feed.ts.
// Merchant Center compares the feed's g:shipping against what this page says,
// so the prose and the constants move together.
const delivery = [
  {
    icon: Truck,
    title: 'Відділення або поштомат Нової Пошти',
    text: 'Доставляємо у будь-яке відділення чи поштомат по всій Україні. Вартість доставки — 100 грн, безкоштовно при замовленні від 500 грн.',
  },
  {
    icon: Package,
    title: 'Адресна доставка кур’єром',
    text: 'Нова Пошта може привезти замовлення просто до дверей. Вартість така сама — 100 грн, безкоштовно від 500 грн.',
  },
  {
    icon: Clock,
    title: 'Обробка замовлення',
    text: 'Замовлення, оформлені до 18:00, обробляємо того ж дня. Оформлені після 18:00 — наступного робочого дня.',
  },
  {
    icon: Check,
    title: 'Термін і відстеження',
    text: 'Доставка в будь-яку точку України — впродовж 3 днів. Після відправки надсилаємо номер ТТН для відстеження посилки.',
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Header title="Оплата і доставка" back />
      <main className="flex-1 px-4 md:px-8 pt-6 pb-14 lg:max-w-3xl lg:mx-auto">
        <h1 className="font-semibold text-2xl text-foreground leading-tight mb-2.5">
          Оплата і доставка
        </h1>
        <p className="m-0 text-muted-foreground text-base leading-relaxed mb-6">
          Доставляємо замовлення по всій Україні Новою Поштою — швидко та надійно.
        </p>

        <h2 className="font-semibold text-xl text-foreground mb-2.5">Оплата</h2>
        <div className="rounded-xl bg-card p-4 mb-6">
          <p className="m-0 text-muted-foreground text-base leading-relaxed">
            Оплата — <strong className="font-semibold text-foreground">накладеним платежем Нової Пошти</strong>{' '}
            при отриманні замовлення, або за реквізитами. Спосіб оплати уточнюємо разом із менеджером
            під час підтвердження замовлення.
          </p>
        </div>

        <h2 className="font-semibold text-xl text-foreground mb-2.5">Доставка по Україні</h2>
        <div className="flex flex-col gap-2.5">
          {delivery.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl bg-card p-4 flex gap-3.5 items-start">
              <span className="size-10 shrink-0 rounded-full bg-background text-muted-foreground flex items-center justify-center">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-semibold text-base text-foreground mb-0.5">{title}</div>
                <p className="m-0 text-muted-foreground text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-xl text-foreground mt-7 mb-2.5">Повернення</h2>
        <p className="m-0 text-muted-foreground text-base leading-relaxed">
          Товар можна обміняти або повернути протягом 14 днів згідно із Законом України «Про захист
          прав споживачів». Умови та порядок —{' '}
          <Link href="/returns" className="text-primary underline underline-offset-2">
            Обмін та повернення
          </Link>
          .
        </p>

        <Button asChild size="lg" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
