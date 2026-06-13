import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SuccessView } from '@/components/SuccessView';

export const metadata: Metadata = {
  title: 'Замовлення прийнято',
  description: 'Дякуємо за замовлення в TEA CHE.',
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-center text-ink-faint">Завантаження…</div>}>
      <SuccessView />
    </Suspense>
  );
}
