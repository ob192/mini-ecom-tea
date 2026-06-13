'use client';

import { useEffect } from 'react';

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
      <button
        type="button"
        onClick={reset}
        className="mt-2 font-display font-medium text-[16px] rounded-full min-h-[48px] px-6 bg-green text-on-green hover:bg-green-deep transition"
      >
        Спробувати ще раз
      </button>
    </div>
  );
}
