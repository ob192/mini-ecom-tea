import Link from 'next/link';
import { LeafIcon } from './Icons';

export function Hero() {
  return (
    <section className="relative min-h-[432px] md:min-h-[480px] lg:min-h-[540px] flex items-end overflow-hidden animate-screenIn">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(155deg, #3E5A41, #233726 70%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 13px)' }}
      />
      <div className="absolute -right-[34px] top-[38px] -rotate-12 lg:right-[4%] lg:top-1/2 lg:-translate-y-1/2" style={{ color: 'rgba(243,236,221,0.10)' }}>
        <LeafIcon className="w-[260px] h-[260px] lg:w-[420px] lg:h-[420px]" />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(20,28,20,0.78) 0%, rgba(20,28,20,0.30) 42%, rgba(20,28,20,0.05) 100%)',
        }}
      />
      <div className="relative z-[2] p-[26px_20px_24px] md:p-10 lg:px-16 lg:py-16 text-paper w-full">
        <div className="max-w-[34ch] lg:max-w-[48ch]">
          <p className="font-display font-medium uppercase tracking-[0.18em] text-[11px] lg:text-[13px] text-amber mb-[11px]">
            Прямі поставки · Юньнань · Тайвань
          </p>
          <h2 className="font-display font-semibold text-[36px] md:text-[44px] lg:text-[56px] leading-[1.02] tracking-[0.01em] text-paper m-0">
            Чай, який варто
            <br />
            заварювати повільно
          </h2>
          <p className="mt-[11px] lg:mt-4 mb-5 lg:mb-7 text-[15px] lg:text-[18px] leading-relaxed text-paper/85 max-w-[34ch] lg:max-w-[40ch]">
            Колекційне листя зі старих дерев. Невеликі партії, чесне походження.
          </p>
          <div className="flex gap-2.5">
            <Link
              href="#catalog"
              className="flex-auto md:flex-initial font-display font-medium text-[16px] lg:text-[17px] rounded-full min-h-[44px] lg:min-h-[52px] px-[22px] lg:px-8 inline-flex items-center justify-center gap-2 bg-amber text-[#2A1E08] hover:bg-amber-deep hover:text-white transition"
            >
              <LeafIcon width={18} height={18} /> Обрати чай
            </Link>
            <Link
              href="/?cat=puer"
              className="font-display font-medium text-[16px] lg:text-[17px] rounded-full min-h-[44px] lg:min-h-[52px] px-[22px] lg:px-8 inline-flex items-center justify-center text-paper transition bg-paper/10 backdrop-blur-sm shadow-[inset_0_0_0_1.5px_rgba(243,236,221,0.55)] hover:bg-paper/20"
            >
              Пуер
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
