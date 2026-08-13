import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { TruckIcon, ClockIcon, PackageIcon, CheckIcon } from '@/components/Icons';

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
    icon: TruckIcon,
    title: 'Відділення або поштомат Нової Пошти',
    text: 'Доставляємо у будь-яке відділення чи поштомат по всій Україні. Вартість доставки — 100 грн, безкоштовно при замовленні від 500 грн.',
  },
  {
    icon: PackageIcon,
    title: 'Адресна доставка кур’єром',
    text: 'Нова Пошта може привезти замовлення просто до дверей. Вартість така сама — 100 грн, безкоштовно від 500 грн.',
  },
  {
    icon: ClockIcon,
    title: 'Обробка замовлення',
    text: 'Замовлення, оформлені до 18:00, обробляємо того ж дня. Оформлені після 18:00 — наступного робочого дня.',
  },
  {
    icon: CheckIcon,
    title: 'Термін і відстеження',
    text: 'Доставка в будь-яку точку України — впродовж 3 днів. Після відправки надсилаємо номер ТТН для відстеження посилки.',
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Header title="Оплата і доставка" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-2.5">
          Оплата і доставка
        </h1>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed mb-6">
          Доставляємо замовлення по всій Україні Новою Поштою — швидко та надійно.
        </p>

        <h2 className="font-display font-semibold text-[19px] text-ink mb-2.5">Оплата</h2>
        <div className="bg-card rounded-lg shadow-sh-1 p-4 mb-6">
          <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
            Оплата — <strong className="font-semibold text-ink">накладеним платежем Нової Пошти</strong>{' '}
            при отриманні замовлення, або за реквізитами. Спосіб оплати уточнюємо разом із менеджером
            під час підтвердження замовлення.
          </p>
        </div>

        <h2 className="font-display font-semibold text-[19px] text-ink mb-2.5">Доставка по Україні</h2>
        <div className="flex flex-col gap-2.5">
          {delivery.map(({ icon: Icon, title, text }) => (
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

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">Повернення</h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Товар можна обміняти або повернути протягом 14 днів згідно із Законом України «Про захист
          прав споживачів». Умови та порядок —{' '}
          <Link href="/returns" className="text-green underline underline-offset-2">
            Обмін та повернення
          </Link>
          .
        </p>

        <Button asChild variant="pill" size="xl" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
