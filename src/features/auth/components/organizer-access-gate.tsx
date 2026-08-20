'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/session-context';

export function OrganizerAccessGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, hydrated } = useSession();
  const hasOrganizerCapability =
    session?.capabilities.includes('organizador') ?? false;

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!hasOrganizerCapability) router.replace('/minha-area');
  }, [hasOrganizerCapability, hydrated, router, session]);

  if (!hydrated || !session || !hasOrganizerCapability) {
    return <p role="status">Validando acesso ao painel do organizador...</p>;
  }

  return children;
}
