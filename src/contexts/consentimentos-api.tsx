'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { ConsentimentosApi } from '@/services/consentimentos/consentimentos-api';

const ContextoConsentimentosApi = createContext<ConsentimentosApi | null>(null);

export function ProvedorConsentimentosApi({
  api,
  children,
}: {
  api: ConsentimentosApi | null;
  children: ReactNode;
}) {
  return (
    <ContextoConsentimentosApi.Provider value={api}>
      {children}
    </ContextoConsentimentosApi.Provider>
  );
}

export function useConsentimentosApi(): ConsentimentosApi {
  const api = useContext(ContextoConsentimentosApi);
  if (!api)
    throw new Error('useConsentimentosApi deve ser usado dentro do provedor.');
  return api;
}
