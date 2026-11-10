'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Leaf } from 'lucide-react';
import { ContactLink } from '@/components/Analytics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SuccessView() {
  const id = useSearchParams().get('id');

  return (
    <div className="flex-1 px-[22px] pt-[70px] lg:pt-24 pb-7 flex flex-col items-center text-center min-h-[80vh] lg:max-w-[620px] lg:mx-auto">
      <div className="mb-[18px] flex h-[92px] w-[92px] items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-10" />
      </div>
      <h1 className="max-w-[18ch] text-3xl font-semibold uppercase text-foreground lg:text-3xl">
        Дякуємо!
        <br />
        Ваше замовлення прийнято
      </h1>
      <p className="mt-2.5 text-muted-foreground text-base max-w-[32ch]">
        {id ? (
          <>
            Замовлення <b className="text-foreground">№ {id}</b> оформлено.{' '}
          </>
        ) : null}
        Наш менеджер зателефонує вам найближчим часом для підтвердження деталей і доставки.
      </p>

      <Card className="w-full p-4 mt-[22px] text-left text-sm text-muted-foreground leading-relaxed">
        Оплата — при отриманні або за реквізитами. Якщо у вас є запитання, зателефонуйте{' '}
        <ContactLink channel="phone" location="order_success" href="tel:+380986575800" className="text-primary underline">
          +38 (098) 657-58-00
        </ContactLink>{' '}
        або напишіть у{' '}
        <ContactLink channel="telegram" location="order_success" href="https://t.me/Jin_tea" className="text-primary underline">
          Telegram
        </ContactLink>
        .
      </Card>

      <Button asChild size="lg" className="mt-7 w-full">
        <Link href="/">
          <Leaf className="size-5" /> Повернутись до каталогу
        </Link>
      </Button>
    </div>
  );
}
