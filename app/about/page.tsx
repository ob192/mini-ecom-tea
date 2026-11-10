import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { BRAND_NAME } from '@/lib/contacts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Про нас',
  description:
    `${BRAND_NAME} — чай, який ми п’ємо самі: улуни, шени, червоні та білі чаї, а також посуд для щоденного заварювання.`,
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
      <main className="flex-1 px-4 md:px-8 pt-6 pb-14 lg:max-w-3xl lg:mx-auto">
        <h1 className="font-semibold text-2xl text-foreground leading-tight mb-4">Про нас</h1>

        <div className="flex flex-col gap-3.5 text-muted-foreground text-base leading-relaxed">
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
            <div key={p.n} className="rounded-xl bg-card p-4">
              <div className="font-semibold text-sm text-foreground tracking-widest mb-1.5">
                {p.n}
              </div>
              <div className="font-semibold text-base text-foreground mb-1">{p.label}</div>
              <p className="m-0 text-muted-foreground text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-xl text-foreground mt-2 mb-2.5">
          Чи складно заварювати китайський чай?
        </h2>
        <div className="flex flex-col gap-3.5 text-muted-foreground text-base leading-relaxed">
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
          className="inline-flex items-center gap-1.5 mt-1 font-medium text-sm text-primary hover:text-primary transition-colors"
        >
          Детальніше про способи заварювання
          <ArrowRight className="size-4" />
        </Link>

        <Card className="p-4 mt-7 border-l-2 border-border-strong text-foreground text-base leading-relaxed">
          Ми не продаємо стиль життя і не розповідаємо про давні династії на кожній сторінці. Просто є
          чай, є посуд, є люди, які в цьому розбираються і можуть порадити.
        </Card>

        <Button asChild size="lg" className="mt-7 w-full">
          <Link href="/">До каталогу</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}