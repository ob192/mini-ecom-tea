'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckIcon, LeafIcon } from '@/components/Icons';

export function SuccessView() {
  const id = useSearchParams().get('id');

  return (
    <div className="animate-screenIn flex-1 px-[22px] pt-[70px] lg:pt-24 pb-7 flex flex-col items-center text-center min-h-[80vh] lg:max-w-[620px] lg:mx-auto">
      <div className="w-[92px] h-[92px] rounded-full bg-green text-on-green flex items-center justify-center mb-[18px] shadow-sh-2">
        <CheckIcon width={42} height={42} />
      </div>
      <h1 className="font-display font-semibold text-[27px] leading-tight text-ink max-w-[18ch]">
        Дякуємо!
        <br />
        Ваше замовлення прийнято
      </h1>
      <p className="mt-2.5 text-ink-soft text-[15px] max-w-[32ch]">
        {id ? (
          <>
            Замовлення <b className="text-ink">№ {id}</b> оформлено.{' '}
          </>
        ) : null}
        Наш менеджер зателефонує вам найближчим часом для підтвердження деталей і доставки.
      </p>

      <div className="bg-card rounded-lg shadow-sh-1 w-full p-4 mt-[22px] text-left text-[14px] text-ink-soft leading-relaxed">
        Оплата — при отриманні або за реквізитами. Якщо у вас є запитання, напишіть нам на{' '}
        <a href="mailto:hello@teache.ua" className="text-green underline">
          hello@teache.ua
        </a>{' '}
        або зателефонуйте{' '}
        <a href="tel:+380971234567" className="text-green underline">
          +38 (097) 123-45-67
        </a>
        .
      </div>

      <Link
        href="/"
        className="mt-7 w-full font-display font-medium text-[18px] rounded-full min-h-[52px] px-[22px] inline-flex items-center justify-center gap-2 bg-green text-on-green hover:bg-green-deep transition"
      >
        <LeafIcon width={18} height={18} /> Повернутись до каталогу
      </Link>
    </div>
  );
}
