import Link from 'next/link';
import { categories } from '@/lib/products';
import { Phone } from 'lucide-react';
import { InstagramMark, TelegramMark, TikTokMark } from '@/components/BrandMarks';
import { ContactLink } from './Analytics';
import { Logo } from './Logo';
import { BRAND_NAME, INSTAGRAM_URL, TIKTOK_URL, TELEGRAM_URL } from '@/lib/contacts';

/*
  Footer — the page's one dark block.

  `dark` on the element switches every semantic token inside it to its dark
  value, so the links, the hairlines and the logo need no `dark:` classes and no
  bespoke opacity ladder: `text-muted-foreground` is already 6.9:1 there. It was
  a slab of brand green, which the system no longer allows — the brand hue marks
  actions, not areas the size of a footer (C5, C7).

  The design drew a YouTube glyph too; only the channels in lib/contacts exist,
  so only those are rendered.
*/
function Column({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <nav aria-label={heading} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide">{heading}</h2>
      {children}
    </nav>
  );
}

const linkCls =
  'inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:min-h-0';

export function Footer() {
  return (
    <footer className="dark bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 pb-7 pt-14 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-8">
          <div className="flex max-w-xs flex-col gap-3.5">
            <Logo />
            <p className="text-sm text-muted-foreground text-pretty">
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

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {BRAND_NAME} · Усі права захищені
          </span>
          <div className="flex items-center gap-1">
            <ContactLink
              channel="instagram"
              location="footer"
              href={INSTAGRAM_URL}
              aria-label="Instagram"
              className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <InstagramMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="tiktok"
              location="footer"
              href={TIKTOK_URL}
              aria-label="TikTok"
              className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <TikTokMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="telegram"
              location="footer"
              href={TELEGRAM_URL}
              aria-label="Telegram"
              className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <TelegramMark className="size-5" />
            </ContactLink>
            <ContactLink
              channel="phone"
              location="footer"
              href="tel:+380986575800"
              aria-label="Телефон"
              className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Phone className="size-5" />
            </ContactLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
