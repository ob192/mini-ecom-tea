import Link from 'next/link';
import { LeafIcon } from '@/components/Icons';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-8 gap-3">
      <span className="text-green"><LeafIcon width={56} height={56} /></span>
      <h1 className="font-display font-semibold text-[28px] text-ink">Сторінку не знайдено</h1>
      <p className="text-ink-soft text-[15px] max-w-[30ch]">
        Можливо, цей чай уже розпродано або адреса змінилася.
      </p>
      <Link
        href="/"
        className="mt-2 font-display font-medium text-[16px] rounded-full min-h-[48px] px-6 inline-flex items-center justify-center bg-green text-on-green hover:bg-green-deep transition"
      >
        На головну
      </Link>
    </div>
  );
}
