'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessao } from '@/hooks/use-sessao';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import { obterDestinoPosLogin } from '@/services/autenticacao/navegacao-sessao';

function mensagemLogin(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'CREDENCIAIS_INVALIDAS') {
      return 'E-mail ou senha inválidos.';
    }
    if (error.problem.codigo === 'EMAIL_NAO_CONFIRMADO') {
      return 'Confirme seu e-mail antes de entrar.';
    }
    if (error.problem.codigo === 'CONTA_INAPTA') {
      return 'Esta conta não está disponível para acesso.';
    }
    if (error.problem.status === 429) {
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    }
  }
  return 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.';
}

export function TelaLogin() {
  const router = useRouter();
  const { hydrated, status, signIn } = useSessao();
  const [erro, setErro] = useState<string | null>(null);
  const submitting = status === 'autenticando';

  return (
    <LayoutAutenticacao>
      <div className="flex h-full flex-col justify-center py-2">
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Bem-vindo de volta
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Entre no CampoLivre
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Acesse sua conta para realizar ações que dependem da sua identidade.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;
            setErro(null);
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get('email') ?? '');
            const senha = String(formData.get('senha') ?? '');

            try {
              const session = await signIn(email, senha);
              const returnTo = new URLSearchParams(window.location.search).get(
                'returnTo',
              );
              router.push(obterDestinoPosLogin(returnTo, session));
            } catch (error) {
              setErro(mensagemLogin(error));
            }
          }}
        >
          <CampoFormulario label="E-mail" htmlFor="e-mail-field">
            <Input
              id="e-mail-field"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              className="h-11"
            />
          </CampoFormulario>

          <div>
            <CampoFormulario label="Senha" htmlFor="senha-field">
              <Input
                id="senha-field"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                className="h-11"
              />
            </CampoFormulario>

            <div className="mt-1.5 text-right">
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-green-dark underline-offset-4 hover:underline sm:text-sm"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {erro ? (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          ) : null}

          <Button
            variant="campo"
            type="submit"
            disabled={!hydrated || submitting}
            className="group mt-2 h-11 w-full"
          >
            <span>{submitting ? 'Entrando…' : 'Entrar'}</span>
            {!submitting ? (
              <ArrowRight
                className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            ) : null}
          </Button>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Ainda não faz parte do CampoLivre?
          </p>

          <Link
            href="/cadastro"
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Criar minha conta
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </LayoutAutenticacao>
  );
}
