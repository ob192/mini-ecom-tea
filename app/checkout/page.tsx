import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/CheckoutForm';

export const metadata: Metadata = {
  title: 'Оформлення замовлення',
  description: 'Оформлення замовлення в магазині jintea.shop — доставка по Україні.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
