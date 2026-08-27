'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import {
  obterModoAplicacao,
  type ModoAplicacao,
} from '@/config/modo-aplicacao';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TelaRecuperarSenha({
  modo = obterModoAplicacao(),
}: {
  modo?: ModoAplicacao;
}) {
  const api = useAutenticacaoApi();
  const [enviado, setEnviado] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  return (
    <LayoutAutenticacao>
      {enviado ? (
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" />
          <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Solicitação recebida
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Confira seu e-mail
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Se existir uma conta elegível para esse e-mail, as instruções de
            recuperação serão enviadas. Verifique também a caixa de spam.
          </p>
          {modo === 'prototipo' && emailEnviado ? (
            <Link
              href={`/redefinir-senha?token=${encodeURIComponent(
                `recuperacao-token-${encodeURIComponent(emailEnviado)}`,
              )}`}
              className="mt-6 block text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
            >
              Abrir recuperação simulada
            </Link>
          ) : null}
          <Link
            href="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar para o acesso
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Recuperação de acesso
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Esqueceu sua senha?
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Informe o e-mail usado no cadastro para receber as instruções de
            redefinição.
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (enviando) return;
              const form = new FormData(event.currentTarget);
              const email = String(form.get('email') ?? '').trim();
              setErro(null);
              setEnviando(true);
              try {
                await api.solicitarRecuperacao(email);
                setEmailEnviado(email.toLowerCase());
                setEnviado(true);
              } catch {
                setErro(
                  'Não foi possível solicitar a recuperação agora. Tente novamente.',
                );
              } finally {
                setEnviando(false);
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
                placeholder="voce@email.com"
                className="h-11"
              />
            </CampoFormulario>
            {erro ? (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            ) : null}
            <Button
              variant="campo"
              type="submit"
              disabled={enviando}
              className="h-11 w-full"
            >
              {enviando ? 'Enviando…' : 'Enviar instruções'}
            </Button>
          </form>
          <p className="mt-8 border-t border-border pt-6 text-sm">
            <Link
              href="/login"
              className="font-semibold text-green-dark underline-offset-4 hover:underline"
            >
              Voltar para o acesso
            </Link>
          </p>
        </>
      )}
    </LayoutAutenticacao>
  );
}
