import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/CheckoutForm';
import { BRAND_NAME } from '@/lib/contacts';

export const metadata: Metadata = {
  title: 'Оформлення замовлення',
  description: `Оформлення замовлення в магазині ${BRAND_NAME} — доставка по Україні.`,
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
