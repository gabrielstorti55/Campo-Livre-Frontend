'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoAtleta({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, hydrated } = useSessao();

  useEffect(() => {
    if (hydrated && !session) router.replace('/login');
  }, [hydrated, router, session]);

  if (!hydrated || !session) {
    return <p role="status">Validando acesso à área pessoal...</p>;
  }

  return children;
}
