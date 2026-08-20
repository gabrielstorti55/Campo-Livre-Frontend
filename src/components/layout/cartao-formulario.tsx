import type { ReactNode } from 'react';
import { Cartao } from '@/components/layout/cartao';
import { cn } from '@/utils/classes';

export function CartaoFormulario({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Cartao className={cn('max-w-2xl space-y-4', className)}>{children}</Cartao>
  );
}
