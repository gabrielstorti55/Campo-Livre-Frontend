'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';

const convitesIniciais = [
  {
    id: 1,
    time: 'Leões FC',
    timeId: '2',
    recipientAccountId: 'mock-person-unlinked-1',
    capitao: 'Rafael Lima',
    validade: '26/08/2026',
  },
];

export function BuscarTimes() {
  const router = useRouter();
  const { session, linkTeam } = useSession();
  const [convites, setConvites] = useState(convitesIniciais);
  const [declinedInviteIds, setDeclinedInviteIds] = useState<number[]>(() => {
    if (typeof window === 'undefined' || !session) return [];
    const stored = sessionStorage.getItem(
      `campo-livre:declined-team-invites:${session.account.id}`,
    );
    return stored ? (JSON.parse(stored) as number[]) : [];
  });
  const [decisao, setDecisao] = useState<string | null>(null);
  const convitesVisiveis = convites.filter(
    (convite) =>
      convite.recipientAccountId === session?.account.id &&
      !declinedInviteIds.includes(convite.id) &&
      !session.links.teamIds.includes(convite.timeId),
  );

  function decidir(id: number, resultado: 'aceito' | 'recusado') {
    const convite = convites.find((item) => item.id === id);
    if (!convite) return;
    setConvites((atuais) => atuais.filter((item) => item.id !== id));
    setDecisao(
      resultado === 'aceito'
        ? `Convite do ${convite.time} aceito.`
        : `Convite do ${convite.time} recusado.`,
    );
    if (resultado === 'aceito') {
      linkTeam(convite.timeId);
      router.push('/atleta/inicio');
    } else if (session) {
      const nextDeclinedIds = [...declinedInviteIds, convite.id];
      setDeclinedInviteIds(nextDeclinedIds);
      sessionStorage.setItem(
        `campo-livre:declined-team-invites:${session.account.id}`,
        JSON.stringify(nextDeclinedIds),
      );
    }
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
        {convitesVisiveis.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Você não possui convites pendentes.
          </p>
        ) : (
          <div className="space-y-3">
            {convitesVisiveis.map((convite) => (
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
