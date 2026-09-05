import Link from 'next/link';
import { categories } from '@/lib/products';
import { InstagramIcon, TelegramIcon, PhoneIcon } from './Icons';
import { ContactLink } from './Analytics';
import { Logo } from './Logo';
import { BRAND_NAME } from '@/lib/contacts';

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
      <h2 className="m-0 font-body text-[12px] font-bold uppercase tracking-[1.2px] text-on-green">
        {heading}
      </h2>
      {children}
    </nav>
  );
}

const linkCls = 'font-body text-small text-on-green/70 transition-colors hover:text-on-green';

export function Footer() {
  return (
    <footer className="bg-green-deep text-on-green">
      <div className="mx-auto max-w-content px-5 pb-7 pt-14 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-8">
          <div className="flex max-w-[320px] flex-col gap-3.5">
            <Logo tone="on-green" />
            <p className="m-0 font-body text-small leading-[1.6] text-on-green/70">
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

        <div className="mt-11 flex flex-wrap items-center justify-between gap-3 border-t border-on-green/15 pt-[22px]">
          <span className="font-body text-[12px] text-on-green/50">
            © {new Date().getFullYear()} {BRAND_NAME} · Усі права захищені
          </span>
          <div className="flex items-center gap-[18px] text-on-green/80">
            <ContactLink
              channel="instagram"
              location="footer"
              href="https://instagram.com/jintea.ua"
              aria-label="Instagram"
              className="transition-colors hover:text-on-green"
            >
              <InstagramIcon width={18} height={18} />
            </ContactLink>
            <ContactLink
              channel="telegram"
              location="footer"
              href="https://t.me/Jin_tea"
              aria-label="Telegram"
              className="transition-colors hover:text-on-green"
            >
              <TelegramIcon width={18} height={18} />
            </ContactLink>
            <ContactLink
              channel="phone"
              location="footer"
              href="tel:+380986575800"
              aria-label="Телефон"
              className="transition-colors hover:text-on-green"
            >
              <PhoneIcon width={18} height={18} />
            </ContactLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
