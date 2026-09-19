'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { GestaoCamposApi } from '@/services/campos/gestao-campos-api';

const ContextoGestaoCamposApi = createContext<GestaoCamposApi | null>(null);

export function ProvedorGestaoCamposApi({
  api,
  children,
}: {
  api: GestaoCamposApi | null;
  children: ReactNode;
}) {
  return (
    <ContextoGestaoCamposApi.Provider value={api}>
      {children}
    </ContextoGestaoCamposApi.Provider>
  );
}

export function useGestaoCamposApi(): GestaoCamposApi {
  const api = useContext(ContextoGestaoCamposApi);
  if (!api) throw new Error('Gestão de Campos indisponível neste modo.');
  return api;
}
