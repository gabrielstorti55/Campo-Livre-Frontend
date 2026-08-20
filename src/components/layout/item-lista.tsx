'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { Iniciais } from '@/components/layout/iniciais';
import { cn } from '@/utils/classes';

/** Ícone dentro de um círculo tonal — usado como "avatar" alternativo. */
export function IconeCircular({
  icon: Icon,
  tone = 'green',
  className,
}: {
  icon: LucideIcon;
  tone?: 'green' | 'navy';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-md',
        tone === 'navy' ? 'bg-navy-dark/10' : 'bg-green-pale',
        className,
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5',
          tone === 'navy' ? 'text-navy-dark' : 'text-green-dark',
        )}
      />
    </span>
  );
}

/** Avatar de iniciais pronto para linhas de lista. */
export function AvatarItem({
  name,
  tone,
  className,
}: {
  name: string;
  tone?: 'green' | 'navy' | 'light';
  className?: string;
}) {
  return (
    <Iniciais
      name={name}
      {...(tone ? { tone } : {})}
      className={cn('h-11 w-11', className)}
    />
  );
}

export const IndicadorAvanco = () => (
  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
);

/** Linha de meta-informação com ícones opcionais. */
export function LinhaMetadados({
  items,
  className,
}: {
  items: { icon?: LucideIcon; label: ReactNode }[];
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-3 text-xs text-muted-foreground',
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.icon ? <item.icon className="h-3 w-3" /> : null}
          {item.label}
        </span>
      ))}
    </p>
  );
}

/**
 * Linha padrão de lista: [avatar?] título + subtítulo + slot à direita.
 * Envolva em <Link> na página quando a linha for navegável.
 */
export function ItemLista({
  avatar,
  title,
  subtitle,
  right,
  children,
  interactive,
  truncateSubtitle = true,
  className,
}: {
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  interactive?: boolean;
  truncateSubtitle?: boolean;
  className?: string;
}) {
  const body = (
    <div className="flex flex-wrap items-center gap-3">
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display font-semibold text-foreground">
          {title}
        </div>
        {subtitle ? (
          <div
            className={cn(
              'text-xs text-muted-foreground',
              truncateSubtitle && 'truncate',
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {right}
    </div>
  );

  return (
    <div
      className={cn(
        'border-b border-border/80 px-1 py-4',
        interactive &&
          'transition-colors hover:bg-muted/50 focus-within:bg-muted/50',
        children ? 'space-y-3' : undefined,
        className,
      )}
    >
      {body}
      {children}
    </div>
  );
}
