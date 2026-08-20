'use client';

import { useRouter } from 'next/navigation';

import type { ContextoPessoal } from '@/types/sessao';
import { useSessao } from '@/hooks/use-sessao';
import { Button } from '@/components/ui/button';

const contextLabels: Record<ContextoPessoal, string> = {
  atleta: 'Atleta',
  organizador: 'Organizador',
};

const inicioPorContexto: Record<ContextoPessoal, string> = {
  atleta: '/atleta/inicio',
  organizador: '/organizador/inicio',
};

export function SeletorContexto() {
  const router = useRouter();
  const { session, switchContext } = useSessao();

  if (!session || session.capabilities.length < 2) return null;

  const nextContext: ContextoPessoal =
    session.activeContext === 'atleta' ? 'organizador' : 'atleta';

  return (
    <Button
      variant="campoOutline"
      className="w-full"
      onClick={() => {
        switchContext(nextContext);
        router.push(inicioPorContexto[nextContext]);
      }}
    >
      Trocar para contexto {contextLabels[nextContext]}
    </Button>
  );
}
