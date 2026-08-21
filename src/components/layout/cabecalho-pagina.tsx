import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

export function CabecalhoPagina({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="pb-2">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-balance font-display text-3xl leading-none font-bold tracking-[0.01em] text-foreground uppercase sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <Separator className="mt-5 h-0.5 bg-green-dark/70" />
    </header>
  );
}
