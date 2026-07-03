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
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-8 gap-3">
      <h1 className="font-display font-semibold text-[26px] text-ink">Щось пішло не так</h1>
      <p className="text-ink-soft text-[15px] max-w-[30ch]">
        Сталася помилка. Спробуйте оновити сторінку.
      </p>
      <Button variant="pill" size="lg" className="mt-2" onClick={reset}>
        Спробувати ще раз
      </Button>
    </div>
  );
}
