'use client';

import type { ReactNode } from 'react';

import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';

export function ControleAcessoAtleta({ children }: { children: ReactNode }) {
  return (
    <GuardaSessao mensagem="Validando acesso à área pessoal...">
      {children}
    </GuardaSessao>
  );
}
