'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckIcon, LeafIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

      <Card className="w-full p-4 mt-[22px] text-left text-[14px] text-ink-soft leading-relaxed">
        Оплата — при отриманні або за реквізитами. Якщо у вас є запитання, зателефонуйте{' '}
        <a href="tel:+380986575800" className="text-green underline">
          +38 (098) 657-58-00
        </a>{' '}
        або напишіть у{' '}
        <a href="https://t.me/Jin_tea" target="_blank" rel="noreferrer" className="text-green underline">
          Telegram
        </a>
        .
      </Card>

      <Button asChild variant="pill" size="xl" className="mt-7 w-full">
        <Link href="/">
          <LeafIcon width={18} height={18} /> Повернутись до каталогу
        </Link>
      </Button>
    </div>
  );
}
