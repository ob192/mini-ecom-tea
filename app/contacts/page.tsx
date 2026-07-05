import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { PhoneIcon, InstagramIcon, TelegramIcon } from '@/components/Icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Контакти',
  description: 'Зв’яжіться з jintea.shop за телефоном, в Instagram або Telegram.',
  alternates: { canonical: '/contacts' },
};

const contacts = [
  {
    icon: PhoneIcon,
    label: 'Телефон',
    value: '+38 (098) 657-58-00',
    href: 'tel:+380986575800',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: 'jintea.ua',
    href: 'https://instagram.com/jintea.ua',
  },
  {
    icon: TelegramIcon,
    label: 'Telegram',
    value: 'Jin_tea',
    href: 'https://t.me/Jin_tea',
  },
];

export default function ContactsPage() {
  return (
    <>
      <Header title="Контакти" back />
      <main className="animate-screenIn flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-display font-semibold text-[26px] text-ink leading-tight mb-2.5">Контакти</h1>
        <p className="m-0 text-ink-soft text-[15px] leading-relaxed mb-6">
          Пишіть або телефонуйте — відповідаємо щодня й допоможемо обрати чай або посуд.
        </p>

        <div className="flex flex-col gap-2.5">
          {contacts.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="bg-card rounded-lg shadow-sh-1 p-4 flex items-center gap-3.5 hover:bg-green-tint transition-colors"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-green-tint text-green flex items-center justify-center">
                <Icon width={19} height={19} />
              </span>
              <div>
                <div className="text-ink-faint text-[12.5px]">{label}</div>
                <div className="font-display font-semibold text-[15.5px] text-ink">{value}</div>
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