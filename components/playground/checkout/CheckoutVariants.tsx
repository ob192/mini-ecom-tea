'use client';

import * as React from 'react';
import { Check, MapPin, ShoppingBag, Truck } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Radio, RadioGroup } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';
import { uah } from '@/lib/format';

/*
  Three checkout field groups. This is where the mobile funnel dies, so each one
  is shown in the state that matters: with a failed submit on it.

  The fields are the real ones from lib/checkout-schema.ts — імʼя, прізвище,
  телефон, спосіб доставки, місто, відділення or адреса — with the real error
  wording. Nothing here submits: these are specimens, and the order route posts
  to the shop's Telegram chat.

  Kept in all three:

  - Every field goes through `Field`, which generates the ids and wires
    `aria-describedby` and `aria-invalid` itself, and whose error carries
    `role="alert"` so a message that appears after a failed submit is announced
    where it appears.
  - Inputs are 16px on phones. Under that, iOS Safari zooms the whole viewport
    on focus — on the one screen where that is most expensive.
  - The delivery method is a radio group, not two buttons with an active state.
  - The submit stays enabled while fields are invalid and shows the errors; it
    only disables itself while sending.
  - It rides in `.sticky-bar`, which lifts itself over the cookie notice.
*/

const SUMMARY = [
  ['Шу Пуер Цзінмай Цяому · 50 г', 440],
  ['Лунцзин · 25 г', 415],
] as const;
const SUBTOTAL = SUMMARY.reduce((n, [, p]) => n + p, 0);

