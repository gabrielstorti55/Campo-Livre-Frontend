'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { ErroApi } from '@/services/api/problem-details';

type EstadoConfirmacao =
  | { tipo: 'processando' }
  | { tipo: 'sucesso'; aguardandoConsentimento: boolean }
  | { tipo: 'erro'; mensagem: string };

function mensagemConfirmacao(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'TOKEN_EXPIRADO') {
      return 'O link de confirmação expirou.';
    }
    if (error.problem.codigo === 'TOKEN_JA_UTILIZADO') {
      return 'Este link de confirmação já foi utilizado.';
    }
  }
  return 'Não foi possível confirmar o e-mail. Solicite um novo link.';
}

export function TelaConfirmarEmail() {
  const api = useAutenticacaoApi();
  const iniciou = useRef(false);
  const [estado, setEstado] = useState<EstadoConfirmacao>({
    tipo: 'processando',
  });

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);

    if (!token) {
      queueMicrotask(() =>
        setEstado({
          tipo: 'erro',
          mensagem: 'O link de confirmação é inválido.',
        }),
      );
      return;
    }

    void api.confirmarEmail(token).then(
      (response) =>
        setEstado({
          tipo: 'sucesso',
          aguardandoConsentimento: response.consentimentoResponsavelNecessario,
        }),
      (error: unknown) =>
        setEstado({ tipo: 'erro', mensagem: mensagemConfirmacao(error) }),
    );
  }, [api]);

  return (
    <LayoutAutenticacao>
      {estado.tipo === 'processando' ? (
        <div role="status" aria-live="polite">
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Confirmação de e-mail
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
            Validando seu link…
          </h1>
        </div>
      ) : null}

      {estado.tipo === 'sucesso' ? (
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Confirmação concluída
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            E-mail confirmado
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {estado.aguardandoConsentimento
              ? 'A conta ainda aguarda o consentimento do responsável.'
              : 'Sua conta está pronta para acessar o CampoLivre.'}
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Ir para o acesso
          </Link>
        </div>
      ) : null}

      {estado.tipo === 'erro' ? (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-destructive uppercase">
            Confirmação não concluída
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Link indisponível
          </h1>
          <p role="alert" className="mt-3 text-sm text-destructive">
            {estado.mensagem}
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
