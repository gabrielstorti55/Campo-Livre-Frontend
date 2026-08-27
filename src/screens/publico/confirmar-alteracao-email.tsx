'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';

type Estado = 'processando' | 'sucesso' | 'erro';

function mensagemErro(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'TOKEN_EXPIRADO') return 'O link expirou.';
    if (error.problem.codigo === 'TOKEN_JA_UTILIZADO') {
      return 'Este link já foi utilizado.';
    }
    if (error.problem.codigo === 'EMAIL_INDISPONIVEL') {
      return 'O novo e-mail não está mais disponível.';
    }
  }
  return 'Não foi possível confirmar a alteração de e-mail.';
}

export function TelaConfirmarAlteracaoEmail() {
  const api = useAutenticacaoApi();
  const iniciou = useRef(false);
  const [estado, setEstado] = useState<Estado>('processando');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    const token =
      new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);
    if (!token) {
      queueMicrotask(() => {
        setErro('O link de alteração de e-mail é inválido.');
        setEstado('erro');
      });
      return;
    }
    void api.confirmarAlteracaoEmail(token).then(
      () => setEstado('sucesso'),
      (error: unknown) => {
        setErro(mensagemErro(error));
        setEstado('erro');
      },
    );
  }, [api]);

  return (
    <LayoutAutenticacao>
      {estado === 'processando' ? (
        <div role="status">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Confirmando novo e-mail…
          </h1>
        </div>
      ) : null}
      {estado === 'sucesso' ? (
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">
            E-mail alterado
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O novo endereço passa a ser usado nos próximos acessos.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Ir para o acesso
          </Link>
        </div>
      ) : null}
      {estado === 'erro' ? (
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Alteração não concluída
          </h1>
          <p role="alert" className="mt-3 text-sm text-destructive">
            {erro}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar para o acesso
          </Link>
        </div>
      ) : null}
    </LayoutAutenticacao>
  );
}
