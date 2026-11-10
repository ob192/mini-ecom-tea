import { cn } from '@/lib/utils';

/** Skeleton — a placeholder shaped like the content it stands in for (S2). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-card motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
