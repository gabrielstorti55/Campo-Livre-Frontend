'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSessao } from '@/hooks/use-sessao';

export function GuardaSessao({
  children,
  autorizado = true,
  destinoSemPermissao = '/minha-area',
  mensagem = 'Validando sua sessão...',
}: {
  children: ReactNode;
  autorizado?: boolean;
  destinoSemPermissao?: string;
  mensagem?: string;
}) {
  const router = useRouter();
  const { status, session, erroSessao } = useSessao();

  useEffect(() => {
    if (
      status === 'carregando' ||
      status === 'autenticando' ||
      status === 'indisponivel'
    )
      return;
    if (!session) {
      router.replace('/login');
      return;
    }
    if (!autorizado) router.replace(destinoSemPermissao);
  }, [autorizado, destinoSemPermissao, router, session, status]);

  if (
    status === 'carregando' ||
    status === 'autenticando' ||
    !session ||
    !autorizado
  ) {
    return (
      <p role="status">
        {status === 'indisponivel' && erroSessao ? erroSessao : mensagem}
      </p>
    );
  }

  return children;
}
