'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { TimesApi } from '@/services/times/times-api';

const ContextoTimesApi = createContext<TimesApi | null>(null);

export function ProvedorTimesApi({
  api,
  children,
}: {
  api: TimesApi;
  children: ReactNode;
}) {
  return (
    <ContextoTimesApi.Provider value={api}>
      {children}
    </ContextoTimesApi.Provider>
  );
}

export function useTimesApi(): TimesApi {
  const api = useContext(ContextoTimesApi);
  if (!api) throw new Error('useTimesApi deve ser usado dentro do provedor.');
  return api;
}
