'use client';

import type { ReactNode } from 'react';

import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoPrefeitura({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useSessao();
  const hasInstitutionalLink = Boolean(
    session &&
    (!session.prototipo ||
      session.links.institutionalOrganizationIds.includes('prefeitura-franca')),
  );

  return (
    <GuardaSessao
      autorizado={hasInstitutionalLink}
      mensagem="Validando vínculo institucional..."
    >
      {children}
    </GuardaSessao>
  );
}
