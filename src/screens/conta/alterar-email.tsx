'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  obterModoAplicacao,
  type ModoAplicacao,
} from '@/config/modo-aplicacao';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { useSessao } from '@/hooks/use-sessao';
import { ErroApi } from '@/services/api/problem-details';
import type { RespostaSolicitacaoAlteracaoEmail } from '@/types/api/autenticacao';

function mensagemAlteracaoEmail(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      EMAIL_INVALIDO: 'Informe um endereço de e-mail válido.',
      EMAIL_INDISPONIVEL: 'Este e-mail não está disponível.',
      EMAIL_NAO_ALTERADO: 'O novo e-mail deve ser diferente do atual.',
    };
    const mensagem = mensagens[error.problem.codigo ?? ''];
    if (mensagem) return mensagem;
  }
  return 'Não foi possível solicitar a alteração agora. Tente novamente.';
}

export function FormularioAlteracaoEmail({
  modo,
  onSubmit,
}: {
  modo: ModoAplicacao;
  onSubmit: (novoEmail: string) => Promise<RespostaSolicitacaoAlteracaoEmail>;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    response: RespostaSolicitacaoAlteracaoEmail;
    novoEmail: string;
  } | null>(null);

  if (resultado) {
    const token = `alteracao-email-token-${encodeURIComponent(
      resultado.novoEmail,
    )}`;
    return (
      <div className="mt-8" aria-live="polite">
        <h2 className="font-display text-2xl font-semibold text-green-dark">
          Confirmação enviada
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          O e-mail atual continua válido para login até a confirmação de{' '}
          <strong>{resultado.response.novoEmailMascarado}</strong>.
        </p>
        {modo === 'prototipo' ? (
          <Link
            href={`/confirmar-alteracao-email?token=${encodeURIComponent(token)}`}
            className="mt-6 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Abrir confirmação simulada
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (enviando) return;
        const form = new FormData(event.currentTarget);
        const novoEmail = String(form.get('novoEmail') ?? '')
          .trim()
          .toLowerCase();
        setErro(null);
        setEnviando(true);
        try {
          const response = await onSubmit(novoEmail);
          setResultado({ response, novoEmail });
        } catch (error) {
          setErro(mensagemAlteracaoEmail(error));
        } finally {
          setEnviando(false);
        }
      }}
    >
      <CampoFormulario label="Novo e-mail" htmlFor="novo-email-field">
        <Input
          id="novo-email-field"
          name="novoEmail"
          type="email"
          autoComplete="email"
          required
        />
      </CampoFormulario>
      {erro ? (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <Button type="submit" variant="campo" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar confirmação'}
      </Button>
    </form>
  );
}

export function TelaAlterarEmail({
  modo = obterModoAplicacao(),
}: {
  modo?: ModoAplicacao;
}) {
  const api = useAutenticacaoApi();
  const { executarAutenticado } = useSessao();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Segurança da conta
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-green-dark uppercase">
        Alterar e-mail
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        O novo endereço só substituirá o atual depois da confirmação enviada a
        ele.
      </p>
      <FormularioAlteracaoEmail
        modo={modo}
        onSubmit={(novoEmail) =>
          executarAutenticado((accessToken) =>
            api.solicitarAlteracaoEmail(accessToken, novoEmail),
          )
        }
      />
    </main>
  );
}
