import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { PhoneIcon, InstagramIcon, TelegramIcon, MailIcon } from '@/components/Icons';
import { ContactLink } from '@/components/Analytics';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/lib/contacts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Контакти',
  description: `Зв’яжіться з ${BRAND_NAME} за телефоном, в Instagram або Telegram.`,
  alternates: { canonical: '/contacts' },
};

const contacts = [
  {
    icon: PhoneIcon,
    label: 'Телефон',
    value: CONTACT_PHONE,
    href: CONTACT_PHONE_HREF,
    channel: 'phone',
  },
  {
    icon: InstagramIcon,
    label: 'Instagram',
    value: INSTAGRAM_HANDLE,
    href: INSTAGRAM_URL,
    channel: 'instagram',
  },
  {
    icon: TelegramIcon,
    label: 'Telegram',
    value: TELEGRAM_HANDLE,
    href: TELEGRAM_URL,
    channel: 'telegram',
  },
  {
    icon: MailIcon,
    label: 'Пошта',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    channel: 'email',
  },
] as const;

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
          {contacts.map(({ icon: Icon, label, value, href, channel }) => (
            <ContactLink
              key={label}
              channel={channel}
              location="contacts_page"
              href={href}
              className="bg-card rounded-lg shadow-sh-1 p-4 flex items-center gap-3.5 hover:bg-green-tint transition-colors"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-green-tint text-green flex items-center justify-center">
                <Icon width={19} height={19} />
              </span>
              <div>
                <div className="text-ink-faint text-[12.5px]">{label}</div>
                <div className="font-display font-semibold text-[15.5px] text-ink">{value}</div>
              </div>
            </ContactLink>
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