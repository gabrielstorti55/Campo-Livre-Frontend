'use client';

import { Info } from 'lucide-react';

import { useModoAplicacao } from '@/contexts/modo-aplicacao';

export function AvisoDadosDemonstrativos({
  className = '',
}: {
  className?: string;
}) {
  const modo = useModoAplicacao();
  if (modo !== 'hibrido') return null;

  return (
    <aside
      role="note"
      className={`flex items-start gap-3 border-l-4 border-accent bg-accent/10 px-4 py-3 text-sm text-foreground ${className}`.trim()}
    >
      <Info
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 text-green-dark"
      />
      <p>
        <strong>Dados demonstrativos.</strong> Esta seção preserva a experiência
        completa do protótipo enquanto sua integração definitiva é concluída.
      </p>
    </aside>
  );
}
