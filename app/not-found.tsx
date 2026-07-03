import Link from 'next/link';
import { LeafIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-8 gap-3">
      <span className="text-green">
        <LeafIcon width={56} height={56} />
      </span>
      <h1 className="font-display font-semibold text-[28px] text-ink">Сторінку не знайдено</h1>
      <p className="text-ink-soft text-[15px] max-w-[30ch]">
        Можливо, цей чай уже розпродано або адреса змінилася.
      </p>
      <Button asChild variant="pill" size="lg" className="mt-2">
        <Link href="/">На головну</Link>
      </Button>
    </div>
  );
}
