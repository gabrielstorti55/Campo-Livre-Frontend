'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useSessao } from '@/hooks/use-sessao';

export function ControleAcessoPrefeitura({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { session, hydrated } = useSessao();
  const hasInstitutionalLink =
    session?.links.institutionalOrganizationIds.includes('prefeitura-franca') ??
    false;

  useEffect(() => {
    if (!hydrated) return;
    if (!session) router.replace('/login');
    else if (!hasInstitutionalLink) router.replace('/minha-area');
  }, [hasInstitutionalLink, hydrated, router, session]);

  if (!hydrated || !session || !hasInstitutionalLink) return null;
  return children;
}
