import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import { InstagramMark, TelegramMark, TikTokMark } from '@/components/BrandMarks';
import { ContactLink } from '@/components/Analytics';
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  TIKTOK_HANDLE,
  TIKTOK_URL,
  TELEGRAM_HANDLE,
  TELEGRAM_URL,
} from '@/lib/contacts';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Контакти',
  description: `Зв’яжіться з ${BRAND_NAME} за телефоном, в Instagram, TikTok або Telegram.`,
  alternates: { canonical: '/contacts' },
};

const contacts = [
  {
    icon: Phone,
    label: 'Телефон',
    value: CONTACT_PHONE,
    href: CONTACT_PHONE_HREF,
    channel: 'phone',
  },
  {
    icon: InstagramMark,
    label: 'Instagram',
    value: INSTAGRAM_HANDLE,
    href: INSTAGRAM_URL,
    channel: 'instagram',
  },
  {
    icon: TikTokMark,
    label: 'TikTok',
    value: TIKTOK_HANDLE,
    href: TIKTOK_URL,
    channel: 'tiktok',
  },
  {
    icon: TelegramMark,
    label: 'Telegram',
    value: TELEGRAM_HANDLE,
    href: TELEGRAM_URL,
    channel: 'telegram',
  },
  {
    icon: Mail,
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
      <main className="flex-1 px-[18px] md:px-8 pt-6 pb-14 lg:max-w-[760px] lg:mx-auto">
        <h1 className="font-semibold text-[26px] text-foreground leading-tight mb-2.5">Контакти</h1>
        <p className="m-0 text-muted-foreground text-base leading-relaxed mb-6">
          Пишіть або телефонуйте — відповідаємо щодня й допоможемо обрати чай або посуд.
        </p>

        <div className="flex flex-col gap-2.5">
          {contacts.map(({ icon: Icon, label, value, href, channel }) => (
            <ContactLink
              key={label}
              channel={channel}
              location="contacts_page"
              href={href}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3.5 hover:bg-primary-subtle transition-colors"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-muted-foreground text-xs">{label}</div>
                <div className="font-semibold text-[15.5px] text-foreground">{value}</div>
              </div>
            </ContactLink>
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