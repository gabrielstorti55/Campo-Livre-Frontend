'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { PaginaEstado } from '@/components/layout/pagina-estado';
import type { ModoAplicacao } from '@/config/modo-aplicacao';

function rotaOrganizadorIntegrada(pathname: string): boolean {
  if (
    pathname === '/organizador/inicio' ||
    pathname === '/organizador/campeonatos' ||
    pathname === '/organizador/perfil' ||
    pathname === '/organizador/novo'
  ) {
    return true;
  }

  return /^\/organizador\/campeonato\/[^/]+(?:\/(?:times|partidas|chaveamento))?$/.test(
    pathname,
  );
}

export function ControleModoOrganizador({
  modo,
  children,
}: {
  modo: ModoAplicacao;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (modo === 'prototipo' || rotaOrganizadorIntegrada(pathname))
    return children;

  return (
    <PaginaEstado
      code="API"
      title="Funcionalidade ainda não integrada"
      description="Esta operação ainda depende de uma porta de domínio publicada. O CampoLivre não exibe estado local como se fosse integração real."
    />
  );
}
