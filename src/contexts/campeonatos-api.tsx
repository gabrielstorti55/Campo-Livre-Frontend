'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CampeonatosApi } from '@/services/campeonatos/campeonatos-api';

const ContextoCampeonatosApi = createContext<CampeonatosApi | null>(null);

export function ProvedorCampeonatosApi({
  api,
  children,
}: {
  api: CampeonatosApi;
  children: ReactNode;
}) {
  return (
    <ContextoCampeonatosApi.Provider value={api}>
      {children}
    </ContextoCampeonatosApi.Provider>
  );
}

export function useCampeonatosApi(): CampeonatosApi {
  const api = useContext(ContextoCampeonatosApi);
  if (!api)
    throw new Error('useCampeonatosApi deve ser usado dentro do provor.');
  return api;
}
