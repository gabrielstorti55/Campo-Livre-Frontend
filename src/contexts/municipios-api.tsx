'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { MunicipiosApi } from '@/services/municipios/municipios-api';

const ContextoMunicipiosApi = createContext<MunicipiosApi | null>(null);

export function ProvedorMunicipiosApi({
  api,
  children,
}: {
  api: MunicipiosApi;
  children: ReactNode;
}) {
  return (
    <ContextoMunicipiosApi.Provider value={api}>
      {children}
    </ContextoMunicipiosApi.Provider>
  );
}

export function useMunicipiosApi(): MunicipiosApi {
  const api = useContext(ContextoMunicipiosApi);
  if (!api) {
    throw new Error('useMunicipiosApi deve ser usado dentro do provedor.');
  }
  return api;
}
