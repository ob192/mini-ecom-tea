import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowIcon } from '@/components/Icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Про нас',
  description:
    'jintea.shop — чай, який ми п’ємо самі: улуни, шени, червоні та білі чаї, а також посуд для щоденного заварювання.',
  alternates: { canonical: '/about' },
};

const points = [
  {
    n: '01',
    label: 'Чай',
    text: 'Улуни, шени, червоні чаї та кілька білих, які особливо люблять постійні покупці.',
  },
  {
    n: '02',
    label: 'Посуд',
    text: 'Гайвані, піали, чабані. Нічого декоративного — усе для щоденної роботи з чаєм.',
  },
  {
    n: '03',
    label: 'Люди',
    text: 'Ми самі п’ємо те, що продаємо, і завжди підкажемо, з чого почати.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header title="Про нас" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-4">Про нас</h1>

        <div className="flex flex-col gap-3.5 text-ink-soft text-[15px] leading-relaxed">
          <p className="m-0">
            Ми почали з того, що самі не могли знайти нормальний чай у місті. Усе або занадто пафосне,
            або взагалі незрозуміло що. Тому зібрали те, що п&rsquo;ємо самі — улуни, шени, червоні чаї
            та кілька білих, які люблять постійні покупці.
          </p>
          <p className="m-0">
            До чаю — посуд. Гайвані, піали, чабані. Нічого декоративного, усе для роботи.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-7">
          {points.map((p) => (
            <div key={p.n} className="bg-card rounded-lg shadow-sh-1 p-4">
              <div className="font-display font-semibold text-[13px] text-amber tracking-[0.1em] mb-1.5">
                {p.n}
              </div>
              <div className="font-display font-semibold text-[15px] text-ink mb-1">{p.label}</div>
              <p className="m-0 text-ink-faint text-[13px] leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-semibold text-[19px] text-ink mt-2 mb-2.5">
          Чи складно заварювати китайський чай?
        </h2>
        <div className="flex flex-col gap-3.5 text-ink-soft text-[15px] leading-relaxed">
          <p className="m-0">
            Багато хто думає, що китайський чай — це складно. Що треба вчитися роками, запам&rsquo;ятовувати
            терміни, купувати спеціальний стіл і дивитися відео по дві години. Насправді ні. Береш гайвань,
            кидаєш листя, заливаєш воду — і все. Перші кілька разів буде не ідеально, але смачно. А далі
            самі відчуєте, що хочеться трохи більше уваги до процесу — і це вже відбувається само собою,
            без примусу.
          </p>
        </div>

        <Link
          href="/brewing"
          className="inline-flex items-center gap-1.5 mt-1 font-display font-medium text-[14px] text-green hover:text-green-600 transition-colors"
        >
          Детальніше про способи заварювання
          <ArrowIcon width={15} height={15} />
        </Link>

        <Card className="p-4 mt-7 border-l-[3px] border-amber text-ink text-[15px] leading-relaxed">
          Ми не продаємо стиль життя і не розповідаємо про давні династії на кожній сторінці. Просто є
          чай, є посуд, є люди, які в цьому розбираються і можуть порадити.
        </Card>

        <Button asChild variant="pill" size="xl" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}