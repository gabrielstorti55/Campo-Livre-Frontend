import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CampeonatoMeta } from '@/features/campeonatos/components/campeonato-meta';
import {
  ListaJogos,
  ResultadoRow,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { PublicState } from '@/features/public/components/public-state';
import { campeonatos, partidas, times } from '@/mocks/data';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
  PageHeader,
  SearchBar,
  Section,
  Tabs,
} from '@/shared/components/campo-livre-ui';

export function PublicCampeonatosPage() {
  const [busca, setBusca] = useState('');
  const lista = campeonatos.filter((campeonato) =>
    campeonato.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title="Campeonatos"
        subtitle="Competições, classificações e resultados disponíveis ao público"
      />

      <SearchBar
        placeholder="Buscar campeonatos..."
        value={busca}
        onChange={setBusca}
      />

      {lista.length === 0 ? (
        <PublicState
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Tente outro termo de busca. Quando novos campeonatos públicos estiverem disponíveis, eles aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((campeonato) => (
            <Card key={campeonato.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/campeonatos/${campeonato.id}`}
                    className="font-display font-semibold text-foreground hover:text-green-mid"
                  >
                    {campeonato.nome}
                  </Link>
                  <CampeonatoMeta cidade={campeonato.cidade} icon={MapPin} />
                </div>
                <StatusBadge status={campeonato.status} />
              </div>

              <CampeonatoMeta
                times={campeonato.times}
                modalidade={campeonato.modalidade}
                formato={campeonato.formato}
              />

              <Link
                to={`/campeonatos/${campeonato.id}`}
                className="mt-auto rounded-md border border-green-dark px-4 py-2.5 text-center text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale"
              >
                Ver campeonato
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function PublicCampeonatoDetailPage() {
  const { id } = useParams();
  const campeonato = campeonatos.find(
    (item) => String(item.id) === String(id),
  );
  const [tab, setTab] = useState('Visão geral');

  if (!campeonato) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <PublicState
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto ou este campeonato pode não estar disponível publicamente."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title={campeonato.nome}
        subtitle={`${campeonato.modalidade} · ${campeonato.formato} · ${campeonato.cidade}`}
        actions={<StatusBadge status={campeonato.status} />}
      />

      <Tabs
        tabs={['Visão geral', 'Classificação', 'Partidas', 'Times']}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Visão geral' ? (
        <div className="space-y-8">
          <Section title="Classificação">
            <TabelaClassificacao />
          </Section>

          <Section title="Últimos resultados">
            <div className="rounded-xl border border-border bg-white px-4">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {times.map((time) => (
            <Link
              key={time.id}
              to={`/times/${time.id}`}
              className="rounded-xl border border-border bg-white p-4 transition-colors hover:border-green-light"
            >
              <p className="font-display font-semibold">{time.nome}</p>
              <p className="mt-1 text-sm text-muted-foreground">{time.cidade}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
