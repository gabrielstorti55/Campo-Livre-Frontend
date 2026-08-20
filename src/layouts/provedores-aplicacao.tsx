'use client';

import type { ReactNode } from 'react';

import { ProvedorSessao } from '@/stores/sessao';

export function ProvedoresAplicacao({ children }: { children: ReactNode }) {
  return <ProvedorSessao>{children}</ProvedorSessao>;
}
