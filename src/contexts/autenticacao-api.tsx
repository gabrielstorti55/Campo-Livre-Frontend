'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

const ContextoAutenticacaoApi = createContext<AutenticacaoApi | null>(null);

export function ProvedorAutenticacaoApi({
  api,
  children,
}: {
  api: AutenticacaoApi;
  children: ReactNode;
}) {
  return (
    <ContextoAutenticacaoApi.Provider value={api}>
      {children}
    </ContextoAutenticacaoApi.Provider>
  );
}

export function useAutenticacaoApi(): AutenticacaoApi {
  const api = useContext(ContextoAutenticacaoApi);
  if (!api) {
    throw new Error('useAutenticacaoApi deve ser usado dentro do provedor.');
  }
  return api;
}
