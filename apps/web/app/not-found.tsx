import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <span className="text-primary-subtle-foreground">
        <Leaf className="size-14" />
      </span>
      <h1 className="font-semibold text-2xl text-foreground">Сторінку не знайдено</h1>
      <p className="text-muted-foreground text-base max-w-[30ch]">
        Можливо, цей чай уже розпродано або адреса змінилася.
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">На головну</Link>
      </Button>
    </div>
  );
}
