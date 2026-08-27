'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { useSessao } from '@/hooks/use-sessao';
import { ErroApi } from '@/services/api/problem-details';
import type { EntradaAlteracaoSenha } from '@/types/api/autenticacao';

function mensagemAlteracaoSenha(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      SENHA_ATUAL_INCORRETA: 'A senha atual está incorreta.',
      SENHA_FORA_DA_POLITICA:
        'A nova senha não atende à política de segurança.',
      SENHA_NAO_ALTERADA: 'A nova senha deve ser diferente da senha atual.',
    };
    const mensagem = mensagens[error.problem.codigo ?? ''];
    if (mensagem) return mensagem;
  }
  return 'Não foi possível alterar a senha agora. Tente novamente.';
}

export function FormularioAlteracaoSenha({
  onSubmit,
}: {
  onSubmit: (input: EntradaAlteracaoSenha) => Promise<void>;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (enviando) return;
        const form = new FormData(event.currentTarget);
        const senhaAtual = String(form.get('senhaAtual') ?? '');
        const novaSenha = String(form.get('novaSenha') ?? '');
        const confirmacao = String(form.get('confirmacao') ?? '');
        if (novaSenha !== confirmacao) {
          setErro('As senhas informadas não coincidem.');
          return;
        }
        setErro(null);
        setEnviando(true);
        try {
          await onSubmit({ senhaAtual, novaSenha });
        } catch (error) {
          setErro(mensagemAlteracaoSenha(error));
        } finally {
          setEnviando(false);
        }
      }}
    >
      <CampoFormulario label="Senha atual" htmlFor="senha-atual-field">
        <Input
          id="senha-atual-field"
          name="senhaAtual"
          type="password"
          autoComplete="current-password"
          required
        />
      </CampoFormulario>
      <CampoFormulario label="Nova senha" htmlFor="nova-senha-field">
        <Input
          id="nova-senha-field"
          name="novaSenha"
          type="password"
          autoComplete="new-password"
          required
        />
      </CampoFormulario>
      <CampoFormulario
        label="Confirmar nova senha"
        htmlFor="confirmar-nova-senha-field"
      >
        <Input
          id="confirmar-nova-senha-field"
          name="confirmacao"
          type="password"
          autoComplete="new-password"
          required
        />
      </CampoFormulario>
      {erro ? (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      <Button type="submit" variant="campo" disabled={enviando}>
        {enviando ? 'Alterando…' : 'Alterar senha'}
      </Button>
    </form>
  );
}

export function TelaAlterarSenha() {
  const api = useAutenticacaoApi();
  const { executarAutenticado, signOut } = useSessao();
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Segurança da conta
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-green-dark uppercase">
        Alterar senha
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A alteração encerra todas as sessões, inclusive esta. Você precisará
        entrar novamente.
      </p>
      <FormularioAlteracaoSenha
        onSubmit={async (input) => {
          await executarAutenticado((accessToken) =>
            api.alterarSenha(accessToken, input),
          );
          await signOut();
          router.replace('/login');
        }}
      />
    </main>
  );
}
