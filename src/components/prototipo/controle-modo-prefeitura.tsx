'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { PaginaEstado } from '@/components/layout/pagina-estado';
import type { ModoAplicacao } from '@/config/modo-aplicacao';

export function ControleModoPrefeitura({
  modo,
  children,
}: {
  modo: ModoAplicacao;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (
    modo === 'prototipo' ||
    pathname === '/prefeitura/painel' ||
    pathname === '/prefeitura/campos/novo' ||
    /^\/prefeitura\/campos\/[^/]+$/.test(pathname) ||
    pathname === '/prefeitura/organizadores'
  ) {
    return children;
  }

  return (
    <PaginaEstado
      code="API"
      title="Funcionalidade ainda não integrada"
      description="Esta operação municipal ainda usa estado demonstrativo. O CampoLivre não exibe dados simulados no modo integrado."
    />
  );
}
