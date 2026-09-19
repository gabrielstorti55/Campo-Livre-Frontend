'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { PaginaEstado } from '@/components/layout/pagina-estado';
import type { ModoAplicacao } from '@/config/modo-aplicacao';

function rotaIntegrada(pathname: string): boolean {
  if (
    /^\/campeonatos\/[^/]+\/(artilharia|participantes)$/.test(pathname) ||
    /^\/campeonatos\/[^/]+$/.test(pathname)
  ) {
    return true;
  }
  if (
    pathname === '/' ||
    pathname === '/campeonatos' ||
    pathname === '/partidas' ||
    /^\/partidas\/[^/]+$/.test(pathname) ||
    /^\/convites-time\/[^/]+$/.test(pathname) ||
    pathname === '/times' ||
    pathname === '/campos'
  )
    return true;
  if (/^\/(times|campos)\/[^/]+$/.test(pathname)) {
    return pathname !== '/times/criar';
  }
  return pathname === '/atletas' || /^\/atletas\/[^/]+$/.test(pathname);
}

export function ControleModoExploracao({
  modo,
  children,
}: {
  modo: ModoAplicacao;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (modo === 'prototipo' || rotaIntegrada(pathname)) return children;

  return (
    <PaginaEstado
      code="API"
      title="Funcionalidade ainda não integrada"
      description="Esta área depende de contratos e endpoints de domínio que ainda não estão disponíveis. O CampoLivre não exibe dados simulados no modo integrado."
    />
  );
}
