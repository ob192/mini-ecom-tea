import Image from 'next/image';
import { LeafIcon } from './Icons';

/*
  To use a custom banner image:
  1. Put the file in /public (e.g. /public/hero.jpg).
  2. Set NEXT_PUBLIC_HERO_IMAGE=/hero.jpg in your .env.
  With no value set, the original green gradient banner is used.
*/
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || '';

export function Hero() {
    return (
        <section className="relative min-h-[360px] md:min-h-[460px] lg:min-h-[540px] flex items-end overflow-hidden animate-screenIn">
            {HERO_IMAGE ? (
                <>
                    <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to top, rgba(20,28,20,0.86) 0%, rgba(20,28,20,0.38) 46%, rgba(20,28,20,0.12) 100%)',
                        }}
                    />
                </>
            ) : (
                <>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(155deg, #3E5A41, #233726 70%)' }} />
                    <div
                        className="absolute inset-0"
                        style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 13px)' }}
                    />
                    <div
                        className="absolute -right-[34px] top-[38px] -rotate-12 lg:right-[4%] lg:top-1/2 lg:-translate-y-1/2"
                        style={{ color: 'rgba(243,236,221,0.10)' }}
                    >
                        <LeafIcon className="w-[260px] h-[260px] lg:w-[420px] lg:h-[420px]" />
                    </div>
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to top, rgba(20,28,20,0.78) 0%, rgba(20,28,20,0.30) 42%, rgba(20,28,20,0.05) 100%)',
                        }}
                    />
                </>
            )}

            <div className="relative z-[2] p-[26px_20px_26px] md:p-10 lg:px-16 lg:py-16 text-paper w-full">
                <div className="max-w-[34ch] lg:max-w-[48ch]">
                    <p className="font-display font-medium uppercase tracking-[0.18em] text-[11px] lg:text-[13px] text-amber mb-[11px]">
                        Прямі поставки · Юньнань · Тайвань
                    </p>
                    <h2 className="font-display font-semibold text-[34px] md:text-[44px] lg:text-[56px] leading-[1.02] tracking-[0.01em] text-paper m-0">
                        Чай, який варто
                        <br />
                        заварювати повільно
                    </h2>
                    <p className="mt-[11px] lg:mt-4 mb-0 text-[15px] lg:text-[18px] leading-relaxed text-paper/85 max-w-[34ch] lg:max-w-[40ch]">
                        Колекційне листя зі старих дерев. Невеликі партії, чесне походження.
                    </p>
                </div>
            </div>
        </section>
    );
}