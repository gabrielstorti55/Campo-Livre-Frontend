import type { ReactNode } from 'react';
import { cn } from '@/utils/classes';

export function RotuloGrupo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-display text-xs font-bold tracking-wide text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}
