import { ArrowUpRight, MapPin, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CampeonatoMeta } from '@/features/campeonatos/components/campeonato-meta';
import {
  ListaJogos,
  ResultadoRow,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { PublicPageHeader } from '@/features/public/components/public-page-header';
import { PublicState } from '@/features/public/components/public-state';
import { campeonatos, partidas, times } from '@/mocks/data';
import { SearchBar, Section, Tabs } from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function PublicCampeonatosPage() {
  const [busca, setBusca] = useState('');
  const lista = campeonatos.filter((campeonato) =>
    campeonato.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
        eyebrow="Competições públicas"
        title="Campeonatos"
        description="Acompanhe competições, classificação e resultados sem precisar entrar na sua conta."
      />

      <div className="mb-7 grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="max-w-xl">
          <SearchBar
            placeholder="Buscar campeonatos..."
            value={busca}
            onChange={setBusca}
          />
        </div>
        <p className="text-sm text-muted-foreground sm:text-right">
          <span className="font-semibold text-foreground">{lista.length}</span>{' '}
          competições visíveis
        </p>
      </div>

      {lista.length === 0 ? (
        <PublicState
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Tente outro termo de busca. Quando novos campeonatos públicos estiverem disponíveis, eles aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((campeonato, index) => (
            <Link
              key={campeonato.id}
              to={`/campeonatos/${campeonato.id}`}
              className={cn(
                'group relative overflow-hidden rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_10px_30px_rgba(30,54,43,0.06)] transition-[border-color,box-shadow] duration-150 hover:border-green-light hover:shadow-[0_14px_36px_rgba(30,54,43,0.10)] sm:p-6',
                cardFocus,
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-green-mid/70" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                    {index === 0 ? 'Em destaque' : campeonato.modalidade}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold tracking-[-0.03em] transition-colors duration-150 group-hover:text-green-dark sm:text-2xl">
                    {campeonato.nome}
                  </h2>
                  <CampeonatoMeta cidade={campeonato.cidade} icon={MapPin} />
                </div>
                <StatusBadge status={campeonato.status} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" /> {campeonato.times} times
                </span>
                <span className="rounded-full bg-muted px-3 py-1.5">
                  {campeonato.formato}
                </span>
              </div>

              <div className="mt-6 flex min-h-11 items-center justify-between text-sm font-semibold text-green-dark">
                Ver campeonato
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-pale transition-colors duration-150 group-hover:bg-green-light/30">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function PublicCampeonatoDetailPage() {
  const { id } = useParams();
  const campeonato = campeonatos.find((item) => String(item.id) === String(id));
  const [tab, setTab] = useState('Visão geral');

  if (!campeonato) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <PublicState
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto ou este campeonato pode não estar disponível publicamente."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
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
              <TabelaClassificacao />
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
          <TabelaClassificacao />
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
                <p className="mt-1 text-sm text-muted-foreground">{time.cidade}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors duration-150 group-hover:text-green-dark" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
