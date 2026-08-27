'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ModoAplicacao } from '@/config/modo-aplicacao';
import { obterModoAplicacao } from '@/config/modo-aplicacao';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import type { RespostaSolicitacaoReativacaoConta } from '@/types/api/autenticacao';

export function FormularioSolicitacaoReativacao({
  modo,
  onSubmit,
}: {
  modo: ModoAplicacao;
  onSubmit: (email: string) => Promise<RespostaSolicitacaoReativacaoConta>;
}) {
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  if (email) {
    const token = `reativacao-token-${encodeURIComponent(email)}`;
    return (
      <div className="mt-8" aria-live="polite">
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Verifique seu e-mail
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Se a conta puder ser reativada, enviaremos um link com as próximas
          instruções.
        </p>
        {modo === 'prototipo' ? (
          <Link
            href={`/confirmar-reativacao?token=${token}`}
            className="mt-6 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Abrir reativação simulada
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
        const emailNormalizado = String(form.get('email') ?? '')
          .trim()
          .toLowerCase();
        setErro(null);
        setEnviando(true);
        try {
          await onSubmit(emailNormalizado);
          setEmail(emailNormalizado);
        } catch {
          setErro('Não foi possível enviar o link agora. Tente novamente.');
        } finally {
          setEnviando(false);
        }
      }}
    >
      <CampoFormulario
        label="E-mail"
        htmlFor="solicitar-reativacao-email-field"
      >
        <Input
          id="solicitar-reativacao-email-field"
          name="email"
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
        {enviando ? 'Enviando…' : 'Enviar link'}
      </Button>
    </form>
  );
}

export function TelaSolicitarReativacao() {
  const api = useAutenticacaoApi();
  const modo = obterModoAplicacao();
  return (
    <LayoutAutenticacao>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Reativação por e-mail
      </p>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Solicitar link de reativação
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Use esta opção se preferir confirmar a reativação pelo endereço de
        e-mail da conta.
      </p>
      <FormularioSolicitacaoReativacao
        modo={modo}
        onSubmit={(email) => api.solicitarReativacaoConta(email)}
      />
    </LayoutAutenticacao>
  );
}
