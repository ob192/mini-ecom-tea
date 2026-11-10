import { BRAND_NAME } from '@/lib/contacts';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <span className="font-semibold text-xl tracking-widest text-primary/60 animate-pulse">
        {BRAND_NAME}…
      </span>
    </div>
  );
}
