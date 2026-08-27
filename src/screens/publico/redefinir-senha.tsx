'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';

function mensagemRedefinicao(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'TOKEN_EXPIRADO') {
      return 'O link de recuperação expirou.';
    }
    if (error.problem.codigo === 'TOKEN_JA_UTILIZADO') {
      return 'Este link de recuperação já foi utilizado.';
    }
    if (error.problem.codigo === 'SENHA_FORA_DA_POLITICA') {
      return 'A nova senha não atende à política de segurança.';
    }
  }
  return 'Não foi possível redefinir a senha agora. Tente novamente.';
}

export function TelaRedefinirSenha() {
  const api = useAutenticacaoApi();
  const tokenRef = useRef('');
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    tokenRef.current = params.get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);
    setTokenValido(Boolean(tokenRef.current));
  }, []);

  if (concluido) {
    return (
      <LayoutAutenticacao>
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Acesso protegido
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Senha redefinida
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Todas as sessões anteriores foram encerradas. Entre novamente com a
            nova senha.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar para o acesso
          </Link>
        </div>
      </LayoutAutenticacao>
    );
  }

  return (
    <LayoutAutenticacao>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Recuperação de acesso
      </p>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Defina uma nova senha
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A alteração encerra todas as sessões da conta e exige um novo login.
      </p>

      {tokenValido === false ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          O link de recuperação é inválido.
        </p>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (enviando || !tokenRef.current) return;
            const form = new FormData(event.currentTarget);
            const novaSenha = String(form.get('novaSenha') ?? '');
            const confirmacao = String(form.get('confirmacao') ?? '');
            if (novaSenha !== confirmacao) {
              setErro('As senhas informadas não coincidem.');
              return;
            }

            setErro(null);
            setEnviando(true);
            try {
              await api.redefinirSenha({ token: tokenRef.current, novaSenha });
              tokenRef.current = '';
              setConcluido(true);
            } catch (error) {
              setErro(mensagemRedefinicao(error));
            } finally {
              setEnviando(false);
            }
          }}
        >
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
          <Button
            type="submit"
            variant="campo"
            disabled={enviando || tokenValido !== true}
            className="h-11 w-full"
          >
            {enviando ? 'Redefinindo…' : 'Redefinir senha'}
          </Button>
        </form>
      )}
    </LayoutAutenticacao>
  );
}
