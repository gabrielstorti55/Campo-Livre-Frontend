'use client';

import Link from 'next/link';

import { AcoesSegurancaConta } from '@/components/autenticacao/acoes-seguranca-conta';
import { GuardaSessao } from '@/components/autenticacao/guarda-sessao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessao } from '@/hooks/use-sessao';

function mascararDocumento(value: string, visibleEnd = 2) {
  const normalized = value.replace(/\s/g, '');
  if (normalized.length <= visibleEnd) return '•'.repeat(normalized.length);
  return `${'•'.repeat(normalized.length - visibleEnd)}${normalized.slice(-visibleEnd)}`;
}

export function TelaMinhaConta() {
  const { session } = useSessao();

  return (
    <GuardaSessao mensagem="Carregando os dados da sua conta...">
      {session ? (
        <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Área privada
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-green-dark uppercase">
            Minha conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Estes dados civis são privados e não fazem parte do seu perfil
            público.
          </p>

          <Card className="mt-7 rounded-md border-t-2 border-t-green-dark">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-green-dark">
                {session.minhaConta.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Nome de usuário
                  </dt>
                  <dd className="mt-1 text-sm">
                    @{session.minhaConta.nomeUsuario}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    E-mail
                  </dt>
                  <dd className="mt-1 text-sm">{session.minhaConta.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    CPF
                  </dt>
                  <dd className="mt-1 font-mono text-sm">
                    {mascararDocumento(session.minhaConta.cpf)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    RG
                  </dt>
                  <dd className="mt-1 font-mono text-sm">
                    {mascararDocumento(session.minhaConta.rg.numero)} ·{' '}
                    {session.minhaConta.rg.orgaoExpedidor}/
                    {session.minhaConta.rg.uf}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Data de nascimento
                  </dt>
                  <dd className="mt-1 text-sm">
                    {session.minhaConta.dataNascimento}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Estado da conta
                  </dt>
                  <dd className="mt-1 text-sm">{session.minhaConta.status}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <AcoesSegurancaConta />

          <Link
            href="/minha-area"
            className="mt-6 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar para minha área
          </Link>
        </main>
      ) : null}
    </GuardaSessao>
  );
}
