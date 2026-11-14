import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import { BRAND_NAME } from '@/lib/contacts';

export const metadata: Metadata = {
  title: 'Кошик',
  description: `Ваш кошик у магазині ${BRAND_NAME}.`,
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
