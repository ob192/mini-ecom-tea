import Link from 'next/link';
import { categories } from '@/lib/products';
import { LeafIcon, PhoneIcon, InstagramIcon, TelegramIcon } from './Icons';

export function Footer() {
  const linkCls = 'block text-[14px] leading-8 text-on-green/80 hover:text-on-green transition-colors';
  const headCls = 'font-display font-semibold text-[13px] tracking-[0.12em] uppercase text-amber mb-1.5';

  return (
    <footer className="bg-green text-on-green px-[18px] md:px-8 pt-7 lg:pt-12 pb-9 lg:pb-12">
      <div className="lg:max-w-[1040px] lg:mx-auto lg:grid lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-10">
        <div className="mb-[18px] lg:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex text-amber" aria-hidden>
              <LeafIcon width={22} height={22} />
            </span>
            <span className="font-display font-semibold text-[19px] tracking-[0.14em]">jintea.shop</span>
          </div>
          <p className="m-0 text-[13.5px] text-on-green/70 max-w-[30ch] leading-relaxed">
            Колекційний листовий чай прямих поставок. Обсмажуємо досвід, а не листя.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 lg:col-span-2 lg:grid-flow-col gap-x-3.5 gap-y-[18px] mb-[22px] lg:mb-0">
          <nav aria-label="Категорії">
            <div className={headCls}>Магазин</div>
            {categories.map((c) => (
              <Link key={c.slug} href={`/?cat=${c.slug}`} className={linkCls}>
                {c.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Інформація">
            <div className={headCls}>Інформація</div>
            <Link href="/about" className={linkCls}>Про нас</Link>
            <Link href="/delivery" className={linkCls}>Доставка й оплата</Link>
            <Link href="/brewing" className={linkCls}>Як заварювати</Link>
            <Link href="/contacts" className={linkCls}>Контакти</Link>
          </nav>
        </div>

        <div>
          <div className={`${headCls} hidden lg:block`}>Контакти</div>
          <address className="not-italic flex flex-col gap-[7px] text-[13.5px] text-on-green/80">
            <span className="flex items-center gap-2">
              <span className="text-amber"><PhoneIcon width={15} height={15} /></span>
              <a href="tel:+380986575800" className="hover:text-on-green">+38 (098) 657-58-00</a>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-amber"><InstagramIcon width={15} height={15} /></span>
              <a href="https://instagram.com/jintea.ua" target="_blank" rel="noreferrer" className="hover:text-on-green">jintea.ua</a>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-amber"><TelegramIcon width={15} height={15} /></span>
              <a href="https://t.me/Jin_tea" target="_blank" rel="noreferrer" className="hover:text-on-green">Jin_tea</a>
            </span>
          </address>
        </div>
      </div>

      <div className="lg:max-w-[1040px] lg:mx-auto mt-[22px] lg:mt-10 pt-4 border-t border-on-green/20 text-[12px] text-on-green/60 flex justify-between flex-wrap gap-1.5">
        <span>© {new Date().getFullYear()} jintea.shop</span>
        <span>Зроблено з любов&apos;ю в Україні</span>
      </div>
    </footer>
  );
}
