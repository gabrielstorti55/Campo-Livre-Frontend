'use client';

import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();
  const { status, session, erroSessao } = useSessao();

  useEffect(() => {
    if (
      status === 'carregando' ||
      status === 'autenticando' ||
      status === 'indisponivel'
    )
      return;
    if (!session) {
      const returnTo = pathname.startsWith('/') ? pathname : '/minha-area';
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!autorizado) router.replace(destinoSemPermissao);
  }, [autorizado, destinoSemPermissao, pathname, router, session, status]);

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
