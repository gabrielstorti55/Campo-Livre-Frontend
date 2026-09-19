'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ControleModoPrototipo } from '@/components/prototipo/controle-modo-prototipo';
import type { ModoAplicacao } from '@/config/modo-aplicacao';

const rotasAtletaIntegradas = new Set([
  '/atleta/inicio',
  '/atleta/perfil',
  '/atleta/campeonatos',
  '/atleta/meus-eventos',
  '/atleta/time/buscar',
  '/atleta/time/criar',
]);

function rotaDeGestaoIntegrada(pathname: string): boolean {
  return (
    /^\/atleta\/time\/[^/]+$/.test(pathname) &&
    pathname !== '/atleta/time/criar'
  );
}

export function ControleModoAtleta({
  modo,
  children,
}: {
  modo: ModoAplicacao;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (rotasAtletaIntegradas.has(pathname) || rotaDeGestaoIntegrada(pathname))
    return children;

  return <ControleModoPrototipo modo={modo}>{children}</ControleModoPrototipo>;
}
