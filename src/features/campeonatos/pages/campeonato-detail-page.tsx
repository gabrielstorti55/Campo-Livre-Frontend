import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  ListaJogos,
  ResultadoRow,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { useSession } from '@/features/auth/session/session-context';
import { atletaLogado, campeonatos, partidas, times } from '@/mocks/data';
import { Section, Tabs } from '@/shared/components/campo-livre-ui';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function CampeonatoDetailPage() {
  const { id } = useParams();
  const { session } = useSession();
  const campeonato = campeonatos.find((item) => String(item.id) === String(id));
  const [tab, setTab] = useState('Visão geral');
  const highlightedTeam =
    session?.activeContext === 'atleta' ? atletaLogado.time : undefined;

  if (!campeonato) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <ResourceState
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto ou este campeonato pode não estar disponível publicamente."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PageHero
        eyebrow={`${campeonato.modalidade} · ${campeonato.cidade}`}
        title={campeonato.nome}
        description={`${campeonato.formato} · Rodada ${campeonato.rodada}`}
        action={<StatusBadge status={campeonato.status} />}
      />

      <div className="mb-7 overflow-hidden rounded-2xl border border-border/70 bg-card px-2 pt-1 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:px-4">
        <Tabs
          tabs={['Visão geral', 'Classificação', 'Partidas', 'Times']}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'Visão geral' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
            <Section title="Classificação">
              <TabelaClassificacao
                {...(highlightedTeam ? { destaque: highlightedTeam } : {})}
              />
            </Section>
          </section>

          <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
            <Section title="Últimos resultados">
              <div>
                {partidas
                  .filter((partida) => partida.concluida)
                  .map((partida) => (
                    <Link
                      key={partida.id}
                      to={`/partidas/${partida.id}`}
                      className={cn('block rounded-lg', cardFocus)}
                    >
                      <ResultadoRow
                        casa={partida.casa}
                        fora={partida.fora}
                        placar={`${partida.golsCasa} x ${partida.golsFora}`}
                        subtitle={`${partida.data} · ${partida.campo}`}
                      />
                    </Link>
                  ))}
              </div>
            </Section>
          </section>
        </div>
      ) : null}

      {tab === 'Classificação' ? (
        <div className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <TabelaClassificacao
            {...(highlightedTeam ? { destaque: highlightedTeam } : {})}
          />
        </div>
      ) : null}

      {tab === 'Partidas' ? (
        <div className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <ListaJogos />
        </div>
      ) : null}

      {tab === 'Times' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {times.map((time) => (
            <Link
              key={time.id}
              to={`/times/${time.id}`}
              className={cn(
                'group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_22px_rgba(30,54,43,0.05)] transition-[border-color,box-shadow] duration-150 hover:border-green-light hover:shadow-md',
                cardFocus,
              )}
            >
              <div>
                <p className="font-display font-semibold transition-colors duration-150 group-hover:text-green-dark">
                  {time.nome}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {time.cidade}
                </p>
              </div>
              <ArrowUpRight
                className="h-4 w-4 text-muted-foreground transition-colors duration-150 group-hover:text-green-dark"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
