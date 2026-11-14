'use client';

import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PgSection } from '@/components/playground/Shell';

/*
  `Field` takes a render prop, so that it can hand the control the `id`,
  `aria-describedby` and `aria-invalid` it generated with `useId` — and a
  function cannot cross the server/client boundary. So every use of it sits in a
  client component. That costs nothing in practice: a form is a client component
  already, and this is the specimen page.
*/
export function FieldSpecimens() {
  return (
    <PgSection
      id="inputs"
      title="Поля"
      lead="Кожне поле — через Field: підпис, контрол, підказка або помилка, звʼязані самим примітивом."
    >
      <FieldGroup className="max-w-md">
        <Field label="Імʼя та прізвище" hint="Як до вас звертатися">
          {(p) => <Input {...p} autoComplete="name" placeholder="Олена Ковальчук" />}
        </Field>
        <Field label="Телефон" hint="+380 і 9 цифр">
          {(p) => (
            <Input
              {...p}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+380 98 657 58 00"
            />
          )}
        </Field>
        <Field label="Телефон" error="Введіть номер повністю: +380 і 9 цифр" hint="+380 і 9 цифр">
          {(p) => <Input {...p} type="tel" defaultValue="+380 98" />}
        </Field>
        <Field label="Коментар до замовлення" optional>
          {(p) => <Textarea {...p} placeholder="Наприклад: подзвоніть після 18:00" />}
        </Field>
        <Field label="Поле, яке зараз не можна заповнити" hint="Спершу оберіть місто">
          {(p) => <Input {...p} disabled placeholder="Відділення Нової пошти" />}
        </Field>
      </FieldGroup>
    </PgSection>
  );
}

/** The one field the brand specimen carries, so the accent is judged beside an error. */
export function PhoneErrorField() {
  return (
    <Field label="Телефон" error="Введіть номер повністю: +380 і 9 цифр">
      {(p) => <Input {...p} type="tel" defaultValue="+380 98" readOnly />}
    </Field>
  );
}
