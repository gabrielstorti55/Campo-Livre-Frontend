'use client';

import { useContext } from 'react';
import { ContextoSessao } from '@/stores/sessao';

export function useSessao() {
  const context = useContext(ContextoSessao);
  if (!context)
    throw new Error('useSessao deve ser usado dentro de ProvedorSessao');
  return context;
}
