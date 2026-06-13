'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getProduct } from '@/lib/products';
import { uah, isValidUaPhone } from '@/lib/format';
import { Header } from '@/components/Header';
import { AlertIcon } from '@/components/Icons';
import type { CheckoutForm as FormShape } from '@/lib/types';

type FieldKey = keyof FormShape;

const validators: Record<FieldKey, (v: string) => string> = {
  first: (v) => (!v.trim() ? "Вкажіть ім'я" : v.trim().length < 2 ? "Закоротке ім'я" : ''),
  last: (v) => (!v.trim() ? 'Вкажіть прізвище' : ''),
  phone: (v) => {
    if (!v.trim()) return 'Вкажіть номер телефону';
    if (!isValidUaPhone(v)) return 'Невірний номер телефону';
    return '';
  },
  address: (v) =>
    !v.trim() ? 'Вкажіть адресу доставки' : v.trim().length < 6 ? 'Уточніть адресу (місто, відділення)' : '',
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, ready, subtotal, delivery, total, clear } = useCart();

  const [form, setForm] = useState<FormShape>({ first: '', last: '', phone: '', address: '' });
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Empty cart → bounce back (after hydration).
  if (ready && items.length === 0) {
    return (
      <>
        <Header title="Оформлення" back />
        <div className="animate-screenIn flex flex-col items-center justify-center text-center px-8 py-16 gap-2 min-h-[60vh]">
          <h2 className="font-display text-[22px] text-ink">Кошик порожній</h2>
          <p className="text-ink-soft text-[15px] max-w-[28ch]">
            Додайте товари, щоб оформити замовлення.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-2 font-display font-medium text-[16px] rounded-full min-h-[48px] px-6 bg-green text-on-green hover:bg-green-deep transition"
          >
            До каталогу
          </button>
        </div>
      </>
    );
  }

  const onField = (k: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validators[k](v) }));
  };

  const onBlur = (k: FieldKey) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validators[k](form[k]) }));
  };

  const validateAll = () => {
    const e: Partial<Record<FieldKey, string>> = {};
    (Object.keys(validators) as FieldKey[]).forEach((k) => {
      const msg = validators[k](form[k]);
      if (msg) e[k] = msg;
    });
    return e;
  };

  const submit = async () => {
    setServerError(null);
    const e = validateAll();
    setErrors(e);
    setTouched({ first: true, last: true, phone: true, address: true });
    if (Object.keys(e).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company, items }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data?.error || 'Не вдалося надіслати замовлення. Спробуйте ще раз.');
        setSubmitting(false);
        return;
      }

      clear();
      const id = encodeURIComponent(data?.orderId ?? '');
      router.push(`/order/success${id ? `?id=${id}` : ''}`);
    } catch {
      setServerError("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  const field = (
    k: FieldKey,
    label: string,
    placeholder: string,
    opts: { area?: boolean; type?: string; inputMode?: 'tel' | 'text' } = {},
  ) => {
    const err = touched[k] && errors[k];
    const cls = `font-body text-[16px] text-ink bg-card rounded min-h-[48px] px-3.5 py-2.5 w-full border-[1.5px] transition focus:outline-none ${
      err
        ? 'border-danger bg-danger-tint focus:shadow-[0_0_0_3px_rgba(176,73,47,0.14)]'
        : 'border-line focus:border-green-600 focus:shadow-[0_0_0_3px_rgba(46,70,49,0.12)]'
    }`;
    return (
      <div className="flex flex-col gap-1.5 mb-3.5">
        <label htmlFor={`f-${k}`} className="font-display font-medium text-[13px] tracking-wide uppercase text-ink-soft">
          {label} <span className="text-amber-deep">*</span>
        </label>
        {opts.area ? (
          <textarea
            id={`f-${k}`}
            className={`${cls} min-h-[76px] resize-none leading-snug`}
            placeholder={placeholder}
            value={form[k]}
            onChange={onField(k)}
            onBlur={onBlur(k)}
            aria-invalid={!!err}
            aria-describedby={err ? `e-${k}` : undefined}
          />
        ) : (
          <input
            id={`f-${k}`}
            className={cls}
            type={opts.type || 'text'}
            inputMode={opts.inputMode}
            autoComplete={
              k === 'first' ? 'given-name' : k === 'last' ? 'family-name' : k === 'phone' ? 'tel' : 'street-address'
            }
            placeholder={placeholder}
            value={form[k]}
            onChange={onField(k)}
            onBlur={onBlur(k)}
            aria-invalid={!!err}
            aria-describedby={err ? `e-${k}` : undefined}
          />
        )}
        {err ? (
          <span id={`e-${k}`} className="text-[12.5px] text-danger flex items-center gap-1.5">
            <AlertIcon /> {errors[k]}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <Header title="Оформлення" back />
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start lg:max-w-[1040px] lg:mx-auto lg:w-full lg:px-8 lg:py-6">
        {/* order summary (right column on desktop) */}
        <div className="animate-screenIn px-[18px] pt-2 lg:px-0 lg:pt-0 lg:order-2 lg:sticky lg:top-20">
          <h2 className="font-display text-[13px] tracking-[0.1em] uppercase text-green-deep mt-2 lg:mt-0 mb-2.5">
            Ваше замовлення
          </h2>
          <div className="bg-card rounded-lg shadow-sh-1 p-4 mb-[22px] lg:mb-0">
            {items.map((it) => {
              const p = getProduct(it.slug);
              if (!p) return null;
              return (
                <div key={it.slug} className="flex justify-between gap-2.5 py-1.5 text-[14.5px]">
                  <span className="text-ink-soft">
                    <span className="font-display font-semibold text-amber-deep mr-1.5">{it.qty}×</span>
                    {p.name}
                  </span>
                  <span className="font-display font-semibold text-ink whitespace-nowrap">
                    {uah(p.price * it.qty)}
                  </span>
                </div>
              );
            })}
            <hr className="divider my-2.5" />
            <div className="flex justify-between items-baseline text-[15px] text-ink-soft mb-1.5">
              <span>Доставка</span>
              <span className={delivery === 0 ? 'text-ok' : 'text-ink'}>
                {delivery === 0 ? 'Безкоштовно' : uah(delivery)}
              </span>
            </div>
            <div className="flex justify-between items-baseline font-display font-semibold text-[21px] text-ink">
              <span>Разом</span>
              <span>{uah(total)}</span>
            </div>
          </div>
        </div>

        {/* delivery form (left column on desktop) */}
        <div className="animate-screenIn px-[18px] pb-6 lg:px-0 lg:pt-0 lg:order-1">
          <h2 className="font-display text-[13px] tracking-[0.1em] uppercase text-green-deep mb-3">
            Дані для доставки
          </h2>

          {/* honeypot — hidden from users, bait for bots */}
          <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
            <label htmlFor="company">Компанія (не заповнюйте)</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {field('first', "Ім'я", 'Олена')}
          {field('last', 'Прізвище', 'Коваленко')}
          {field('phone', 'Телефон', '+38 (0__) ___-__-__', { type: 'tel', inputMode: 'tel' })}
          {field('address', 'Адреса доставки', 'Місто, відділення Нової Пошти або вул., буд., кв.', {
            area: true,
          })}

          <p className="text-[12.5px] text-ink-faint mt-0.5 leading-relaxed">
            Менеджер зателефонує для підтвердження. Оплата при отриманні або за реквізитами.
          </p>

          {serverError ? (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 text-[13.5px] text-danger bg-danger-tint rounded p-3"
            >
              <AlertIcon /> {serverError}
            </div>
          ) : null}

          <div className="sticky-bar flex items-center gap-3.5 lg:mt-6 lg:pt-6 lg:border-t lg:border-line">
            <div className="flex flex-col">
              <span className="text-[12px] text-ink-faint">До сплати</span>
              <span className="font-display font-semibold text-[20px] text-ink">{uah(total)}</span>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-1 font-display font-medium text-[18px] rounded-full min-h-[52px] px-[22px] inline-flex items-center justify-center gap-2 bg-green text-on-green hover:bg-green-deep active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting ? 'Надсилаємо…' : 'Підтвердити замовлення'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
