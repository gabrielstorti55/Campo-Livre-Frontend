'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { PrefeiturasApi } from '@/services/prefeituras/prefeituras-api';

const ContextoPrefeiturasApi = createContext<PrefeiturasApi | null>(null);

export function ProvedorPrefeiturasApi({
  api,
  children,
}: {
  api: PrefeiturasApi;
  children: ReactNode;
}) {
  return (
    <ContextoPrefeiturasApi.Provider value={api}>
      {children}
    </ContextoPrefeiturasApi.Provider>
  );
}

export function usePrefeiturasApi(): PrefeiturasApi {
  const api = useContext(ContextoPrefeiturasApi);
  if (!api)
    throw new Error('usePrefeiturasApi deve ser usado dentro do provedor.');
  return api;
}
