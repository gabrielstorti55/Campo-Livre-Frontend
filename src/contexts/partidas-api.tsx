'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { PartidasApi } from '@/services/partidas/partidas-api';

const ContextoPartidasApi = createContext<PartidasApi | null>(null);

export function ProvedorPartidasApi({
  api,
  children,
}: {
  api: PartidasApi;
  children: ReactNode;
}) {
  return (
    <ContextoPartidasApi.Provider value={api}>
      {children}
    </ContextoPartidasApi.Provider>
  );
}

export function usePartidasApi(): PartidasApi {
  const api = useContext(ContextoPartidasApi);
  if (!api)
    throw new Error('usePartidasApi deve ser usado dentro do provedor.');
  return api;
}