function Summary({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl bg-card p-5 ${compact ? '' : 'sm:p-6'}`}>
      <h2 className="text-lg font-medium">Ваше замовлення</h2>
      <ul className="flex list-none flex-col gap-2">
        {SUMMARY.map(([name, price]) => (
          <li key={name} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 text-pretty">{name}</span>
            <span className="shrink-0 tabular-nums">{uah(price)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Доставка</span>
        <span className="tabular-nums">
          {SUBTOTAL >= FREE_DELIVERY_THRESHOLD ? 'безкоштовно' : uah(100)}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
        <span className="font-medium">Разом</span>
        <span className="text-2xl font-semibold tabular-nums">{uah(SUBTOTAL)}</span>
      </div>
    </div>
  );
}

/** The submit row, identical in all three so the comparison is about the fields. */
function Submit({ pending = false }: { pending?: boolean }) {
  return (
    <>
      <div className="sticky-bar mt-2">
        <Button type="submit" size="lg" className="w-full" pending={pending}>
          <ShoppingBag />
          Підтвердити замовлення
        </Button>
      </div>
      <p className="text-sm text-muted-foreground text-pretty">
        Натискаючи кнопку, ви погоджуєтесь із{' '}
        <a href="/privacy" className="underline underline-offset-4">
          угодою користувача
        </a>{' '}
        та{' '}
        <a href="/delivery" className="underline underline-offset-4">
          умовами доставки
        </a>
        .
      </p>
    </>
  );
}

/* ── 1 ───────────────────────────────────────────────────────────────────── */
/**
 * One column. Every field under the last, labels on top, no sections — the
 * shortest possible path from top to submit.
 */
export function CheckoutOneColumn() {
  const [method, setMethod] = React.useState('np_warehouse');

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
      <form className="flex max-w-lg flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-3xl font-semibold">Оформлення</h1>

        <Alert variant="error" title="Перевірте два поля">
          Телефон і відділення заповнені не повністю. Усе інше, що ви ввели, на місці.
        </Alert>

        <FieldGroup>
          <Field label="Імʼя">{(p) => <Input {...p} autoComplete="given-name" placeholder="Олена" />}</Field>
          <Field label="Прізвище">
            {(p) => <Input {...p} autoComplete="family-name" placeholder="Коваленко" />}
          </Field>
          <Field
            label="Телефон"
            hint="+380 і 9 цифр — передзвонимо, щоб підтвердити"
            error="Невірний номер телефону"
          >
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue="+38 (098) 657"
              />
            )}
          </Field>

          <fieldset>
            <legend className="text-sm font-medium">Спосіб доставки</legend>
            <RadioGroup value={method} onValueChange={setMethod} name="pg1-delivery" className="mt-2">
              <Radio value="np_warehouse" hint="Нова пошта: відділення або поштомат">
                У відділення
              </Radio>
              <Radio value="np_courier" hint="Курʼєр привезе на адресу">
                Курʼєром
              </Radio>
            </RadioGroup>
          </fieldset>

          <Field label="Місто">
            {(p) => <Input {...p} autoComplete="address-level2" defaultValue="Чернігів" />}
          </Field>
          {method === 'np_warehouse' ? (
            <Field label="Відділення" error="Оберіть відділення">
              {(p) => <Input {...p} placeholder="Почніть вводити номер або вулицю" />}
            </Field>
          ) : (
            <Field label="Адреса" hint="Вулиця, будинок, квартира">
              {(p) => <Textarea {...p} autoComplete="street-address" />}
            </Field>
          )}
        </FieldGroup>

        <Submit />
      </form>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <Summary />
      </div>
    </div>
  );
}

/* ── 2 ───────────────────────────────────────────────────────────────────── */
/**
 * Three numbered steps on one page. Nothing is hidden and nothing navigates —
 * the page still submits once — but the form stops being a wall of eleven
 * fields and becomes three short jobs.
 */
export function CheckoutSteps() {
  const [method, setMethod] = React.useState('np_warehouse');

  const Step = ({
    n,
    title,
    icon,
    children,
  }: {
    n: number;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <section className="flex flex-col gap-4 rounded-xl bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-3 text-lg font-medium">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground tabular-nums"
        >
          {n}
        </span>
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
      </h2>
      {children}
    </section>
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
      <form className="flex max-w-lg flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-3xl font-semibold">Оформлення</h1>

        <Step n={1} title="Хто отримує" icon={<Check className="size-5 text-muted-foreground" />}>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Імʼя">
                {(p) => <Input {...p} autoComplete="given-name" placeholder="Олена" />}
              </Field>
              <Field label="Прізвище">
                {(p) => <Input {...p} autoComplete="family-name" placeholder="Коваленко" />}
              </Field>
            </div>
            <Field
              label="Телефон"
              hint="+380 і 9 цифр — передзвонимо, щоб підтвердити"
              error="Невірний номер телефону"
            >
              {(p) => (
                <Input {...p} type="tel" inputMode="tel" autoComplete="tel" defaultValue="+38 (098) 657" />
              )}
            </Field>
          </FieldGroup>
        </Step>

        <Step n={2} title="Куди доставити" icon={<Truck className="size-5 text-muted-foreground" />}>
          <FieldGroup className="gap-4">
            <fieldset>
              <legend className="sr-only">Спосіб доставки</legend>
              <RadioGroup value={method} onValueChange={setMethod} name="pg2-delivery">
                <Radio value="np_warehouse" hint="Нова пошта: відділення або поштомат">
                  У відділення
                </Radio>
                <Radio value="np_courier" hint="Курʼєр привезе на адресу">
                  Курʼєром
                </Radio>
              </RadioGroup>
            </fieldset>
            <Field label="Місто">
              {(p) => <Input {...p} autoComplete="address-level2" defaultValue="Чернігів" />}
            </Field>
            {method === 'np_warehouse' ? (
              <Field label="Відділення" error="Оберіть відділення">
                {(p) => <Input {...p} placeholder="Почніть вводити номер або вулицю" />}
              </Field>
            ) : (
              <Field label="Адреса" hint="Вулиця, будинок, квартира">
                {(p) => <Textarea {...p} autoComplete="street-address" />}
              </Field>
            )}
          </FieldGroup>
        </Step>

        <Step n={3} title="Оплата" icon={<MapPin className="size-5 text-muted-foreground" />}>
          <p className="text-base text-pretty">
            Оплата при отриманні — готівкою або карткою у відділенні. Нічого вводити не треба.
          </p>
        </Step>

        <Submit />
      </form>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <Summary />
      </div>
    </div>
  );
}

/* ── 3 ───────────────────────────────────────────────────────────────────── */
/**
 * Summary first. On a phone the basket is the first thing on the screen, folded
 * to one line with the total, and the fields begin immediately under it. A
 * visitor who arrived from an ad sees what they are buying and what it costs
 * before being asked for anything.
 */
export function CheckoutSummaryFirst() {
  const [method, setMethod] = React.useState('np_warehouse');

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
      <div className="flex max-w-lg flex-col gap-6">
        <h1 className="text-3xl font-semibold">Оформлення</h1>

        {/* On a phone the basket folds to one line; from `lg` the panel on the
            right carries it instead and this disappears. */}
        <details className="rounded-xl bg-card lg:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2 text-base">
              <ShoppingBag className="size-5 text-muted-foreground" />
              2 товари
              <Badge variant="success">
                <Check /> Доставка безкоштовна
              </Badge>
            </span>
            <span className="text-xl font-semibold tabular-nums">{uah(SUBTOTAL)}</span>
          </summary>
          <div className="border-t border-border px-5 py-4">
            <ul className="flex list-none flex-col gap-2">
              {SUMMARY.map(([name, price]) => (
                <li key={name} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 text-pretty">{name}</span>
                  <span className="shrink-0 tabular-nums">{uah(price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <FieldGroup>
            <Field
              label="Телефон"
              hint="+380 і 9 цифр. Передзвонимо, щоб підтвердити — решту можна не заповнювати до дзвінка."
              error="Невірний номер телефону"
            >
              {(p) => (
                <Input
                  {...p}
                  inputSize="lg"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue="+38 (098) 657"
                />
              )}
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Імʼя">
                {(p) => <Input {...p} autoComplete="given-name" placeholder="Олена" />}
              </Field>
              <Field label="Прізвище">
                {(p) => <Input {...p} autoComplete="family-name" placeholder="Коваленко" />}
              </Field>
            </div>

            <fieldset>
              <legend className="text-sm font-medium">Спосіб доставки</legend>
              <RadioGroup value={method} onValueChange={setMethod} name="pg3-delivery" className="mt-2">
                <Radio value="np_warehouse" hint="Нова пошта: відділення або поштомат">
                  У відділення
                </Radio>
                <Radio value="np_courier" hint="Курʼєр привезе на адресу">
                  Курʼєром
                </Radio>
              </RadioGroup>
            </fieldset>

            <Field label="Місто">
              {(p) => <Input {...p} autoComplete="address-level2" defaultValue="Чернігів" />}
            </Field>
            {method === 'np_warehouse' ? (
              <Field label="Відділення" error="Оберіть відділення">
                {(p) => <Input {...p} placeholder="Почніть вводити номер або вулицю" />}
              </Field>
            ) : (
              <Field label="Адреса" hint="Вулиця, будинок, квартира">
                {(p) => <Textarea {...p} autoComplete="street-address" />}
              </Field>
            )}
          </FieldGroup>

          <Submit />
        </form>
      </div>

      <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
        <Summary />
      </div>
    </div>
  );
}
