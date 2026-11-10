'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useCart } from '@/context/CartContext';
import { getProduct, priceFor } from '@/lib/products';
import { uah } from '@/lib/format';
import { trackAddShippingInfo, trackBeginCheckout, trackCheckoutError } from '@/lib/analytics';
import { checkoutSchema, type CheckoutValues } from '@/lib/checkout-schema';
import { Header } from '@/components/Header';
import { Banknote, Check, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Radio, RadioGroup } from '@/components/ui/radio-group';
import { ShippingSelector, type ShippingValue } from '@/components/ShippingSelector';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

/*
  One numbered step of the form («Три кроки», the owner's choice from
  /playground/checkout on 2026-11-10). Same page, same single submit — the form
  is not a wizard. What the steps buy is a sense of how much is left, and the
  discovery that step three is empty: «оплата при отриманні, вводити нічого не
  треба» is the biggest fear on a cash-on-delivery shop, and answering it costs
  one card.
*/
function Step({
    n,
    title,
    icon,
    children,
}: {
    n: number;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
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
}

export function CheckoutForm() {
    const router = useRouter();
    const { items, ready, delivery, total, clear } = useCart();

    const form = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
        mode: 'onBlur',
        defaultValues: {
            first: '',
            last: '',
            phone: '',
            deliveryMethod: 'np_warehouse',
            cityRef: '',
            cityName: '',
            warehouseRef: '',
            warehouse: '',
            address: '',
            botField: '',
        },
    });

    // GA4 `begin_checkout` — once, as soon as a non-empty cart reaches this screen.
    const checkoutTracked = useRef(false);
    useEffect(() => {
        if (!ready || checkoutTracked.current || items.length === 0) return;
        checkoutTracked.current = true;
        trackBeginCheckout(items);
    }, [ready, items]);

    const deliveryMethod = form.watch('deliveryMethod');

    const shippingValue: ShippingValue = {
        cityRef: form.watch('cityRef') ?? '',
        cityName: form.watch('cityName') ?? '',
        warehouseRef: form.watch('warehouseRef') ?? '',
        warehouse: form.watch('warehouse') ?? '',
    };

    const handleShippingChange = (patch: Partial<ShippingValue>) => {
        (Object.keys(patch) as (keyof ShippingValue)[]).forEach((key) => {
            form.setValue(key, patch[key] as string, { shouldValidate: true });
        });
    };

    const submitting = form.formState.isSubmitting;

    // Empty cart → bounce back (after hydration).
    if (ready && items.length === 0) {
        return (
            <>
                <Header title="Оформлення" back backHref="/cart" />
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-24 text-center">
                    <h1 className="text-2xl text-foreground">Кошик порожній</h1>
                    <p className="text-muted-foreground text-base max-w-[28ch]">
                        Додайте товари, щоб оформити замовлення.
                    </p>
                    <Button size="lg" className="mt-2" onClick={() => router.push('/')}>
                        До каталогу
                    </Button>
                </div>
            </>
        );
    }

    const onSubmit = async (values: CheckoutValues) => {
        // The delivery choice is only final once the form validates, so
        // add_shipping_info rides along with the submit.
        trackAddShippingInfo(
            items,
            values.deliveryMethod === 'np_courier' ? 'Нова Пошта — кур\'єр' : 'Нова Пошта — відділення',
        );

        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, items }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                trackCheckoutError(String(data?.error ?? `http_${res.status}`));
                toast.error(data?.error || 'Не вдалося надіслати замовлення. Спробуйте ще раз.');
                return;
            }

            clear();
            const id = encodeURIComponent(data?.orderId ?? '');
            router.push(`/order/success${id ? `?id=${id}` : ''}`);
        } catch {
            trackCheckoutError('network');
            toast.error("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
        }
    };

    // On invalid submit, focus the first bad field (RHF focuses automatically,
    // but we also surface a toast for the sticky-bar submit on mobile).
    // `errors` comes from the handler, not formState — the latter is a proxy
    // that only tracks the fields read during render.
    const onInvalid = (errors: FieldErrors<CheckoutValues>) => {
        trackCheckoutError('validation:' + Object.keys(errors).join(','));
        toast.error('Перевірте виділені поля.');
    };

    return (
        <>
            <Header title="Оформлення" back backHref="/cart" />
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:px-8">
                {/* order summary (right column on desktop) */}
                <div className="lg:order-2 lg:sticky lg:top-20">
                    <Card className="p-5 sm:p-6">
                        <h2 className="mb-3 text-lg font-medium">Ваше замовлення</h2>
                        {items.map((it) => {
                            const p = getProduct(it.slug);
                            if (!p) return null;
                            const unitPrice = priceFor(p, it.weight) ?? 0;
                            return (
                                <div
                                    key={`${it.slug}|${it.weight}`}
                                    className="flex justify-between gap-3 py-1.5 text-sm"
                                >
                                    <span className="min-w-0 text-pretty text-muted-foreground">
                                        <span className="mr-1.5 font-medium text-foreground tabular-nums">
                                            {it.qty}×
                                        </span>
                                        {p.title}
                                    </span>
                                    <span className="shrink-0 font-medium tabular-nums">
                                        {uah(unitPrice * it.qty)}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3 text-sm">
                            <span className="text-muted-foreground">Доставка</span>
                            <span className="tabular-nums">
                                {delivery === 0 ? 'безкоштовно' : uah(delivery)}
                            </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
                            <span className="font-medium">Разом</span>
                            <span className="text-2xl font-semibold tabular-nums">{uah(total)}</span>
                        </div>
                    </Card>
                </div>

                {/* delivery form (left column on desktop) */}
                <div className="lg:order-1">
                    <h1 className="mb-5 text-3xl font-semibold">Оформлення</h1>

                    <Form {...form}>
                        {/* No native onSubmit navigation quirks — the sticky button drives it. */}
                        <form
                            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                            noValidate
                            className="flex max-w-lg flex-col gap-4"
                        >
                            {/* Honeypot — hidden from users, bait for bots.
                                No label and a meaningless field name: browsers autofill
                                by name/label (company, organization, …) even with
                                autocomplete="off", which used to drop real orders. */}
                            <div aria-hidden className="sr-only">
                                <input
                                    id="bot-field"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    {...form.register('botField')}
                                />
                            </div>

                            <Step
                                n={1}
                                title="Хто отримує"
                                icon={<Check className="size-5 text-muted-foreground" />}
                            >
                            <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="first"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Ім&apos;я <span className="text-foreground">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Олена" autoComplete="given-name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Прізвище <span className="text-foreground">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Коваленко" autoComplete="family-name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            </div>

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Телефон <span className="text-foreground">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="tel"
                                                placeholder="+38 (0__) ___-__-__"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            </Step>

                            <Step
                                n={2}
                                title="Куди доставити"
                                icon={<Truck className="size-5 text-muted-foreground" />}
                            >
                            {/*
                              Two visible options are a radio group, not a pair of
                              buttons wearing `aria-pressed` (F9). Radix gives the
                              group one tab stop, arrow-key movement and
                              `aria-checked`, and the chosen row is marked by a
                              filled disc as well as by colour (C11).
                            */}
                            <fieldset>
                                <legend className="text-sm font-medium">Спосіб доставки</legend>
                                <RadioGroup
                                    className="mt-2"
                                    value={deliveryMethod}
                                    onValueChange={(v) =>
                                        form.setValue('deliveryMethod', v as CheckoutValues['deliveryMethod'], {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <Radio value="np_warehouse" hint="Нова пошта: відділення або поштомат">
                                        У відділення
                                    </Radio>
                                    <Radio value="np_courier" hint="Кур&apos;єр привезе на адресу">
                                        Кур&apos;єром
                                    </Radio>
                                </RadioGroup>
                            </fieldset>

                            {/* Nova Poshta city + warehouse picker */}
                            <ShippingSelector
                                value={shippingValue}
                                showWarehouse={deliveryMethod === 'np_warehouse'}
                                onChange={handleShippingChange}
                            />

                            {/* courier-only street address */}
                            {deliveryMethod === 'np_courier' ? (
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Адреса доставки <span className="text-foreground">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea autoComplete="street-address" placeholder="Вулиця, будинок, квартира" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : null}

                            </Step>

                            <Step
                                n={3}
                                title="Оплата"
                                icon={<Banknote className="size-5 text-muted-foreground" />}
                            >
                                <p className="text-base text-pretty">
                                    Оплата при отриманні — готівкою або карткою у відділенні. Вводити
                                    нічого не треба: менеджер зателефонує, щоб підтвердити замовлення.
                                </p>
                            </Step>

                            <div className="sticky-bar flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">До сплати</span>
                                    <span className="text-xl font-semibold tabular-nums">{uah(total)}</span>
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    pending={submitting}
                                    className="flex-1"
                                >
                                    Підтвердити замовлення
                                </Button>
                            </div>

                            {/* Merchant Center expects the delivery and return terms to be
                                reachable from checkout, not only from the footer. */}
                            <p className="text-sm text-muted-foreground text-pretty">
                                Підтверджуючи замовлення, ви погоджуєтесь з умовами{' '}
                                <Link href="/delivery" className="underline underline-offset-4 hover:text-primary-subtle-foreground">
                                    оплати і доставки
                                </Link>
                                ,{' '}
                                <Link href="/returns" className="underline underline-offset-4 hover:text-primary-subtle-foreground">
                                    обміну та повернення
                                </Link>{' '}
                                і{' '}
                                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary-subtle-foreground">
                                    Угодою користувача
                                </Link>
                                .
                            </p>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
}