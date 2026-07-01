import { cn } from '@/lib/utils';

/**
 * App brand logo (public/clynic.png). Size it by height and let width auto-fit so the
 * landscape logo keeps its aspect ratio. Use everywhere the brand mark appears.
 */
export function Logo({ className, alt = 'Clynic' }) {
  return <img src="/clynic.png" alt={alt} className={cn('h-8 w-auto object-contain', className)} />;
}
