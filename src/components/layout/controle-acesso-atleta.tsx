'use client';

import type { ReactNode } from 'react';

import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoAtleta({ children }: { children: ReactNode }) {
  const { session } = useSessao();
  const autorizado = !session?.capabilities.includes('prefeitura');
  return (
    <GuardaSessao
      autorizado={autorizado}
      mensagem="Validando acesso à área pessoal..."
    >
      {children}
    </GuardaSessao>
  );
}
