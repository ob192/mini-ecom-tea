'use client';

import * as React from 'react';

import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QtyStepper } from '@/components/ui/qty-stepper';
import { Radio, RadioGroup } from '@/components/ui/radio-group';
import { WeightChip } from '@/components/ui/weight-chip';
import { PgBlock, PgSection } from '@/components/playground/Shell';

/*
  The primitives that need state to show what they are: the weight chips, the
  quantity stepper, the delivery radio group, the dialog and the accordion.
  Real copy and real tiers from the catalogue, not placeholders.
*/
const TIERS = [
  { weight: '25 г', price: '310 ₴' },
  { weight: '50 г', price: '560 ₴' },
  { weight: '100 г', price: '1 040 ₴' },
];

export function PlaygroundInteractive() {
  const [weight, setWeight] = React.useState(TIERS[0].weight);
  const [qty, setQty] = React.useState(1);

  return (
    <PgSection
      id="shop"
      title="Магазинні контроли"
      lead="Те, чим покупець справді користується: вибір ваги, кількість, спосіб доставки."
      className="flex flex-col gap-10"
    >
      <PgBlock
        title="Вибір ваги"
        note="Набір поводиться як радіогрупа: обрано завжди рівно один рівень, і це видно не лише кольором."
      >
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <WeightChip
              key={t.weight}
              weight={t.weight}
              price={t.price}
              selected={weight === t.weight}
              onClick={() => setWeight(t.weight)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((t) => (
            <WeightChip
              key={t.weight}
              compact
              weight={t.weight}
              selected={weight === t.weight}
              onClick={() => setWeight(t.weight)}
            />
          ))}
        </div>
      </PgBlock>

      <PgBlock title="Кількість">
        <QtyStepper value={qty} onDec={() => setQty((v) => v - 1)} onInc={() => setQty((v) => v + 1)} />
        <QtyStepper
          size="sm"
          value={qty}
          onDec={() => setQty((v) => v - 1)}
          onInc={() => setQty((v) => v + 1)}
        />
        <Button size="lg">Додати в кошик</Button>
      </PgBlock>

      <PgBlock title="Спосіб доставки" className="items-start">
        <fieldset className="min-w-72">
          <legend className="text-sm font-medium">Куди доставити</legend>
          <RadioGroup defaultValue="warehouse" name="pg-delivery" className="mt-2">
            <Radio value="warehouse" hint="Нова пошта, відділення або поштомат">
              У відділення
            </Radio>
            <Radio value="courier" hint="Курʼєр привезе на адресу">
              Курʼєром
            </Radio>
          </RadioGroup>
        </fieldset>
      </PgBlock>

      <PgBlock title="Акордеон" className="items-start">
        <div className="w-full max-w-md">
          <Accordion title="Приготування" defaultOpen>
            <p className="text-base text-muted-foreground text-pretty">
              5 г на 100 мл, вода 95 °C. Перший пролив — злити, далі 10–15 секунд, додаючи по пʼять
              секунд на кожен наступний.
            </p>
          </Accordion>
          <Accordion title="Доставка і оплата">
            <p className="text-base text-muted-foreground text-pretty">
              Новою поштою по Україні. Від 500 ₴ — безкоштовно, нижче — 100 ₴. Оплата при отриманні.
            </p>
          </Accordion>
        </div>
      </PgBlock>

      <PgBlock title="Діалог">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Обрати відділення</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Відділення Нової пошти</DialogTitle>
              <DialogDescription>
                Почніть вводити назву міста — ми підкажемо найближчі відділення.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost">Скасувати</Button>
              <Button>Обрати</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PgBlock>
    </PgSection>
  );
}
