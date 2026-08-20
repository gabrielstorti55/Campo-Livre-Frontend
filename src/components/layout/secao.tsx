import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/classes';

export function Secao({
  title,
  children,
  className,
  id,
  role,
  labelledBy,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
  role?: 'tabpanel';
  labelledBy?: string;
}) {
  const titleId = useId();
  return (
    <section
      id={id}
      role={role}
      aria-labelledby={labelledBy ?? titleId}
      className={cn('space-y-4', className)}
    >
      <h2
        id={titleId}
        className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
