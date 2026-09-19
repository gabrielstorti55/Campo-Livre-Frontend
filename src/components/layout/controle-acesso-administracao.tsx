'use client';

import type { ReactNode } from 'react';

import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoAdministracao({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useSessao();

  return (
    <GuardaSessao
      autorizado={session?.minhaConta.administrador === true}
      destinoSemPermissao="/minha-area"
      mensagem="Validando autoridade administrativa..."
    >
      {children}
    </GuardaSessao>
  );
}
