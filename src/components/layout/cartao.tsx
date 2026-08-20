import type { ReactNode } from 'react';
import { Card as UICard } from '@/components/ui/card';
import { cn } from '@/utils/classes';

export function Cartao({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <UICard
      className={cn(
        'rounded-md border-border/80 bg-white p-4 shadow-none',
        className,
      )}
    >
      {children}
    </UICard>
  );
}
