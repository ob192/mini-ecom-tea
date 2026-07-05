import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ThermometerIcon } from '@/components/Icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Як заварювати',
  description:
    'Три способи заварювання китайського чаю: Гун Фу Ча, метод настоювання та заварювання в термосі. Температура води для кожного виду чаю.',
  alternates: { canonical: '/brewing' },
};

const h2 = 'font-display font-semibold text-[19px] text-ink mt-8 mb-2.5';
const p = 'm-0 text-ink-soft text-[15px] leading-relaxed';
const ol = 'flex flex-col gap-2 mt-3 mb-1 pl-0 list-none';

const temps = [
  { tea: 'Зелені чаї', range: '70–80°C' },
  { tea: 'Білі чаї', range: '80–90°C' },
  { tea: 'Жовті чаї', range: '75–85°C' },
  { tea: 'Улуни', range: '85–95°C' },
  { tea: 'Червоні чаї', range: '90–95°C' },
  { tea: 'Шен пуер', range: '85–95°C' },
  { tea: 'Шу пуер', range: '95–100°C' },
];

function Steps({ items }: { items: string[] }) {
  return (
    <ol className={ol}>
      {items.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-green-tint text-green font-display font-semibold text-[12px] flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-ink-soft text-[15px] leading-relaxed">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export default function BrewingPage() {
  return (
    <>
      <Header title="Як заварювати" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-2.5">
          Як правильно заварювати китайський чай
        </h1>
        <p className={p}>
          Китайський чай можна заварювати по-різному — усе залежить від ваших уподобань, часу та
          бажаного результату. Один і той самий чай може розкриватися зовсім по-іншому залежно від
          способу приготування. Нижче — три найпопулярніші методи.
        </p>

        <h2 className={h2}>1. Чайна церемонія Гун Фу Ча</h2>
        <p className={p}>
          Гун Фу Ча (功夫茶) — традиційний китайський спосіб заварювання, який дозволяє максимально
          розкрити смак, аромат і характер чаю. Назва перекладається як «чай, приготований з
          майстерністю». Для цього способу використовують гайвань або невеликий чайник об&rsquo;ємом
          100–200 мл.
        </p>
        <Steps
          items={[
            'Насипте 5–8 г чаю на 100–150 мл води.',
            'Використовуйте воду потрібної температури залежно від виду чаю.',
            'Першу коротку протоку (5–10 секунд) зазвичай зливають, щоб «пробудити» чайне листя.',
            'Наступні проливи тривають від 10 до 30 секунд, поступово збільшуючи час.',
            'Якісний китайський чай витримує від 5 до 15 проливів, щоразу відкриваючи нові відтінки смаку.',
          ]}
        />
        <p className={`${p} mt-3`}>
          Такий спосіб ідеально підходить для улунів, пуерів, червоних, білих і багатьох зелених чаїв.
        </p>

        <h2 className={h2}>2. Заварювання методом настоювання</h2>
        <p className={p}>
          Це найпростіший і найзручніший спосіб для щоденного чаювання вдома чи в офісі.
        </p>
        <Steps
          items={[
            'Візьміть 2–4 г чаю на 250–300 мл води.',
            'Залийте водою відповідної температури.',
            'Настоюйте 2–5 хвилин залежно від сорту чаю та бажаної міцності.',
            'Після настоювання відокремте листя від напою або перелийте чай в інший посуд.',
          ]}
        />
        <p className={`${p} mt-3`}>
          Цей метод добре підходить для більшості видів китайського чаю та не потребує спеціального
          посуду.
        </p>

        <h2 className={h2}>3. Заварювання в термосі</h2>
        <p className={p}>
          Термос — чудовий варіант для подорожей, роботи, навчання або тривалих прогулянок. Деякі сорти
          китайського чаю прекрасно смакують навіть після кількох годин настоювання.
        </p>
        <Steps
          items={[
            'Насипте 2–5 г чаю на 500 мл гарячої води.',
            'Закрийте термос і залиште чай настоюватися.',
            'Напій можна починати пити вже через 15–20 хвилин або насолоджуватися ним протягом кількох годин.',
          ]}
        />
        <p className={`${p} mt-3`}>
          Для термоса найкраще підходять шу пуер, хей ча, червоні чаї та деякі витримані білі чаї. Вони
          залишаються м&rsquo;якими, насиченими та не втрачають смакових якостей навіть при тривалому
          настоюванні. Зелені чаї та ніжні улуни краще не залишати в термосі надовго, оскільки вони можуть
          стати занадто терпкими.
        </p>

        <h2 className={h2}>
          <span className="inline-flex items-center gap-2">
            <ThermometerIcon width={18} height={18} className="text-amber" />
            Температура води
          </span>
        </h2>
        <div className="bg-card rounded-lg shadow-sh-1 overflow-hidden mt-1">
          {temps.map((row, i) => (
            <div
              key={row.tea}
              className={`flex items-center justify-between px-4 py-3 text-[14.5px] ${
                i !== temps.length - 1 ? 'border-b border-line-soft' : ''
              }`}
            >
              <span className="text-ink">{row.tea}</span>
              <span className="font-display font-semibold text-green">{row.range}</span>
            </div>
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