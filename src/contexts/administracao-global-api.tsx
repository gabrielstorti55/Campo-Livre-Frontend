'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { AdministracaoGlobalApi } from '@/services/administracao-global/administracao-global-api';

const ContextoAdministracaoGlobalApi =
  createContext<AdministracaoGlobalApi | null>(null);

export function ProvedorAdministracaoGlobalApi({
  api,
  children,
}: {
  api: AdministracaoGlobalApi | null;
  children: ReactNode;
}) {
  return (
    <ContextoAdministracaoGlobalApi.Provider value={api}>
      {children}
    </ContextoAdministracaoGlobalApi.Provider>
  );
}

export function useAdministracaoGlobalApi(): AdministracaoGlobalApi {
  const api = useContext(ContextoAdministracaoGlobalApi);
  if (!api) {
    throw new Error('Administração Global indisponível neste modo.');
  }
  return api;
}
