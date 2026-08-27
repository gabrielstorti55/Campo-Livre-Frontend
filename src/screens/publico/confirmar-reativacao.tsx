'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';

type Estado = 'processando' | 'sucesso' | 'erro';

function mensagemConfirmacao(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      TOKEN_INVALIDO: 'O link de reativação é inválido.',
      TOKEN_EXPIRADO: 'O link de reativação expirou.',
      TOKEN_JA_UTILIZADO: 'Este link de reativação já foi utilizado.',
      PRAZO_ENCERRADO: 'O prazo de reativação foi encerrado.',
      ELIMINACAO_INICIADA: 'A eliminação da conta já foi iniciada.',
    };
    const mensagem = mensagens[error.problem.codigo ?? ''];
    if (mensagem) return mensagem;
  }
  return 'Não foi possível reativar a conta com este link.';
}

export function TelaConfirmarReativacao() {
  const api = useAutenticacaoApi();
  const iniciou = useRef(false);
  const [estado, setEstado] = useState<Estado>('processando');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);

    if (!token) {
      queueMicrotask(() => {
        setErro('O link de reativação é inválido.');
        setEstado('erro');
      });
      return;
    }

    void api.confirmarReativacaoConta(token).then(
      () => setEstado('sucesso'),
      (error: unknown) => {
        setErro(mensagemConfirmacao(error));
        setEstado('erro');
      },
    );
  }, [api]);

  return (
    <LayoutAutenticacao>
      {estado === 'processando' ? (
        <div role="status">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Validando reativação…
          </h1>
        </div>
      ) : null}
      {estado === 'sucesso' ? (
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          <h1 className="mt-5 font-display text-3xl font-semibold text-foreground">
            Conta reativada
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A eliminação foi cancelada. Entre novamente para criar uma nova
            sessão.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </div>
      ) : null}
      {estado === 'erro' ? (
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Reativação não concluída
          </h1>
          <p role="alert" className="mt-3 text-sm text-destructive">
            {erro}
          </p>
          <Link
            href="/solicitar-reativacao"
            className="mt-7 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Solicitar outro link
          </Link>
        </div>
      ) : null}
    </LayoutAutenticacao>
  );
}
