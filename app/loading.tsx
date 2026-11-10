import { BRAND_NAME } from '@/lib/contacts';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
      <span className="font-semibold text-xl tracking-[0.14em] text-primary/60 animate-pulse">
        {BRAND_NAME}…
      </span>
    </div>
  );
}
