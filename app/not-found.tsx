import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-8 gap-3">
      <span className="text-primary">
        <Leaf className="size-14" />
      </span>
      <h1 className="font-semibold text-[28px] text-foreground">Сторінку не знайдено</h1>
      <p className="text-muted-foreground text-base max-w-[30ch]">
        Можливо, цей чай уже розпродано або адреса змінилася.
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/">На головну</Link>
      </Button>
    </div>
  );
}
