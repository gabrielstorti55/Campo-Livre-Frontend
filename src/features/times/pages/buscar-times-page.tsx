'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';

const convitesIniciais = [
  {
    id: 1,
    time: 'Leões FC',
    capitao: 'Rafael Lima',
    validade: '26/08/2026',
  },
];

export function BuscarTimes() {
  const [convites, setConvites] = useState(convitesIniciais);
  const [decisao, setDecisao] = useState<string | null>(null);

  function decidir(id: number, resultado: 'aceito' | 'recusado') {
    const convite = convites.find((item) => item.id === id);
    if (!convite) return;
    setConvites((atuais) => atuais.filter((item) => item.id !== id));
    setDecisao(
      resultado === 'aceito'
        ? `Convite do ${convite.time} aceito.`
        : `Convite do ${convite.time} recusado.`,
    );
  }

  return (
    <>
      <PageHeader
        title="Convites para times"
        subtitle="A entrada em um time acontece por convite nominal enviado pelo capitão"
        actions={
          <Button variant="campoOutline" asChild>
            <Link href="/atleta/time/criar">Criar meu próprio time</Link>
          </Button>
        }
      />

      {decisao ? (
        <p
          className="mb-6 rounded-xl bg-green-pale px-4 py-3 text-sm font-semibold text-green-dark"
          role="status"
        >
          {decisao}
        </p>
      ) : null}

      <Section title="Convites recebidos">
        {convites.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Você não possui convites pendentes.
          </p>
        ) : (
          <div className="space-y-3">
            {convites.map((convite) => (
              <article
                key={convite.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <h2 className="font-display text-lg font-semibold">
                  {convite.time}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convite enviado por {convite.capitao} · válido até{' '}
                  {convite.validade}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="campo"
                    onClick={() => decidir(convite.id, 'aceito')}
                  >
                    Aceitar convite do {convite.time}
                  </Button>
                  <Button
                    variant="campoOutline"
                    tone="danger"
                    onClick={() => decidir(convite.id, 'recusado')}
                  >
                    Recusar convite do {convite.time}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>

      <p className="mt-8 text-sm text-muted-foreground">
        Para participar de outro time, peça ao capitão que localize sua conta e
        envie um convite.
      </p>
    </>
  );
}
