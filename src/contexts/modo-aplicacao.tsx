'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ModoAplicacao } from '@/config/modo-aplicacao';

const ContextoModoAplicacao = createContext<ModoAplicacao>('integrado');

export function ProvedorModoAplicacao({
  children,
  modo,
}: {
  children: ReactNode;
  modo: ModoAplicacao;
}) {
  return (
    <ContextoModoAplicacao.Provider value={modo}>
      {children}
    </ContextoModoAplicacao.Provider>
  );
}

export function useModoAplicacao(): ModoAplicacao {
  return useContext(ContextoModoAplicacao);
}
