'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import type {
  EntradaReativacaoConta,
  RespostaReativacaoConta,
} from '@/types/api/autenticacao';

function mensagemReativacao(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      CREDENCIAIS_INVALIDAS: 'E-mail ou senha inválidos.',
      PRAZO_ENCERRADO: 'O prazo de reativação foi encerrado.',
      ELIMINACAO_INICIADA: 'A eliminação da conta já foi iniciada.',
      CONFIRMACAO_OBRIGATORIA: 'Confirme explicitamente a reativação.',
    };
    const mensagem = mensagens[error.problem.codigo ?? ''];
    if (mensagem) return mensagem;
  }
  return 'Não foi possível reativar a conta agora. Tente novamente.';
}

export function FormularioReativacaoConta({
  onSubmit,
}: {
  onSubmit: (input: EntradaReativacaoConta) => Promise<RespostaReativacaoConta>;
}) {
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (concluido) {
    return (
      <div className="mt-8" aria-live="polite">
        <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
        <h2 className="mt-5 font-display text-3xl font-semibold text-foreground">
          Conta reativada
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          A eliminação foi cancelada. A reativação não cria uma sessão
          automaticamente.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
        >
          Entrar novamente
        </Link>
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
        setErro(null);
        setEnviando(true);
        try {
          await onSubmit({
            email: String(form.get('email') ?? '')
              .trim()
              .toLowerCase(),
            senha: String(form.get('senha') ?? ''),
            confirmacao: true,
          });
          setConcluido(true);
        } catch (error) {
          setErro(mensagemReativacao(error));
        } finally {
          setEnviando(false);
        }
      }}
    >
      <CampoFormulario label="E-mail" htmlFor="reativacao-email-field">
        <Input
          id="reativacao-email-field"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </CampoFormulario>
      <CampoFormulario label="Senha" htmlFor="reativacao-senha-field">
        <Input
          id="reativacao-senha-field"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
        />
      </CampoFormulario>
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" name="confirmacao" required className="mt-1" />
        <span>
          Confirmo que desejo cancelar a eliminação e reativar minha conta
        </span>
      </label>
      {erro ? (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <Button type="submit" variant="campo" disabled={enviando}>
        {enviando ? 'Reativando…' : 'Reativar conta'}
      </Button>
    </form>
  );
}

export function TelaReativarConta() {
  const api = useAutenticacaoApi();
  return (
    <LayoutAutenticacao>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Ciclo da conta
      </p>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Reativar conta
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Esta operação está disponível somente durante o prazo de eliminação e
        exige a confirmação das credenciais.
      </p>
      <FormularioReativacaoConta
        onSubmit={(input) => api.reativarConta(input)}
      />
      <Link
        href="/solicitar-reativacao"
        className="mt-6 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
      >
        Prefiro receber um link por e-mail
      </Link>
    </LayoutAutenticacao>
  );
}
