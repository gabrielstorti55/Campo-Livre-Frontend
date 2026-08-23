'use client';

import type { ReactNode } from 'react';

import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoOrganizador({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useSessao();
  const hasOrganizerCapability =
    session?.minhaConta.organizadorHabilitado ?? false;

  return (
    <GuardaSessao
      autorizado={hasOrganizerCapability}
      mensagem="Validando acesso ao painel do organizador..."
    >
      {children}
    </GuardaSessao>
  );
}
