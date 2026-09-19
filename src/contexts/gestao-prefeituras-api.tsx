'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { GestaoPrefeiturasApi } from '@/services/prefeituras/gestao-prefeituras-api';

const ContextoGestaoPrefeiturasApi = createContext<GestaoPrefeiturasApi | null>(
  null,
);

export function ProvedorGestaoPrefeiturasApi({
  api,
  children,
}: {
  api: GestaoPrefeiturasApi | null;
  children: ReactNode;
}) {
  return (
    <ContextoGestaoPrefeiturasApi.Provider value={api}>
      {children}
    </ContextoGestaoPrefeiturasApi.Provider>
  );
}

export function useGestaoPrefeiturasApi(): GestaoPrefeiturasApi {
  const api = useContext(ContextoGestaoPrefeiturasApi);
  if (!api) {
    throw new Error('Gestão de Prefeituras indisponível neste modo.');
  }
  return api;
}
