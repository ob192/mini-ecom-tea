import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { TruckIcon, ClockIcon, PackageIcon, CheckIcon } from '@/components/Icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Доставка та оплата',
  description:
    'Доставка чаю по всій Україні службою Нова Пошта від 80 грн, 1–3 робочі дні. Відправка в день замовлення.',
  alternates: { canonical: '/delivery' },
};

const steps = [
  {
    icon: TruckIcon,
    title: 'Нова Пошта',
    text: 'Доставляємо замовлення по всій Україні швидко та надійно. Вартість — від 80 грн.',
  },
  {
    icon: ClockIcon,
    title: 'Термін доставки',
    text: '1–3 робочі дні залежно від відділення отримання.',
  },
  {
    icon: PackageIcon,
    title: 'Відправка',
    text: 'У день замовлення або наступного робочого дня.',
  },
  {
    icon: CheckIcon,
    title: 'Відстеження',
    text: 'Після відправки надсилаємо номер ТТН для відстеження посилки.',
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Header title="Доставка та оплата" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-2.5">
          Доставка та оплата
        </h1>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed mb-6">
          Доставляємо замовлення по всій Україні швидко та надійно.
        </p>

        <div className="flex flex-col gap-2.5">
          {steps.map(({ icon: Icon, title, text }) => (
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

        <h2 className="font-display font-semibold text-[19px] text-ink mt-7 mb-2.5">Оплата</h2>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed">
          Оплата — при отриманні (накладений платіж) або за реквізитами. Спосіб оплати уточнюємо разом
          із менеджером під час підтвердження замовлення.
        </p>

        <Button asChild variant="pill" size="xl" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}