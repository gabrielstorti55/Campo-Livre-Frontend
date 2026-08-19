'use client';

import { useRouter } from 'next/navigation';

import {
  getContextHome,
  type PersonalContext,
  useSession,
} from '@/features/auth/session/session-context';
import { Button } from '@/shared/components/ui/button';

const contextLabels: Record<PersonalContext, string> = {
  atleta: 'Atleta',
  organizador: 'Organizador',
};

export function ContextSwitcher() {
  const router = useRouter();
  const { session, switchContext } = useSession();

  if (!session || session.capabilities.length < 2) return null;

  const nextContext: PersonalContext =
    session.activeContext === 'atleta' ? 'organizador' : 'atleta';

  return (
    <Button
      variant="campoOutline"
      className="w-full"
      onClick={() => {
        switchContext(nextContext);
        router.push(getContextHome(nextContext));
      }}
    >
      Trocar para contexto {contextLabels[nextContext]}
    </Button>
  );
}
