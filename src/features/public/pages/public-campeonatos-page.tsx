import { ArrowRight, MapPin } from 'lucide-react';
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
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader
        eyebrow="Competições"
        title="Campeonatos"
        description="Acompanhe o andamento das competições, consulte formatos, cidades, classificação e resultados."
      />

      <div className="mb-7 max-w-lg">
        <SearchBar placeholder="Buscar campeonatos..." value={busca} onChange={setBusca} />
      </div>

      {lista.length === 0 ? (
        <PublicState
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Tente outro termo de busca. Quando novos campeonatos públicos estiverem disponíveis, eles aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((campeonato) => (
            <Link
              key={campeonato.id}
              to={`/campeonatos/${campeonato.id}`}
              className="group flex min-h-56 flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-green-light hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {campeonato.modalidade}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] group-hover:text-green-dark">
                    {campeonato.nome}
                  </h2>
                  <CampeonatoMeta cidade={campeonato.cidade} icon={MapPin} />
                </div>
                <StatusBadge status={campeonato.status} />
              </div>

              <div className="mt-6 border-t border-border/70 pt-4">
                <CampeonatoMeta
                  times={campeonato.times}
                  formato={campeonato.formato}
                />
              </div>

              <div className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-green-dark">
                Ver campeonato
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <PublicState
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto ou este campeonato pode não estar disponível publicamente."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader
        eyebrow={`${campeonato.modalidade} · ${campeonato.cidade}`}
        title={campeonato.nome}
        description={`${campeonato.formato} · Rodada ${campeonato.rodada}`}
        action={<StatusBadge status={campeonato.status} />}
      />

      <div className="mb-8 rounded-2xl border border-border/80 bg-white px-3 pt-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <Tabs
          tabs={['Visão geral', 'Classificação', 'Partidas', 'Times']}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'Visão geral' ? (
        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <Section title="Classificação">
            <TabelaClassificacao />
          </Section>
          <Section title="Últimos resultados">
            <div className="rounded-2xl border border-border/80 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
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
        </div>
      ) : null}

      {tab === 'Classificação' ? <TabelaClassificacao /> : null}
      {tab === 'Partidas' ? <ListaJogos /> : null}
      {tab === 'Times' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {times.map((time) => (
            <Link
              key={time.id}
              to={`/times/${time.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-white p-5 transition-all hover:border-green-light hover:shadow-sm"
            >
              <div>
                <p className="font-display font-semibold group-hover:text-green-dark">{time.nome}</p>
                <p className="mt-1 text-sm text-muted-foreground">{time.cidade}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-dark" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
