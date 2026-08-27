'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CamposApi } from '@/services/campos/campos-api';

const ContextoCamposApi = createContext<CamposApi | null>(null);

export function ProvedorCamposApi({
  api,
  children,
}: {
  api: CamposApi;
  children: ReactNode;
}) {
  return (
    <ContextoCamposApi.Provider value={api}>
      {children}
    </ContextoCamposApi.Provider>
  );
}

export function useCamposApi(): CamposApi {
  const api = useContext(ContextoCamposApi);
  if (!api) throw new Error('useCamposApi deve ser usado dentro do provedor.');
  return api;
}
