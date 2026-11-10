'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="font-semibold text-2xl text-foreground">Щось пішло не так</h1>
      <p className="text-muted-foreground text-base max-w-[30ch]">
        Сталася помилка. Спробуйте оновити сторінку.
      </p>
      <Button size="lg" className="mt-2" onClick={reset}>
        Спробувати ще раз
      </Button>
    </div>
  );
}
