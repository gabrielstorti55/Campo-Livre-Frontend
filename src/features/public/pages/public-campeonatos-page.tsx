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

      <div className="mb-7 grid gap-4 rounded-2xl bg-white p-4 shadow-[0_12px_36px_rgba(30,54,43,0.06)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
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
              className="group relative overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_12px_35px_rgba(30,54,43,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(30,54,43,0.12)] sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-green-mid/70" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                    {index === 0 ? 'Em destaque' : campeonato.modalidade}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-green-dark sm:text-2xl">
                    {campeonato.nome}
                  </h2>
                  <CampeonatoMeta cidade={campeonato.cidade} icon={MapPin} />
                </div>
                <StatusBadge status={campeonato.status} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-black/6 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f7f4] px-3 py-1.5">
                  <Users className="h-3.5 w-3.5" /> {campeonato.times} times
                </span>
                <span className="rounded-full bg-[#f5f7f4] px-3 py-1.5">
                  {campeonato.formato}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-green-dark">
                Ver campeonato
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-pale transition-transform group-hover:translate-x-1">
                  <ArrowUpRight className="h-4 w-4" />
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

      <div className="mb-7 overflow-hidden rounded-2xl bg-white px-2 pt-1 shadow-[0_10px_30px_rgba(30,54,43,0.06)] sm:px-4">
        <Tabs
          tabs={['Visão geral', 'Classificação', 'Partidas', 'Times']}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'Visão geral' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
            <Section title="Classificação">
              <TabelaClassificacao />
            </Section>
          </section>

          <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
            <Section title="Últimos resultados">
              <div>
                {partidas
                  .filter((partida) => partida.concluida)
                  .map((partida) => (
                    <Link key={partida.id} to={`/partidas/${partida.id}`}>
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
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
          <TabelaClassificacao />
        </div>
      ) : null}

      {tab === 'Partidas' ? (
        <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
          <ListaJogos />
        </div>
      ) : null}

      {tab === 'Times' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {times.map((time) => (
            <Link
              key={time.id}
              to={`/times/${time.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(30,54,43,0.06)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <p className="font-display font-semibold group-hover:text-green-dark">
                  {time.nome}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{time.cidade}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-green-dark" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
