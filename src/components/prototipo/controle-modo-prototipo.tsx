import type { ReactNode } from 'react';

import { PaginaEstado } from '@/components/layout/pagina-estado';
import type { ModoAplicacao } from '@/config/modo-aplicacao';

export function ControleModoPrototipo({
  modo,
  children,
}: {
  modo: ModoAplicacao;
  children: ReactNode;
}) {
  if (modo === 'prototipo') return children;

  return (
    <PaginaEstado
      code="API"
      title="Funcionalidade ainda não integrada"
      description="Esta área depende de contratos e endpoints de domínio que ainda não estão disponíveis. O CampoLivre não exibe dados simulados no modo integrado."
    />
  );
}
