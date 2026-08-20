import type { ReactNode } from 'react';
import { cn } from '@/utils/classes';

export function CartaoEstatistica({
  label,
  value,
  hint,
  tone = 'green',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'green' | 'navy';
}) {
  return (
    <div
      className={cn(
        'border-t-2 bg-transparent pt-4',
        tone === 'navy' ? 'border-navy-mid/35' : 'border-green-mid/35',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-bold',
          tone === 'navy' ? 'text-navy-dark' : 'text-green-dark',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
