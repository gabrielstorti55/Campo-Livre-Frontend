import type { ReactNode } from 'react';
import { CartaoEstatistica } from '@/components/layout/cartao-estatistica';
import { cn } from '@/utils/classes';

export function GradeEstatisticas({
  items,
  tone = 'green',
  columns = 4,
  className,
}: {
  items: { label: string; value: ReactNode; hint?: string }[];
  tone?: 'green' | 'navy';
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <CartaoEstatistica
          key={item.label}
          label={item.label}
          value={item.value}
          tone={tone}
          {...(item.hint ? { hint: item.hint } : {})}
        />
      ))}
    </div>
  );
}
