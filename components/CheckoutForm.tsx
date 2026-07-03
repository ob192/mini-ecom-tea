'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useCart } from '@/context/CartContext';
import { getProduct } from '@/lib/products';
import { uah } from '@/lib/format';
import { checkoutSchema, type CheckoutValues } from '@/lib/checkout-schema';
import { Header } from '@/components/Header';
import { AlertIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ShippingSelector, type ShippingValue } from '@/components/ShippingSelector';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

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
            company: '',
        },
    });

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
                <Header title="Оформлення" back />
                <div className="animate-screenIn flex flex-col items-center justify-center text-center px-8 py-16 gap-2 min-h-[60vh]">
                    <h2 className="font-display text-[22px] text-ink">Кошик порожній</h2>
                    <p className="text-ink-soft text-[15px] max-w-[28ch]">
                        Додайте товари, щоб оформити замовлення.
                    </p>
                    <Button variant="pill" size="lg" className="mt-2" onClick={() => router.push('/')}>
                        До каталогу
                    </Button>
                </div>
            </>
        );
    }

    const onSubmit = async (values: CheckoutValues) => {
        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, items }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(data?.error || 'Не вдалося надіслати замовлення. Спробуйте ще раз.');
                return;
            }

            clear();
            const id = encodeURIComponent(data?.orderId ?? '');
            router.push(`/order/success${id ? `?id=${id}` : ''}`);
        } catch {
            toast.error("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
        }
    };

    // On invalid submit, focus the first bad field (RHF focuses automatically,
    // but we also surface a toast for the sticky-bar submit on mobile).
    const onInvalid = () => {
        toast.error('Перевірте виділені поля.');
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
                    <Card className="p-4 mb-[22px] lg:mb-0">
                        {items.map((it) => {
                            const p = getProduct(it.slug);
                            if (!p) return null;
                            return (
                                <div key={it.slug} className="flex justify-between gap-2.5 py-1.5 text-[14.5px]">
                  <span className="text-ink-soft">
                    <span className="font-display font-semibold text-amber-deep mr-1.5">
                      {it.qty}×
                    </span>
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
                    </Card>
                </div>

                {/* delivery form (left column on desktop) */}
                <div className="animate-screenIn px-[18px] pb-6 lg:px-0 lg:pt-0 lg:order-1">
                    <h2 className="font-display text-[13px] tracking-[0.1em] uppercase text-green-deep mb-3">
                        Дані для доставки
                    </h2>

                    <Form {...form}>
                        {/* No native onSubmit navigation quirks — the sticky button drives it. */}
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate>
                            {/* honeypot — hidden from users, bait for bots */}
                            <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
                                <label htmlFor="company">Компанія (не заповнюйте)</label>
                                <input
                                    id="company"
                                    type="text"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    {...form.register('company')}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="first"
                                render={({ field }) => (
                                    <FormItem className="mb-3.5">
                                        <FormLabel>
                                            Ім&apos;я <span className="text-amber-deep">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Олена" autoComplete="given-name" {...field} />
                                        </FormControl>
                                        <FormMessage className="[&_svg]:hidden">
                      <span className="flex items-center gap-1.5">
                        <AlertIcon width={14} height={14} />
                          {form.formState.errors.first?.message}
                      </span>
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last"
                                render={({ field }) => (
                                    <FormItem className="mb-3.5">
                                        <FormLabel>
                                            Прізвище <span className="text-amber-deep">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Коваленко" autoComplete="family-name" {...field} />
                                        </FormControl>
                                        <FormMessage className="[&_svg]:hidden">
                      <span className="flex items-center gap-1.5">
                        <AlertIcon width={14} height={14} />
                          {form.formState.errors.last?.message}
                      </span>
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="mb-3.5">
                                        <FormLabel>
                                            Телефон <span className="text-amber-deep">*</span>
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
                                        <FormMessage className="[&_svg]:hidden">
                      <span className="flex items-center gap-1.5">
                        <AlertIcon width={14} height={14} />
                          {form.formState.errors.phone?.message}
                      </span>
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />

                            {/* delivery method toggle */}
                            <div className="mb-3.5">
                <span className="font-display font-medium text-[13px] tracking-wide uppercase text-ink-soft">
                  Спосіб доставки
                </span>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('deliveryMethod', 'np_warehouse', { shouldValidate: true })}
                                        aria-pressed={deliveryMethod === 'np_warehouse'}
                                        className={`flex-1 rounded-full min-h-[44px] px-4 font-display font-medium text-[14px] transition ${
                                            deliveryMethod === 'np_warehouse'
                                                ? 'bg-green text-on-green'
                                                : 'bg-card text-ink-soft shadow-[inset_0_0_0_1.5px_var(--line)] hover:text-green'
                                        }`}
                                    >
                                        Відділення / поштомат
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('deliveryMethod', 'np_courier', { shouldValidate: true })}
                                        aria-pressed={deliveryMethod === 'np_courier'}
                                        className={`flex-1 rounded-full min-h-[44px] px-4 font-display font-medium text-[14px] transition ${
                                            deliveryMethod === 'np_courier'
                                                ? 'bg-green text-on-green'
                                                : 'bg-card text-ink-soft shadow-[inset_0_0_0_1.5px_var(--line)] hover:text-green'
                                        }`}
                                    >
                                        Кур&apos;єром
                                    </button>
                                </div>
                            </div>

                            {/* Nova Poshta city + warehouse picker */}
                            <div className="mb-3.5">
                                <ShippingSelector
                                    value={shippingValue}
                                    showWarehouse={deliveryMethod === 'np_warehouse'}
                                    onChange={handleShippingChange}
                                />
                            </div>

                            {/* courier-only street address */}
                            {deliveryMethod === 'np_courier' ? (
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="mb-3.5">
                                            <FormLabel>
                                                Адреса доставки <span className="text-amber-deep">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea autoComplete="street-address" placeholder="Вулиця, будинок, квартира" {...field} />
                                            </FormControl>
                                            <FormMessage className="[&_svg]:hidden">
                        <span className="flex items-center gap-1.5">
                          <AlertIcon width={14} height={14} />
                            {form.formState.errors.address?.message}
                        </span>
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                            ) : null}

                            <FormDescription className="mt-0.5">
                                Менеджер зателефонує для підтвердження. Оплата при отриманні або за реквізитами.
                            </FormDescription>

                            <div className="sticky-bar flex items-center gap-3.5 lg:mt-6 lg:pt-6 lg:border-t lg:border-line">
                                <div className="flex flex-col">
                                    <span className="text-[12px] text-ink-faint">До сплати</span>
                                    <span className="font-display font-semibold text-[20px] text-ink">
                    {uah(total)}
                  </span>
                                </div>
                                <Button
                                    type="submit"
                                    variant="pill"
                                    size="xl"
                                    disabled={submitting}
                                    className="flex-1 disabled:cursor-wait"
                                >
                                    {submitting ? 'Надсилаємо…' : 'Підтвердити замовлення'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
}