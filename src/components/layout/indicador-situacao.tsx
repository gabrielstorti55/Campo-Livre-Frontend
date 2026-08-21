'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/classes';

const styles: Record<string, string> = {
  'Em andamento': 'bg-green-pale text-green-dark',
  Confirmado: 'bg-green-pale text-green-dark',
  Aprovado: 'bg-green-pale text-success',
  Encerrado: 'bg-muted text-muted-foreground',
  Cancelado: 'bg-[oklch(0.94_0.04_25)] text-danger',
  'Fase Final': 'bg-[oklch(0.95_0.08_95)] text-[oklch(0.45_0.11_70)]',
  'Inscrições abertas': 'bg-[oklch(0.93_0.05_255)] text-[oklch(0.48_0.19_264)]',
  Pendente: 'bg-[oklch(0.95_0.08_95)] text-warning',
  Reprovado: 'bg-[oklch(0.94_0.04_25)] text-danger',
};

function formatarStatus(status: string) {
  if (!/^[A-Z_]+$/.test(status)) return status;

  const texto = status.replaceAll('_', ' ').toLocaleLowerCase('pt-BR');
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

export function IndicadorSituacao({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = formatarStatus(status);

  return (
    <Badge
      variant="secondary"
      className={cn(
        'shrink-0 rounded-full px-3 py-1 font-display text-xs font-semibold hover:bg-inherit',
        styles[label] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {label}
    </Badge>
  );
}
