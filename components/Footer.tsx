import Link from 'next/link';
import { categories } from '@/lib/products';
import { Phone } from 'lucide-react';
import { InstagramMark, TelegramMark, TikTokMark } from '@/components/BrandMarks';
import { ContactLink } from './Analytics';
import { Logo } from './Logo';
import { BRAND_NAME, INSTAGRAM_URL, TIKTOK_URL, TELEGRAM_URL } from '@/lib/contacts';

/*
  Footer — the `Footer` frame of every screen in jintea.pen.

  A green-deep slab with the wordmark and a one-line description on the left,
  then link columns, then a hairline and the copyright / social row. Link text
  is `on-green` at 69% and lifts to full opacity on hover; the column headings
  are the uppercase 12/700 label style.

  The design draws a YouTube glyph as well; only the channels in lib/contacts
  actually exist, so only those are rendered.
*/
function Column({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <nav aria-label={heading} className="flex flex-col gap-3">
      <h2 className="m-0 text-xs font-bold uppercase text-primary-foreground">
        {heading}
      </h2>
      {children}
    </nav>
  );
}

const linkCls = 'text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground';

export function Footer() {
  return (
    <footer className="bg-primary-strong text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 pb-7 pt-14 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-8">
          <div className="flex max-w-[320px] flex-col gap-3.5">
            <Logo tone="on-green" />
            <p className="m-0 text-sm text-primary-foreground/70">
              Листовий китайський чай прямо з Юньнані. Розсилка та самовивіз по Україні.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:flex lg:gap-16">
            <Column heading="Каталог">
              {categories.map((c) => (
                <Link key={c.slug} href={`/catalog?cat=${c.slug}`} className={linkCls}>
                  {c.label}
                </Link>
              ))}
            </Column>

            <Column heading="Підтримка">
              <Link href="/delivery" className={linkCls}>Оплата і доставка</Link>
              <Link href="/returns" className={linkCls}>Обмін та повернення</Link>
              <Link href="/brewing" className={linkCls}>Як заварювати</Link>
              <Link href="/privacy" className={linkCls}>Угода користувача</Link>
            </Column>

            <Column heading="Про нас">
              <Link href="/about" className={linkCls}>Наша історія</Link>
              <Link href="/contacts" className={linkCls}>Контакти</Link>
              <ContactLink
                channel="phone"
                location="footer"
                href="tel:+380986575800"
                className={linkCls}
              >
                +38 (098) 657-58-00
              </ContactLink>
            </Column>
          </div>
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/15 pt-[22px]">
          <span className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {BRAND_NAME} · Усі права захищені
          </span>
          <div className="flex items-center gap-[18px] text-primary-foreground/80">
            <ContactLink
              channel="instagram"
              location="footer"
              href={INSTAGRAM_URL}
              aria-label="Instagram"
              className="transition-colors hover:text-primary-foreground"
            >
              <InstagramMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="tiktok"
              location="footer"
              href={TIKTOK_URL}
              aria-label="TikTok"
              className="transition-colors hover:text-primary-foreground"
            >
              <TikTokMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="telegram"
              location="footer"
              href={TELEGRAM_URL}
              aria-label="Telegram"
              className="transition-colors hover:text-primary-foreground"
            >
              <TelegramMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="phone"
              location="footer"
              href="tel:+380986575800"
              aria-label="Телефон"
              className="transition-colors hover:text-primary-foreground"
            >
              <Phone className="size-5" />
            </ContactLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
